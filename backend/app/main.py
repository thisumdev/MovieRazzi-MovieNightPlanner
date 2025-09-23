from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from auth import auth_routes
from core.dependencies import get_current_user

app = FastAPI(title="MovieRazzi Auth API")

# Create DB tables
Base.metadata.create_all(bind=engine)

# CORS – open for dev; restrict in prod
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to your frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth_routes.router)

@app.get("/profile")
def get_profile(username: str = Depends(get_current_user)):
    # simple protected route returns a friendly message
    return {"msg": f"Hello, {username}!"}
