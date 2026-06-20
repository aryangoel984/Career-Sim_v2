from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, List, Any
from pydantic import BaseModel
from db.supabase import get_supabase
from auth.verify import verify_token
from agents.report_generator import generate_report

router = APIRouter()


class GenerateReportRequest(BaseModel):
    # Optional: frontend can pass the cached review from localStorage
    # so we never hard-block when the reviews DB table is still empty
    review_override: Optional[List[Any]] = None


def _level_from_career(career: str) -> str:
    """Derive a readable seniority label from a career_id string."""
    mapping = {
        "ai-engineer": "Junior AI Engineer",
        "data-scientist": "Junior Data Scientist",
        "backend-engineer": "Junior Backend Engineer",
        "product-manager": "Associate Product Manager",
        "cybersecurity-analyst": "Junior Cybersecurity Analyst",
    }
    return mapping.get(career.lower().replace(" ", "-"), f"Junior {career}")


@router.post("/api/report/generate")
async def create_report(body: GenerateReportRequest = GenerateReportRequest(), user_id: str = Depends(verify_token)):
    supabase = get_supabase()

    # 1. Get the user's active mission
    mission_assignment = supabase.table("user_missions")\
        .select("mission_id")\
        .eq("user_id", user_id)\
        .eq("status", "active")\
        .order("assigned_at", desc=True)\
        .limit(1)\
        .execute()

    if not mission_assignment.data:
        raise HTTPException(status_code=400, detail="No active mission found — pick a career first")

    mission_id = mission_assignment.data[0]["mission_id"]
    mission_result = supabase.table("missions").select("*").eq("id", mission_id).execute()
    if not mission_result.data:
        raise HTTPException(status_code=404, detail="Mission not found")
    mission = mission_result.data[0]

    # 2. Get the most recent review only — report is always based on latest submission
    reviews_result = supabase.table("reviews")\
        .select("*")\
        .eq("user_id", user_id)\
        .order("created_at", desc=True)\
        .limit(1)\
        .execute()

    reviews = reviews_result.data or []

    if not reviews:
        if body.review_override:
            print(f"[report] No DB reviews found — using latest override from frontend cache")
            reviews = body.review_override[:1]  # only use the latest one
        else:
            raise HTTPException(
                status_code=400,
                detail="No reviews found — submit your code for review first"
            )

    # 3. Generate report via Groq — based exclusively on the latest code review
    try:
        report_data = await generate_report(
            career=mission.get("career_id", "engineer"),
            mission=mission,
            reviews=reviews,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

    # 5. Derive level label
    report_data["level"] = _level_from_career(mission.get("career_id", ""))

    # 6. Persist to reports table (best-effort)
    try:
        saved = supabase.table("reports").insert({
            "user_id": user_id,
            "career": mission.get("career_id", ""),
            "readiness": report_data["readiness"],
            "confidence": report_data["confidence"],
            "placement_probability": report_data["placement_probability"],
            "percentile": report_data["percentile"],
            # 'level' column does not exist in this table — omitted
            "strengths": report_data["strengths"],
            "weaknesses": report_data["weaknesses"],
            "matched_roles": report_data["matched_roles"],
            "roadmap": report_data["roadmap"],
            "summary": report_data["summary"],
        }).execute()
        print(f"[report] DB save OK — id={saved.data[0].get('id') if saved.data else 'unknown'}")
        return saved.data[0]
    except Exception as e:
        print(f"[report] WARN — DB save failed: {type(e).__name__}: {e}")
        return report_data


@router.get("/api/report/latest")
async def get_latest_report(user_id: str = Depends(verify_token)):
    supabase = get_supabase()
    
    # 1. Get latest report
    result = supabase.table("reports")\
        .select("*")\
        .eq("user_id", user_id)\
        .order("created_at", desc=True)\
        .limit(1)\
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="No report generated yet")

    latest_report = result.data[0]

    # 2. Check if there's a newer review (meaning the report is stale)
    review_result = supabase.table("reviews")\
        .select("created_at")\
        .eq("user_id", user_id)\
        .order("created_at", desc=True)\
        .limit(1)\
        .execute()

    if review_result.data:
        latest_review_date = review_result.data[0]["created_at"]
        if latest_review_date > latest_report["created_at"]:
            raise HTTPException(status_code=404, detail="Report is stale, new review exists")

    return latest_report
