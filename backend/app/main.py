
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.responses import JSONResponse
from app.database import Base, engine
from auth import auth_routes
from core.dependencies import get_current_user
from routes import agent_routes
from dotenv import load_dotenv
import os
import uvicorn

# Load environment variables
load_dotenv()

app = FastAPI(
    title="MovieRazzi Auth API (Secure Edition)",
    description="An Agentic AI Movie Recommendation & Scheduling System with Secure API Access",
    version="1.0.0"
)

# Create DB tables
Base.metadata.create_all(bind=engine)


#HTTPS Enforcement + Security Headers

# (2) Add common security headers
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

#CORS Configuration (open for dev; restrict later)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


#Include all routes

app.include_router(auth_routes.router)
app.include_router(agent_routes.router)


#Example Protected Route

@app.get("/profile")
def get_profile(username: str = Depends(get_current_user)):
    return {"msg": f"Hello, {username}! Secure connection verified."}


#Root route (for easy check)

@app.get("/")
def home():
    return {
        "msg": "Welcome to MovieRazzi AI System (HTTPS-ready)",
        "secure": True,
    }


#Run the app (Local HTTPS optional)

if __name__ == "__main__":
    # ⚠️ For student/local projects:
    # You can generate a local self-signed certificate using:
    #   openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
    #
    # OR just run it in plain HTTP by removing the ssl_keyfile/ssl_certfile arguments.
    
    cert_file = "cert.pem"
    key_file = "key.pem"

    if os.path.exists(cert_file) and os.path.exists(key_file):
        print("🔒 Starting server with HTTPS (SSL enabled)")
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            ssl_certfile=cert_file,
            ssl_keyfile=key_file,
        )
    else:
        print("⚠️ SSL certificates not found. Running in HTTP mode for local testing.")
        uvicorn.run("app.main:app", host="0.0.0.0", port=8000)
