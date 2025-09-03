from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class MovieItem(BaseModel):
    title: str
    duration: int  # in minutes
    genre: str
    rating: Optional[float] = None

class UserAvailabilityInput(BaseModel):
    availability_text: str  # Natural language: "weekdays after 8pm for 1.5 hours"

class UserAvailabilityParsed(BaseModel):
    weekday_start_time: Optional[str] = None
    weekday_duration: Optional[int] = None  # minutes
    weekend_start_time: Optional[str] = None
    weekend_duration: Optional[int] = None  # minutes

class ScheduleRequest(BaseModel):
    movies: List[MovieItem]
    availability: UserAvailabilityInput

class ScheduledMovie(BaseModel):
    movie: str
    duration: int
    day_type: str  # "weekday" or "weekend"
    time_slot: str  # "20:00 - 22:00"
    scheduled_date: Optional[str] = None

class ScheduleResponse(BaseModel):
    scheduled_movies: List[ScheduledMovie]
    total_movies: int
    unscheduled_movies: List[str]
