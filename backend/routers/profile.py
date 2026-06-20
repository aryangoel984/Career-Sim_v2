from fastapi import APIRouter, HTTPException, Depends
from models.schemas import UpdateCareerRequest
from db.supabase import get_supabase
from auth.verify import verify_token

router = APIRouter()


@router.patch("/api/profile/career")
async def update_career(request: UpdateCareerRequest, user_id: str = Depends(verify_token)):
    supabase = get_supabase()
    try:
        supabase.table("profiles").update({"career": request.career}).eq("id", user_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update career: {e}")
    return {"message": "Career updated"}
