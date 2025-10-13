
from agents.preference_analyzer import analyze_preferences
from agents.ir_agent import retrieve_movies
from agents.shedule_creator_agent import create_schedule


def orchestrate_user_request(user_input: str, schedule_text: str = None):
    """
    Orchestrates the entire flow:
    - Analyze preferences
    - Retrieve matching movies
    - Optionally generate schedule (if schedule_text provided)
    """
    try:
        analysis = analyze_preferences(user_input)
        if "error" in analysis:
            return {"error": analysis["error"]}

        movies = retrieve_movies(analysis)

        schedule = None
        if schedule_text and movies:
            schedule = create_schedule(movies, schedule_text)

        return {"analysis": analysis, "movies": movies, "schedule": schedule}

    except Exception as e:
        return {"error": f"Orchestrator failed: {str(e)}"}


