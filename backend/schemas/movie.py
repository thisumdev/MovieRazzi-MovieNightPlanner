from typing import List, Optional
from pydantic import BaseModel

class MovieIn(BaseModel):
    genres: List[str] = []
    actors: List[str] = []
    decade: Optional[str] = None
    limit: int = 10

class MovieOut(BaseModel):
    id: int
    title: str
    duration: Optional[int] = None
    genres: List[str] = []
    rating: Optional[float] = None
    overview: Optional[str] = None
    poster_path: Optional[str] = None