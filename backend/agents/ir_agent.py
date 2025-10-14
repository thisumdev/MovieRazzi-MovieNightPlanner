import os
import logging
import requests
from fuzzywuzzy import fuzz
from dotenv import load_dotenv


#  Load API key and setup

load_dotenv()
logger = logging.getLogger("ir_agent")

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TMDB_BASE_URL = "https://api.themoviedb.org/3"

if TMDB_API_KEY:
    print("TMDB_API_KEY loaded successfully inside ir_agent.py")
else:
    logger.error("TMDB_API_KEY not found. Check your .env file!")


#  Known actor list for fuzzy name correction

KNOWN_ACTORS = [
    "Tom Holland", "Henry Cavill", "Emma Stone", "Ryan Gosling",
    "Chris Hemsworth", "Robert Downey Jr", "Scarlett Johansson",
    "Zendaya", "Chris Evans", "Tom Cruise", "Dwayne Johnson",
    "Margot Robbie", "Hugh Jackman", "Gal Gadot", "Ryan Reynolds",
    "Benedict Cumberbatch", "Vin Diesel", "Mark Ruffalo", "Natalie Portman",
    "Chris Pratt", "Amy Adams", "Anne Hathaway", "Leonardo DiCaprio"
]


#  Helper Functions

def correct_name(name: str) -> str:
    """Return best fuzzy match to known actors."""
    best, score = name, 0
    for known in KNOWN_ACTORS:
        s = fuzz.partial_ratio(name.lower(), known.lower())
        if s > score:
            best, score = known, s
    return best if score >= 70 else name


def search_person(name: str):
    """Search TMDB for an actor and return their ID."""
    try:
        res = requests.get(
            f"{TMDB_BASE_URL}/search/person",
            params={"api_key": TMDB_API_KEY, "query": name, "language": "en-US"},
            timeout=10,
        )
        data = res.json()
        if data.get("results"):
            pid = data["results"][0]["id"]
            logger.info(f"Found TMDB person: {name} (id={pid})")
            return pid
    except Exception as e:
        logger.error(f"TMDB person search failed: {e}")
    return None


def get_movies_by_person(person_id: int):
    """Return top movies for a given person_id (filtering out cameos, voice, etc.)."""
    try:
        res = requests.get(
            f"{TMDB_BASE_URL}/person/{person_id}/movie_credits",
            params={"api_key": TMDB_API_KEY, "language": "en-US"},
            timeout=10,
        )
        data = res.json()
        cast = data.get("cast", [])

        # Filter: remove uncredited, voice, archive roles, and keep only major roles
        filtered = [
            m for m in cast
            if m.get("character")
            and not any(x in m["character"].lower() for x in ["uncredited", "voice", "archive"])
            and abs(m.get("order", 999)) < 15
        ]
        return filtered
    except Exception as e:
        logger.error(f"TMDB get_movies_by_person failed: {e}")
        return []


def search_movies_by_keyword(keyword: str):
    """Keyword or genre search fallback."""
    try:
        res = requests.get(
            f"{TMDB_BASE_URL}/search/movie",
            params={
                "api_key": TMDB_API_KEY,
                "query": keyword,
                "language": "en-US",
                "page": 1,
                "include_adult": False,
            },
            timeout=10,
        )
        return res.json().get("results", [])
    except Exception as e:
        logger.error(f"Keyword search failed: {e}")
        return []


def filter_movies_by_genre(movies, genres):
    """Filter movie list by detected genre names."""
    genre_map = {
        "action": 28, "drama": 18, "sci-fi": 878, "thriller": 53,
        "comedy": 35, "fantasy": 14, "animation": 16, "horror": 27,
        "romance": 10749, "adventure": 12
    }

    genre_ids = [genre_map[g] for g in genres if g in genre_map]
    if not genre_ids:
        return movies

    filtered = []
    for m in movies:
        m_genres = m.get("genre_ids", [])
        if any(gid in genre_ids for gid in m_genres):
            filtered.append(m)
    return filtered



#  Add runtime to movies

def add_runtime(movie):
    """Fetch movie runtime and attach it to the dict."""
    try:
        res = requests.get(
            f"{TMDB_BASE_URL}/movie/{movie['id']}",
            params={"api_key": TMDB_API_KEY, "language": "en-US"},
            timeout=10,
        )
        if res.ok:
            data = res.json()
            movie["runtime"] = data.get("runtime", 120)
        else:
            movie["runtime"] = 120
    except Exception as e:
        logger.warning(f"Runtime fetch failed for movie {movie.get('id')}: {e}")
        movie["runtime"] = 120
    return movie



#  Main Retrieval Logic

def retrieve_movies(preference_data: dict):
    genres = preference_data.get("detected_genres", [])
    people = preference_data.get("entities", {}).get("people", [])
    results, seen = [], set()

    logger.info(f"Retrieving for genres={genres}, people={people}")

    #Combined actor + genre logic (this is the highest priority)
    for person in people:
        corrected = correct_name(person)
        pid = search_person(corrected)
        if not pid:
            continue

        actor_movies = get_movies_by_person(pid)
        if genres:
            actor_movies = filter_movies_by_genre(actor_movies, genres)

        for m in actor_movies[:15]:
            mid = m.get("id")
            title = m.get("title")
            if not mid or mid in seen or not title:
                continue
            seen.add(mid)
            enriched = add_runtime(m)
            results.append({
                "id": enriched["id"],
                "title": enriched["title"],
                "runtime": enriched.get("runtime", 120),
                "overview": enriched.get("overview", ""),
                "poster_path": (
                    f"https://image.tmdb.org/t/p/w500{enriched['poster_path']}"
                    if enriched.get("poster_path") else None
                ),
                "reason": f"Stars {corrected} and matches your interest in {', '.join(genres) or 'movies'}."
            })

    # If no actor-based results, search by genres only
    if not results and genres:
        for g in genres:
            genre_movies = search_movies_by_keyword(g)
            for m in genre_movies[:15]:
                mid = m.get("id")
                if not mid or mid in seen:
                    continue
                seen.add(mid)
                enriched = add_runtime(m)
                results.append({
                    "id": enriched["id"],
                    "title": enriched["title"],
                    "runtime": enriched.get("runtime", 120),
                    "overview": enriched.get("overview", ""),
                    "poster_path": (
                        f"https://image.tmdb.org/t/p/w500{enriched['poster_path']}"
                        if enriched.get("poster_path") else None
                    ),
                    "reason": f"Matches your preference for {g} movies."
                })

    # Popular fallback - no genres or people detected
    if not results:
        logger.warning("No direct matches, fetching popular fallback movies.")
        try:
            res = requests.get(
                f"{TMDB_BASE_URL}/movie/popular",
                params={"api_key": TMDB_API_KEY, "language": "en-US", "page": 1},
                timeout=10,
            )
            for m in res.json().get("results", [])[:10]:
                mid = m.get("id")
                if not mid or mid in seen:
                    continue
                seen.add(mid)
                enriched = add_runtime(m)
                results.append({
                    "id": enriched["id"],
                    "title": enriched["title"],
                    "runtime": enriched.get("runtime", 120),
                    "overview": enriched.get("overview", ""),
                    "poster_path": (
                        f"https://image.tmdb.org/t/p/w500{enriched['poster_path']}"
                        if enriched.get("poster_path") else None
                    ),
                    "reason": "Popular fallback movie."
                })
        except Exception as e:
            logger.error(f"Popular fallback failed: {e}")

    logger.info(f" Retrieved {len(results)} refined movies (with runtime).")
    return results