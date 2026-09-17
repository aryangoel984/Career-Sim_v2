import hmac
import os
from typing import Optional

from fastapi import APIRouter, Header, HTTPException

from db.supabase import get_supabase
from services.demo_seed import reset_demo_user

router = APIRouter()


@router.post("/api/admin/demo/reset")
async def reset_demo(x_cron_secret: Optional[str] = Header(default=None)):
    """
    Resets the guest/demo account back to its seeded state.

    Meant to be called by a scheduled job (see .github/workflows/reset-demo-user.yml)
    every few hours so repeat "Continue as Guest" visits always see a clean,
    realistic profile rather than whatever a previous visitor left behind.
    """
    expected = os.getenv("CRON_SECRET")
    if not expected:
        raise HTTPException(status_code=503, detail="Demo reset is not configured")
    if not x_cron_secret or not hmac.compare_digest(x_cron_secret, expected):
        raise HTTPException(status_code=403, detail="Invalid cron secret")

    supabase = get_supabase()
    try:
        user_id = reset_demo_user(supabase)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo reset failed: {e}")

    return {"message": "Demo user reset", "user_id": user_id}
