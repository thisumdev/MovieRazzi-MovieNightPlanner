from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from schemas.schedule import ScheduleRequest, ScheduleResponse
from agents.schedule_creator import ScheduleCreatorAgent
from core.dependencies import get_current_user

router = APIRouter()
agent = ScheduleCreatorAgent()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/create-schedule", response_model=ScheduleResponse)
def create_movie_schedule(
    request: ScheduleRequest,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create optimized movie schedule based on user availability"""
    try:
        result = agent.process_schedule_request(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Schedule creation failed: {str(e)}")

@router.post("/test-schedule")
def test_schedule_endpoint(request: ScheduleRequest):
    """Test endpoint without authentication"""
    return agent.process_schedule_request(request)
