
import os
import re
import logging
import requests

logger = logging.getLogger("schedule_agent")

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TMDB_BASE = "https://api.themoviedb.org/3"

DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]



#TMDB runtime fetch

def get_movie_runtime(movie_id: int) -> int:
    try:
        if not TMDB_API_KEY:
            return 120
        res = requests.get(
            f"{TMDB_BASE}/movie/{movie_id}",
            params={"api_key": TMDB_API_KEY},
            timeout=10,
        )
        if res.ok:
            return int(res.json().get("runtime") or 120)
    except Exception as e:
        logger.warning(f"Runtime fetch failed for {movie_id}: {e}")
    return 120



#Parse user free time

def parse_user_free_time(text: str):
    """
    Parse free time phrases like:
      "I am free for 3 hours on monday and 4 hours on friday after 6pm"
    """
    text = text.lower()
    slots = []

    for phrase in re.split(r"[,\;]? and |,|\;", text):
        phrase = phrase.strip()
        if not phrase:
            continue

        # mixed format: 1h30min / 1 hour and 30 min
        mixed = re.search(
            r"(\d+)\s*(?:h|hour|hours)[^\d](\d{1,2})?\s(?:m|min|minutes)?", phrase
        )
        if mixed:
            hours = int(mixed.group(1))
            mins = int(mixed.group(2) or 0)
            total = hours * 60 + mins
        else:
            hours = sum(float(x) for x in re.findall(r"(\d+(?:\.\d+)?)\s*(?:hours|hour)", phrase))
            mins = sum(float(x) for x in re.findall(r"(\d+(?:\.\d+)?)\s*(?:minutes|min)", phrase))
            total = int(hours * 60 + mins)

        if total <= 0:
            continue

        # detect start time (after 6pm)
        time_match = re.search(r"(after|from)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?", phrase)
        start_hour = 18
        if time_match:
            hour = int(time_match.group(2))
            if time_match.group(4) and time_match.group(4).lower() == "pm" and hour < 12:
                hour += 12
            start_hour = hour

        # detect day(s)
        found_days = [d for d in DAYS if d in phrase]
        if not found_days:
            found_days = [d for d in DAYS if d in text]

        for d in found_days:
            total = round(total / 5) * 5
            slots.append({"day": d.capitalize(), "available_minutes": int(total), "start_hour": start_hour})

    if not slots:
        slots = [{"day": "Friday", "available_minutes": 120, "start_hour": 18}]

    # merge duplicate days
    merged = {}
    for s in slots:
        key = s["day"]
        if key not in merged:
            merged[key] = s
        else:
            merged[key]["available_minutes"] = max(
                merged[key]["available_minutes"], s["available_minutes"]
            )
            merged[key]["start_hour"] = s["start_hour"]

    return list(merged.values())


# 
# Create grouped schedule (1 per day)
#
def create_schedule(movies: list, user_text: str):
    """
    Group movies within one slot per free day.
    Ensures combined runtime ≤ available time.
    """
    try:
        slots = parse_user_free_time(user_text)
        if not slots:
            return {"error": "No valid time slots detected."}

        # attach accurate runtimes
        for m in movies:
            try:
                m["runtime"] = int(m.get("runtime") or get_movie_runtime(m["id"]))
            except Exception:
                m["runtime"] = 120

        movies_sorted = sorted(movies, key=lambda x: x["runtime"])
        schedule = []

        for slot in slots:
            remaining = slot["available_minutes"]
            chosen = []
            total_used = 0

            for m in movies_sorted:
                runtime = m["runtime"]
                if runtime <= remaining:
                    chosen.append({
                        "title": m["title"],
                        "runtime": runtime
                    })
                    remaining -= runtime
                    total_used += runtime
                if remaining < 30:
                    break

            schedule.append({
                "day": slot["day"],
                "slot_duration": slot["available_minutes"],
                "start_hour": slot["start_hour"],
                "movies": chosen,
                "total_runtime": total_used,
                "reason": f"{len(chosen)} movie(s) perfectly fill your {slot['available_minutes']} min slot on {slot['day']}."
            })

        summary = {
            "total_slots": len(slots),
            "total_movies": sum(len(s["movies"]) for s in schedule),
            "total_watch_time": f"{sum(s['total_runtime'] for s in schedule)} min",
        }

        return {"slots": slots, "schedule": schedule, "summary": summary}

    except Exception as e:
        logger.error(f"Schedule generation failed: {e}")
        return {"error": f"Schedule generation failed: {str(e)}"}