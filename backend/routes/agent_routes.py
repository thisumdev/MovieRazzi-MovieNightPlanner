# app/routes/agent_routes.py
from fastapi import APIRouter, HTTPException
from agents.preference_analyzer import analyze_preferences
from agents.ir_agent import retrieve_movies
from agents.orchestrator_agent import orchestrate_user_request
from agents.shedule_creator_agent import create_schedule
from schemas.agent_schema import AnalyzeRequest, RetrieveRequest, OrchestrateRequest, ScheduleRequest

router = APIRouter()

@router.post("/analyze")
def analyze_agent(data: AnalyzeRequest):
    try:
        return analyze_preferences(data.user_input)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Analyzer failed: {str(e)}")

@router.post("/retrieve")
def retrieve_agent(data: RetrieveRequest):
    try:
        return retrieve_movies(data.preferences)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Retriever failed: {str(e)}")

@router.post("/orchestrate")
def orchestrator_route(data: OrchestrateRequest):
    try:
        return orchestrate_user_request(data.user_input, data.schedule_text)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Orchestrator failed: {str(e)}")

@router.post("/schedule")
def schedule_agent(data: ScheduleRequest):
    """
    Schedule creator agent route.
    Expects: { movies: [...], schedule_text: "I am free for 2 hours on Monday..." }
    """
    try:
        return create_schedule(data.movies, data.schedule_text)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Schedule creation failed: {str(e)}")
