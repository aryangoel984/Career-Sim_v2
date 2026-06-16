from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.chat import router as chat_router
from routers.review import router as review_router

app = FastAPI(title="CareerSim AI Colleague Chat Backend")

# Configure CORS to allow requests from the Next.js frontend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the colleague chat router
app.include_router(chat_router)

# Include the submission review router
app.include_router(review_router)

@app.get("/health")
async def health_check():
    """
    Simple health check endpoint to verify that the backend is up and running.
    """
    return {
        "status": "healthy",
        "service": "CareerSim AI Colleague Chat Backend"
    }
