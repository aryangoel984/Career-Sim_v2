import os
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from models.schemas import SignupRequest, LoginRequest
from db.supabase import get_supabase
from auth.verify import verify_token

router = APIRouter()


@router.post("/api/auth/signup")
async def signup(request: SignupRequest):
    supabase = get_supabase()
    try:
        response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "full_name": request.full_name,
                }
            },
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    if response.user is None:
        raise HTTPException(status_code=400, detail="Signup failed — check your email/password.")

    session = response.session
    if session is None:
        # Email confirmation required — tell the frontend
        raise HTTPException(status_code=400, detail="Please confirm your email before logging in.")

    return {
        "access_token": session.access_token,
        "refresh_token": session.refresh_token,
        "user": {
            "id": response.user.id,
            "email": response.user.email,
            "full_name": response.user.user_metadata.get("full_name", ""),
        },
    }


@router.post("/api/auth/login")
async def login(request: LoginRequest):
    supabase = get_supabase()
    try:
        response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password,
        })
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if response.user is None or response.session is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "access_token": response.session.access_token,
        "refresh_token": response.session.refresh_token,
        "user": {
            "id": response.user.id,
            "email": response.user.email,
            "full_name": response.user.user_metadata.get("full_name", ""),
        },
    }


@router.post("/api/auth/demo-login")
async def demo_login():
    """
    Signs in to the fixed demo/guest account for recruiter previews.

    Credentials are never sent from the client — they live only in this
    process's environment, so the browser has no way to discover or reuse
    them. The demo account is just a normal Supabase user whose data is
    reset on a schedule (see services/demo_seed.py), so RLS applies to it
    exactly as it would to any other user.
    """
    demo_email = os.getenv("DEMO_USER_EMAIL")
    demo_password = os.getenv("DEMO_USER_PASSWORD")
    if not demo_email or not demo_password:
        raise HTTPException(status_code=503, detail="Guest preview is not configured")

    supabase = get_supabase()
    try:
        response = supabase.auth.sign_in_with_password({
            "email": demo_email,
            "password": demo_password,
        })
    except Exception:
        raise HTTPException(status_code=503, detail="Guest preview is temporarily unavailable")

    if response.user is None or response.session is None:
        raise HTTPException(status_code=503, detail="Guest preview is temporarily unavailable")

    return {
        "access_token": response.session.access_token,
        "refresh_token": response.session.refresh_token,
        "user": {
            "id": response.user.id,
            "email": response.user.email,
            "full_name": response.user.user_metadata.get("full_name", ""),
        },
        "is_demo": True,
    }


@router.post("/api/auth/logout")
async def logout(user_id: str = Depends(verify_token)):
    supabase = get_supabase()
    try:
        supabase.auth.sign_out()
    except Exception:
        pass  # Best-effort logout
    return {"message": "Logged out successfully"}


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/api/auth/refresh")
async def refresh_token(request: RefreshRequest):
    supabase = get_supabase()
    try:
        response = supabase.auth.refresh_session(request.refresh_token)
        if response.session is None:
            raise HTTPException(status_code=401, detail="Could not refresh session")
        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail="Could not refresh session")


@router.get("/api/auth/me")
async def me(user_id: str = Depends(verify_token)):
    supabase = get_supabase()
    try:
        result = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    except Exception as e:
        raise HTTPException(status_code=404, detail="Profile not found")

    row = result.data
    return {
        "id": row["id"],
        "email": row["email"],
        "full_name": row.get("full_name", ""),
        "career": row.get("career", ""),
    }
