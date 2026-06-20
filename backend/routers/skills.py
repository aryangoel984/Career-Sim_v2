from fastapi import APIRouter, HTTPException, Depends
from models.schemas import SaveSkillsRequest, SkillRecord
from db.supabase import get_supabase
from auth.verify import verify_token
from typing import List

router = APIRouter()

# Maps skill names (lowercase) to their review dimension
SKILL_DIMENSION_MAP = {
    # Languages → Code Quality
    "python": "Code Quality",
    "javascript": "Code Quality",
    "typescript": "Code Quality",
    "java": "Code Quality",
    "c++": "Code Quality",
    "go": "Code Quality",
    "rust": "Code Quality",
    "ruby": "Code Quality",
    # Frameworks / APIs → Architecture
    "fastapi": "Architecture",
    "flask": "Architecture",
    "django": "Architecture",
    "express": "Architecture",
    "nextjs": "Architecture",
    "next.js": "Architecture",
    "rest apis": "Architecture",
    "rest api": "Architecture",
    "graphql": "Architecture",
    "grpc": "Architecture",
    # AI / ML → Architecture
    "rag": "Architecture",
    "vector databases": "Architecture",
    "vector database": "Architecture",
    "faiss": "Architecture",
    "chromadb": "Architecture",
    "pinecone": "Architecture",
    "langchain": "Architecture",
    "embeddings": "Architecture",
    "openai api": "Architecture",
    "hugging face": "Architecture",
    "transformers": "Architecture",
    "pytorch": "Architecture",
    "tensorflow": "Architecture",
    "scikit-learn": "Architecture",
    "random forest": "Code Quality",
    "random forest classification": "Code Quality",
    # Documentation
    "documentation": "Documentation",
    "readme": "Documentation",
    "technical writing": "Documentation",
    # Infrastructure → Scalability
    "docker": "Scalability",
    "kubernetes": "Scalability",
    "ci/cd": "Scalability",
    "redis": "Scalability",
    "postgresql": "Scalability",
    "mysql": "Scalability",
    "mongodb": "Scalability",
    "prisma orm": "Scalability",
    "prisma": "Scalability",
}


def _get_dimension(skill: str) -> str:
    return SKILL_DIMENSION_MAP.get(skill.lower(), "Overall")


def _get_score(skill: str, scores: list, overall: int) -> int:
    dim = _get_dimension(skill)
    if dim != "Overall":
        for s in scores:
            if s.label == dim:
                return s.value
    return overall


@router.post("/api/skills/save")
async def save_skills(request: SaveSkillsRequest, user_id: str = Depends(verify_token)):
    supabase = get_supabase()

    rows = []
    for skill in request.verified_skills:
        dim = _get_dimension(skill)
        score = _get_score(skill, request.scores, request.overall)
        rows.append({
            "user_id": user_id,
            "name": skill,
            "career": request.career,
            "mission": request.mission,
            "repo_url": request.repo_url,
            "score": score,
            "dimension": dim,
        })

    if not rows:
        return {"saved": 0}

    try:
        # Upsert: if same user_id + name + mission exists, update it
        result = supabase.table("skills").upsert(
            rows,
            on_conflict="user_id,name,mission",
        ).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save skills: {e}")

    return {"saved": len(rows)}


@router.get("/api/skills", response_model=List[SkillRecord])
async def get_skills(user_id: str = Depends(verify_token)):
    supabase = get_supabase()
    try:
        result = (
            supabase.table("skills")
            .select("*")
            .eq("user_id", user_id)
            .order("verified_at", desc=True)
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch skills: {e}")

    return result.data
