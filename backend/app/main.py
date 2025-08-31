from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from auth import auth_routes
from core.dependencies import get_current_user


app = FastAPI()


Base.metadata.create_all(bind=engine)


app.add_middleware(
CORSMiddleware,
allow_origins=["*"],
allow_credentials=True,
allow_methods=["*"],
allow_headers=["*"],
)


app.include_router(auth_routes.router)


@app.get("/profile")
def get_profile(username: str = Depends(get_current_user)):
    return {"msg": f"Hello, {username}!"}