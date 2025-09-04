from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from auth import auth_routes
from core.dependencies import get_current_user
from routes import preference_routes


app = FastAPI()


Base.metadata.create_all(bind=engine)


app.add_middleware(
CORSMiddleware,
allow_origins=["*"],
allow_credentials=True,
allow_methods=["*"],
allow_headers=["*"],
)

#Include routers
app.include_router(auth_routes.router)
app.include_router(preference_routes.router)

@app.get("/profile")
def get_profile(username: str = Depends(get_current_user)):
    return {"msg": f"Hello, {username}!"}