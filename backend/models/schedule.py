from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from app.database import Base
from datetime import datetime

class Schedule(Base):
    __tablename__ = "schedules"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)  # Link to user
    movie_title = Column(String, nullable=False)
    movie_duration = Column(Integer, nullable=False)  # in minutes
    scheduled_date = Column(DateTime, nullable=False)
    time_slot_start = Column(String, nullable=False)  # e.g., "20:00"
    time_slot_end = Column(String, nullable=False)    # e.g., "22:00"
    day_type = Column(String, nullable=False)         # "weekday" or "weekend"
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserAvailability(Base):
    __tablename__ = "user_availability"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    weekday_start_time = Column(String)      # e.g., "20:00"
    weekday_duration = Column(Integer)       # available minutes on weekdays
    weekend_start_time = Column(String)      # e.g., "18:00"
    weekend_duration = Column(Integer)       # available minutes on weekends
    created_at = Column(DateTime, default=datetime.utcnow)
