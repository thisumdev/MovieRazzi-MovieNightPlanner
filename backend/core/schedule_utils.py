import re
from typing import Optional, Dict
from datetime import datetime, timedelta

class TimeParser:
    @staticmethod
    def parse_time_to_minutes(time_str: str) -> int:
        """Convert '1.5 hours', '90 minutes', '2h 30m' to minutes"""
        time_str = time_str.lower()
        
        # Pattern for hours and minutes
        hours_pattern = r'(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)'
        minutes_pattern = r'(\d+)\s*(?:minutes?|mins?|m)'
        
        hours_match = re.search(hours_pattern, time_str)
        minutes_match = re.search(minutes_pattern, time_str)
        
        total_minutes = 0
        
        if hours_match:
            hours = float(hours_match.group(1))
            total_minutes += int(hours * 60)
            
        if minutes_match:
            minutes = int(minutes_match.group(1))
            total_minutes += minutes
            
        return total_minutes if total_minutes > 0 else 120  # Default 2 hours

    @staticmethod
    def parse_time_slot(time_str: str) -> Optional[str]:
        """Extract time like '8pm', '20:00', '8:30' and convert to 24hr format"""
        time_str = time_str.lower().strip()
        
        # Pattern for times like "8pm", "8:30pm", "20:00"
        time_patterns = [
            r'(\d{1,2})(?::(\d{2}))?\s*(am|pm)',  # 8pm, 8:30pm
            r'(\d{1,2}):(\d{2})',                 # 20:00, 08:30
            r'(\d{1,2})\s*(pm|am)',               # 8 pm
        ]
        
        for pattern in time_patterns:
            match = re.search(pattern, time_str)
            if match:
                hour = int(match.group(1))
                minute = int(match.group(2)) if match.group(2) else 0
                
                # Handle AM/PM
                if len(match.groups()) >= 3 and match.group(3):
                    am_pm = match.group(3)
                    if am_pm == 'pm' and hour != 12:
                        hour += 12
                    elif am_pm == 'am' and hour == 12:
                        hour = 0
                
                return f"{hour:02d}:{minute:02d}"
        
        return None

class AvailabilityParser:
    @staticmethod
    def parse_availability(text: str) -> Dict:
        """Parse natural language availability into structured data"""
        text = text.lower()
        result = {
            'weekday_start_time': None,
            'weekday_duration': None,
            'weekend_start_time': None,
            'weekend_duration': None
        }
        
        # Split by common separators
        sentences = re.split(r'[,.]|\sand\s|\sbut\s', text)
        
        for sentence in sentences:
            sentence = sentence.strip()
            
            # Check if it's about weekdays or weekends
            is_weekday = any(word in sentence for word in ['weekday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'work'])
            is_weekend = any(word in sentence for word in ['weekend', 'saturday', 'sunday'])
            
            # If not specified, assume it applies to both
            if not is_weekday and not is_weekend:
                is_weekday = is_weekend = True
            
            # Extract time
            time_match = TimeParser.parse_time_slot(sentence)
            
            # Extract duration
            duration_minutes = TimeParser.parse_time_to_minutes(sentence)
            
            if time_match:
                if is_weekday:
                    result['weekday_start_time'] = time_match
                    result['weekday_duration'] = duration_minutes
                if is_weekend:
                    result['weekend_start_time'] = time_match
                    result['weekend_duration'] = duration_minutes
        
        return result

class ScheduleOptimizer:
    @staticmethod
    def filter_movies_by_duration(movies: list, max_duration: int) -> list:
        """Filter movies that fit within available time"""
        return [movie for movie in movies if movie['duration'] <= max_duration]
    
    @staticmethod
    def optimize_schedule(movies: list, weekday_duration: int, weekend_duration: int) -> Dict:
        """Optimize movie scheduling based on available time slots"""
        weekday_movies = []
        weekend_movies = []
        unscheduled = []
        
        # Sort movies by duration (shortest first for better fitting)
        sorted_movies = sorted(movies, key=lambda x: x['duration'])
        
        weekday_remaining = weekday_duration
        weekend_remaining = weekend_duration
        
        for movie in sorted_movies:
            duration = movie['duration']
            
            # Try to fit in weekday slot first
            if duration <= weekday_remaining:
                weekday_movies.append(movie)
                weekday_remaining -= duration
            # Try weekend slot
            elif duration <= weekend_remaining:
                weekend_movies.append(movie)
                weekend_remaining -= duration
            else:
                unscheduled.append(movie['title'])
        
        return {
            'weekday_movies': weekday_movies,
            'weekend_movies': weekend_movies,
            'unscheduled': unscheduled
        }
