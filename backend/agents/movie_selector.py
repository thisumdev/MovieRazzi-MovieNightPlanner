import os
import time
from typing import List, Dict, Any, Optional, Tuple

import requests



try:
    from dotenv import load_dotenv
    load_dotenv()   # loads backend/.env into process env
except Exception:
    pass



# Optional semantic reranking
try:
    from sentence_transformers import SentenceTransformer, util
    _SEM_MODEL = SentenceTransformer("all-MiniLM-L6-v2")
except Exception:
    _SEM_MODEL = None  # If packages aren’t installed, run without semantic rerank

TMDB_API_KEY = os.getenv("TMDB_API_KEY", "").strip()
TMDB_BASE = "https://api.themoviedb.org/3"


def _tmdb_headers() -> Dict[str, str]:
    # Using v3 api_key via query string; header remains simple.
    return {"Accept": "application/json"}


def _q(params: Dict[str, Any]) -> Dict[str, Any]:
    params = {k: v for k, v in params.items() if v is not None}
    params["api_key"] = TMDB_API_KEY
    return params


def _get(url: str, params: Dict[str, Any]) -> Dict[str, Any]:
    r = requests.get(url, params=_q(params), headers=_tmdb_headers(), timeout=15)
    r.raise_for_status()
    return r.json()


def tmdb_genre_map() -> Dict[str, int]:
    url = f"{TMDB_BASE}/genre/movie/list"
    data = _get(url, {})
    return {g["name"].lower(): g["id"] for g in data.get("genres", [])}


def search_person_ids(actors: List[str]) -> List[int]:
    ids: List[int] = []
    for name in actors:
        if not name:
            continue
        url = f"{TMDB_BASE}/search/person"
        data = _get(url, {"query": name, "include_adult": False})
        results = data.get("results", [])
        if results:
            ids.append(results[0]["id"])  # FIX: index first element, then "id"
        time.sleep(0.15)
    return ids



def discover_movies(
    genre_ids: List[int],
    person_ids: List[int],
    decade: Optional[str],
    page_limit: int = 3,
) -> List[Dict[str, Any]]:
    movies: List[Dict[str, Any]] = []
    primary_release_gte = None
    primary_release_lte = None
    if decade:
        try:
            start = int(decade[:4])
            primary_release_gte = f"{start}-01-01"
            primary_release_lte = f"{start + 9}-12-31"
        except Exception:
            pass

    for page in range(1, page_limit + 1):
        url = f"{TMDB_BASE}/discover/movie"
        params = {
            "with_genres": ",".join(map(str, genre_ids)) if genre_ids else None,
            "with_cast": ",".join(map(str, person_ids)) if person_ids else None,
            "include_adult": False,
            "sort_by": "popularity.desc",
            "page": page,
            "primary_release_date.gte": primary_release_gte,
            "primary_release_date.lte": primary_release_lte,
            "language": "en-US",
        }
        data = _get(url, params)
        movies.extend(data.get("results", []))
        time.sleep(0.15)
    return movies


def movie_details(movie_id: int) -> Dict[str, Any]:
    url = f"{TMDB_BASE}/movie/{movie_id}"
    params = {
        "append_to_response": "credits",
        "language": "en-US",
    }
    return _get(url, params)


def normalize_movies(raw_movies: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for m in raw_movies:
        out.append(
            {
                "id": m.get("id"),
                "title": m.get("title") or m.get("original_title"),
                "overview": m.get("overview"),
                "genre_ids": m.get("genre_ids", []),
                "vote_average": m.get("vote_average"),
                "popularity": m.get("popularity"),
                "poster_path": m.get("poster_path"),
            }
        )
    return out


def enrich_runtime_and_genres(
    movies: List[Dict[str, Any]], id_to_genre: Dict[int, str], top_k: int = 15
) -> None:
    for m in movies[:top_k]:
        try:
            det = movie_details(m["id"])
            m["runtime"] = det.get("runtime")
            det_genres = det.get("genres", [])
            m["genres"] = [g.get("name") for g in det_genres if g.get("name")]
        except Exception:
            m["runtime"] = None
            m["genres"] = []
        time.sleep(0.15)
    for m in movies[top_k:]:
        if not m.get("genres"):
            m["genres"] = [
                id_to_genre.get(gid, "") for gid in m.get("genre_ids", []) if id_to_genre.get(gid, "")
            ]
        if "runtime" not in m:
            m["runtime"] = None


def build_genre_helpers() -> Tuple[Dict[str, int], Dict[int, str]]:
    name_to_id = tmdb_genre_map()
    id_to_name = {v: k.title() for k, v in name_to_id.items()}
    return name_to_id, id_to_name


def select_movies(preferences: Dict[str, Any], limit: int = 10) -> List[Dict[str, Any]]:
    """
    preferences example:
    {
      "genres": ["Action", "Sci-Fi"],
      "actors": ["Tom Cruise"],
      "decade": "2000s"
    }
    """
    if not TMDB_API_KEY:
        raise RuntimeError("Missing TMDB_API_KEY environment variable")

    genres_in = [g.strip() for g in preferences.get("genres", []) if g]
    actors_in = [a.strip() for a in preferences.get("actors", []) if a]
    decade_in = preferences.get("decade")

    name_to_id, id_to_name = build_genre_helpers()
    genre_ids = [name_to_id.get(g.lower()) for g in genres_in if name_to_id.get(g.lower())]
    person_ids = search_person_ids(actors_in) if actors_in else []

    raw = discover_movies(genre_ids, person_ids, decade_in, page_limit=3)
    norm = normalize_movies(raw)

    def base_score(m: Dict[str, Any]) -> float:
        s = 0.0
        s += (m.get("vote_average") or 0) * 2.0
        s += (m.get("popularity") or 0) * 0.1
        if genres_in and m.get("genre_ids"):
            overlap = len(set(m["genre_ids"]) & set(genre_ids))
            s += overlap * 3.0
        return s

    norm.sort(key=base_score, reverse=True)
    enrich_runtime_and_genres(norm, id_to_name, top_k=20)

    # Optional semantic rerank using title + overview against preference text
    if _SEM_MODEL is not None:
        pref_text = " ".join(genres_in + actors_in + ([decade_in] if decade_in else []))
        if pref_text.strip():

            try:

                cand_texts = [f'{m.get("title","")} {m.get("overview","")}' for m in norm[:50]]
                q_emb = _SEM_MODEL.encode(pref_text, convert_to_tensor=True, normalize_embeddings=True)
                d_emb = _SEM_MODEL.encode(cand_texts, convert_to_tensor=True, normalize_embeddings=True)
                # IMPORTANT: flatten 1xN to N
                sims = util.cos_sim(q_emb, d_emb).cpu().tolist()[0]
                for i, s in enumerate(sims):
                    norm[i]["_sem_score"] = float(s)
                norm[:50] = sorted(norm[:50], key=lambda x: x.get("_sem_score", 0.0), reverse=True)
            except Exception:
                # If embeddings or similarity computation fails, skip reranking but keep base results
                pass


    results: List[Dict[str, Any]] = []
    for m in norm[:max(limit, 1)]:
        results.append(
            {
                "id": m["id"],
                "title": m.get("title"),
                "duration": m.get("runtime"),
                "genres": m.get("genres") or [],
                "rating": m.get("vote_average"),
                "overview": m.get("overview"),
                "poster_path": m.get("poster_path"),
            }
        )
    return results
