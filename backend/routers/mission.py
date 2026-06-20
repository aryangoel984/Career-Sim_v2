from fastapi import APIRouter, Depends, HTTPException
from auth.verify import verify_token
from db.supabase import get_supabase
from models.schemas import AssignMissionRequest

router = APIRouter()


@router.post("/api/mission/assign")
async def assign_mission(request: AssignMissionRequest, user_id: str = Depends(verify_token)):
    supabase = get_supabase()

    mission_result = supabase.table("missions")\
        .select("*")\
        .eq("career_id", request.career_id)\
        .limit(1)\
        .execute()

    if not mission_result.data:
        raise HTTPException(status_code=404, detail="No mission catalog entry for this career")

    mission = mission_result.data[0]

    supabase.table("user_missions").insert({
        "user_id": user_id,
        "mission_id": mission["id"],
        "status": "active"
    }).execute()

    return mission


@router.get("/api/mission/active")
async def get_active_mission(user_id: str = Depends(verify_token)):
    supabase = get_supabase()

    assignment_result = supabase.table("user_missions")\
        .select("mission_id")\
        .eq("user_id", user_id)\
        .eq("status", "active")\
        .order("assigned_at", desc=True)\
        .limit(1)\
        .execute()

    if not assignment_result.data:
        raise HTTPException(status_code=404, detail="No active mission assigned")

    mission_id = assignment_result.data[0]["mission_id"]

    mission_result = supabase.table("missions")\
        .select("*")\
        .eq("id", mission_id)\
        .execute()

    if not mission_result.data:
        raise HTTPException(status_code=404, detail="Mission not found")

    return mission_result.data[0]
