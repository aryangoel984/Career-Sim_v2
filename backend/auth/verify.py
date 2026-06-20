import os
import jwt as pyjwt
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from db.supabase import get_supabase
from dotenv import load_dotenv

load_dotenv()

security = HTTPBearer()


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Verify a Supabase JWT by asking Supabase to validate it server-side.

    Supabase newer projects use ES256 (asymmetric ECDSA) instead of HS256,
    so we cannot verify locally with the JWT secret. Instead we call
    supabase.auth.get_user(token) which validates the signature, expiry,
    and returns the user — regardless of which algorithm was used.
    """
    token = credentials.credentials
    try:
        supabase = get_supabase()
        response = supabase.auth.get_user(token)
        if response.user is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return response.user.id
    except HTTPException:
        raise
    except Exception as e:
        print(f"[verify_token] FAIL — {type(e).__name__}: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")
