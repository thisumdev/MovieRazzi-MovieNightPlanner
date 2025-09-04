from fastapi import APIRouter, HTTPException
from agents.movie_selector import select_movies
from schemas.movie import MovieIn, MovieOut
from fastapi import APIRouter, HTTPException, Depends
from core.dependencies import get_current_user

router = APIRouter(
    prefix="/recommend-movies",
    tags=["Movie Selector"],
   # dependencies=[Depends(get_current_user)],  
)

@router.post("", response_model=list[MovieOut])
def recommend_movies(
    payload: MovieIn,
    ):
    try:
        movies = select_movies(
            {
                "genres": payload.genres,
                "actors": payload.actors,
                "decade": payload.decade,
            },
            limit=payload.limit,
        )
        return movies
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Movie selector error: {e}")
