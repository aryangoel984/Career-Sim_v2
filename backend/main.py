import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.chat import router as chat_router
from routers.review import router as review_router
from routers.auth import router as auth_router
from routers.skills import router as skills_router
from routers.profile import router as profile_router
from routers.mission import router as mission_router
from routers.report import router as report_router

app = FastAPI(title="CareerSim AI Backend")

# Configure CORS to allow requests from the Next.js frontend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

# Add production frontend URL from environment variable if it exists
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Existing routers
app.include_router(chat_router)
app.include_router(review_router)

# New routers
app.include_router(auth_router)
app.include_router(skills_router)
app.include_router(profile_router)
app.include_router(mission_router)
app.include_router(report_router)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "CareerSim AI Backend"
    }
