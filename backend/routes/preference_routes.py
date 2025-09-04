from fastapi import APIRouter
from schemas.preferences import Preferences
from agents.preference_analyzer import analyze_preferences

router = APIRouter(
    prefix="/preferences",
    tags=["Preference Analyzer"]
)

@router.post("/analyze")
def analyze(preferences: Preferences):
    result = analyze_preferences(preferences.user_input)
    return {"success": True, "preferences": result} 