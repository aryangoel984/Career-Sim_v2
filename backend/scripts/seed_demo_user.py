"""
One-off / manual entry point for creating and seeding the demo guest user.

Run once when setting up "Continue as Guest" (or any time you want to force
an immediate reset outside the scheduled job):

    cd backend
    python -m scripts.seed_demo_user

Requires SUPABASE_URL, SUPABASE_SERVICE_KEY, DEMO_USER_EMAIL and
DEMO_USER_PASSWORD to be set (backend/.env is loaded automatically).
The scheduled reset (routers/admin.py, called by
.github/workflows/reset-demo-user.yml) reuses the exact same
services.demo_seed.reset_demo_user() function, so this script and the
recurring job never drift apart.
"""

from db.supabase import get_supabase
from services.demo_seed import reset_demo_user


def main():
    supabase = get_supabase()
    user_id = reset_demo_user(supabase)
    print(f"[seed_demo_user] Demo user ready — id={user_id}")


if __name__ == "__main__":
    main()
