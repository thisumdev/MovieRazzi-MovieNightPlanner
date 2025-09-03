import sys
import os
from typing import List, Dict
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from schemas.schedule import (
    ScheduleRequest, ScheduleResponse, ScheduledMovie, 
    UserAvailabilityParsed, MovieItem
)
from core.schedule_utils import AvailabilityParser, ScheduleOptimizer, TimeParser
from datetime import datetime, timedelta


class ScheduleCreatorAgent:
    def __init__(self):
        self.name = "Schedule Creator Agent"
        self.version = "1.0.0"
    
    def process_schedule_request(self, request: ScheduleRequest) -> ScheduleResponse:
        """Main method to create movie schedule"""
        try:
            # Step 1: Parse user availability from natural language
            availability = self._parse_availability(request.availability.availability_text)
            
            # Step 2: Filter movies based on available time slots
            filtered_movies = self._filter_movies_by_availability(
                request.movies, availability
            )
            
            # Step 3: Optimize and create schedule
            schedule = self._create_optimized_schedule(filtered_movies, availability)
            
            return ScheduleResponse(**schedule)
            
        except Exception as e:
            print(f"Error in schedule creation: {e}")
            return ScheduleResponse(
                scheduled_movies=[],
                total_movies=0,
                unscheduled_movies=[movie.title for movie in request.movies]
            )
    
    def _parse_availability(self, availability_text: str) -> UserAvailabilityParsed:
        """Parse natural language availability into structured format"""
        parsed = AvailabilityParser.parse_availability(availability_text)
        return UserAvailabilityParsed(**parsed)
    
    def _filter_movies_by_availability(self, movies: List[MovieItem], availability: UserAvailabilityParsed) -> Dict:
        """Filter movies that can fit in available time slots"""
        movie_dicts = [movie.dict() for movie in movies]
        
        # Get max available durations
        weekday_duration = availability.weekday_duration or 0
        weekend_duration = availability.weekend_duration or 0
        
        # If no availability parsed, default to 2 hours
        if weekday_duration == 0 and weekend_duration == 0:
            weekday_duration = weekend_duration = 120
        
        # Filter movies for each time slot
        weekday_fits = ScheduleOptimizer.filter_movies_by_duration(movie_dicts, weekday_duration)
        weekend_fits = ScheduleOptimizer.filter_movies_by_duration(movie_dicts, weekend_duration)
        
        return {
            'weekday_movies': weekday_fits,
            'weekend_movies': weekend_fits,
            'weekday_duration': weekday_duration,
            'weekend_duration': weekend_duration
        }
    
    def _create_optimized_schedule(self, filtered_data: Dict, availability: UserAvailabilityParsed) -> Dict:
        """Create optimized schedule from filtered movies"""
        # Combine available movies
        all_available = list(set(
            tuple(movie.items()) for movie in 
            filtered_data['weekday_movies'] + filtered_data['weekend_movies']
        ))
        available_movies = [dict(movie) for movie in all_available]
        
        # Optimize scheduling
        optimized = ScheduleOptimizer.optimize_schedule(
            available_movies,
            filtered_data['weekday_duration'],
            filtered_data['weekend_duration']
        )
        
        # Create scheduled movie objects
        scheduled_movies = []
        
        # Add weekday movies
        for movie in optimized['weekday_movies']:
            time_slot = self._create_time_slot(
                availability.weekday_start_time or "20:00", 
                movie['duration']
            )
            scheduled_movies.append(ScheduledMovie(
                movie=movie['title'],
                duration=movie['duration'],
                day_type="weekday",
                time_slot=time_slot
            ))
        
        # Add weekend movies
        for movie in optimized['weekend_movies']:
            time_slot = self._create_time_slot(
                availability.weekend_start_time or "19:00", 
                movie['duration']
            )
            scheduled_movies.append(ScheduledMovie(
                movie=movie['title'],
                duration=movie['duration'],
                day_type="weekend",
                time_slot=time_slot
            ))
        
        return {
            'scheduled_movies': scheduled_movies,
            'total_movies': len(scheduled_movies),
            'unscheduled_movies': optimized['unscheduled']
        }
    
    def _create_time_slot(self, start_time: str, duration_minutes: int) -> str:
        """Create time slot string like '20:00 - 22:00'"""
        try:
            start = datetime.strptime(start_time, "%H:%M")
            end = start + timedelta(minutes=duration_minutes)
            return f"{start.strftime('%H:%M')} - {end.strftime('%H:%M')}"
        except:
            return f"{start_time} - {start_time}"

# Standalone testing function
def test_schedule_agent():
    """Test the agent with sample data"""
    agent = ScheduleCreatorAgent()
    
    # Sample movies (simulating input from Movie Selector Agent)
    sample_movies = [
        MovieItem(title="Mission Impossible", duration=147, genre="Action"),
        MovieItem(title="The Matrix", duration=136, genre="Sci-Fi"),
        MovieItem(title="Inception", duration=148, genre="Sci-Fi"),
        MovieItem(title="John Wick", duration=101, genre="Action"),
        MovieItem(title="Interstellar", duration=169, genre="Sci-Fi")
    ]
    
    # Test cases
    test_cases = [
        "Weekdays I'm free after 8pm for 2 hours, weekends after 6pm for 3 hours",
        "I have 90 minutes on weekdays after 9pm, weekends I'm free after 7pm for 2.5 hours",
        "Free after 8pm for 1.5 hours on weekdays, weekends after 6pm for 4 hours"
    ]
    
    for i, availability_text in enumerate(test_cases):
        print(f"\n🧪 TEST CASE {i+1}")
        print(f"Availability: {availability_text}")
        
        request = ScheduleRequest(
            movies=sample_movies,
            availability={"availability_text": availability_text}
        )
        
        result = agent.process_schedule_request(request)
        
        print(f"\n📅 SCHEDULE RESULTS:")
        print(f"Total scheduled: {result.total_movies}")
        
        for scheduled in result.scheduled_movies:
            print(f"  🎬 {scheduled.movie} ({scheduled.duration}min)")
            print(f"     {scheduled.day_type.title()}: {scheduled.time_slot}")
        
        if result.unscheduled_movies:
            print(f"\n❌ Couldn't schedule: {', '.join(result.unscheduled_movies)}")

if __name__ == "__main__":
    test_schedule_agent()
