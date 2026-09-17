"""
Seeds and resets the fixed demo/guest Supabase user used by the
"Continue as Guest" login shortcut.

The demo user is a completely normal Supabase auth user — it goes through
the same `profiles` / `skills` / `user_missions` / `reviews` / `reports`
tables as any real user, so existing RLS policies apply to it unchanged.
This module only uses the service-role client (same as the rest of the
backend) to create it and to periodically reset its data back to a
realistic "already used the product" state.

Two entry points:
  - ensure_demo_user(supabase)  -> demo user's UUID, creating the auth
    user (idempotently) if it doesn't exist yet.
  - reset_demo_data(supabase, user_id) -> wipes and re-seeds everything
    the demo user owns.
"""

import os
from typing import Optional

from routers.skills import _get_dimension

DEMO_FULL_NAME = "Priya Sharma"
DEMO_CAREER = "ai-engineer"

# Skill scores mirror the shipped hospital-chatbot mission narrative already
# hardcoded into the frontend (see lib/data.ts) so the seeded passport reads
# as a coherent, believable playthrough rather than random numbers.
DEMO_SKILLS = [
    {"name": "Python", "score": 92},
    {"name": "FastAPI", "score": 89},
    {"name": "Prompt Engineering", "score": 90},
    {"name": "RAG", "score": 83},
    {"name": "System Design", "score": 61},
    {"name": "Docker", "score": 54},
]

DEMO_REVIEW = {
    "overall": 80,
    "scores": [
        {"label": "Architecture", "value": 82, "note": "Clean separation of retriever and generation layers."},
        {"label": "Code Quality", "value": 88, "note": "Readable, typed, well-named modules."},
        {"label": "Documentation", "value": 79, "note": "Solid README; add an architecture diagram."},
        {"label": "Scalability", "value": 71, "note": "Stateless API is good; caching layer would help."},
    ],
    "strengths": [
        {"title": "API Design", "note": "RESTful, predictable, well-versioned endpoints."},
        {"title": "Prompt Engineering", "note": "Grounded prompts with citation enforcement."},
        {"title": "FastAPI Structure", "note": "Dependency injection used idiomatically."},
    ],
    "weaknesses": [
        {"title": "Docker", "note": "No containerisation — add a Dockerfile + compose."},
        {"title": "Testing", "note": "Retriever lacks unit coverage."},
        {"title": "Deployment", "note": "No CI/CD or hosting story documented."},
    ],
    "summary": (
        "Strong, production-leaning submission. The retrieval pipeline is well-architected "
        "and prompts enforce citations — exactly what healthcare demands. Close the gap on "
        "containerisation and testing to reach senior-junior level."
    ),
    "verified_skills": ["Python", "FastAPI", "Prompt Engineering", "RAG"],
}

DEMO_REPORT = {
    "readiness": 78,
    "confidence": "Nearly There",
    "placement_probability": 82,
    "percentile": 91,
    "strengths": [
        {"title": "Grounded RAG Implementation", "note": "Retrieval pipeline enforces citations and avoids unsupported claims."},
        {"title": "Idiomatic FastAPI & Python", "note": "Readable, typed, well-structured modules with clean dependency injection."},
        {"title": "Clear, Citation-First Prompting", "note": "Prompts consistently ground answers in retrieved source chunks."},
    ],
    "weaknesses": [
        {"title": "Containerisation & Deployment", "note": "No Dockerfile or hosting story documented."},
        {"title": "Automated Test Coverage", "note": "Retriever and API layers lack unit tests."},
        {"title": "System-Design Depth at Scale", "note": "No discussion of caching, batching, or index persistence under load."},
    ],
    "roadmap": [
        {"month": 1, "focus": "Docker", "actions": ["Containerise the service", "Add docker-compose for the vector store"]},
        {"month": 2, "focus": "Cloud Deployment", "actions": ["Ship to a managed host with CI/CD", "Add health checks"]},
        {"month": 3, "focus": "MLOps Basics", "actions": ["Add an eval harness", "Introduce monitoring and model/version tracking"]},
    ],
    "matched_roles": [
        {"title": "Junior AI Engineer", "company": "Nexa Health", "match": 92},
        {"title": "ML Platform Intern", "company": "Lumen Labs", "match": 88},
        {"title": "Applied AI Engineer I", "company": "Vyom AI", "match": 84},
    ],
    "summary": (
        "Priya is placement-ready for junior AI engineering roles today, with the clearest "
        "upside coming from shipping a containerised, tested version of her chatbot work."
    ),
}

DEMO_MISSION_PROJECT = "Hospital Support Chatbot"
DEMO_REPO_URL = "https://github.com/careersim-demo/hospital-chatbot"


def _find_demo_user_id(supabase, email: str) -> Optional[str]:
    """Paginate admin.list_users looking for the demo account by email."""
    page = 1
    per_page = 200
    for _ in range(20):  # hard cap — this is a small demo project, not a scale search
        result = supabase.auth.admin.list_users(page=page, per_page=per_page)
        users = result if isinstance(result, list) else getattr(result, "users", result)
        if not users:
            return None
        for u in users:
            if getattr(u, "email", None) == email:
                return u.id
        if len(users) < per_page:
            return None
        page += 1
    return None


def ensure_demo_user(supabase) -> str:
    """Create the demo auth user if needed and return its UUID (idempotent)."""
    email = os.getenv("DEMO_USER_EMAIL")
    password = os.getenv("DEMO_USER_PASSWORD")
    if not email or not password:
        raise RuntimeError("DEMO_USER_EMAIL / DEMO_USER_PASSWORD are not set")

    existing_id = _find_demo_user_id(supabase, email)
    if existing_id:
        return existing_id

    created = supabase.auth.admin.create_user({
        "email": email,
        "password": password,
        "email_confirm": True,
        "user_metadata": {"full_name": DEMO_FULL_NAME},
    })
    if created.user is None:
        raise RuntimeError("Failed to create demo user via admin API")
    return created.user.id


def _find_seed_mission(supabase) -> Optional[dict]:
    """Prefer the AI Engineer catalog mission so the story matches the seeded skills/review."""
    result = supabase.table("missions").select("*").eq("career_id", DEMO_CAREER).limit(1).execute()
    if result.data:
        return result.data[0]
    # Fall back to whatever exists so the demo still has an active mission
    result = supabase.table("missions").select("*").limit(1).execute()
    return result.data[0] if result.data else None


def delete_demo_rows(supabase, user_id: str) -> None:
    """Best-effort wipe of everything the demo user owns, keeping the auth user + profile row."""
    for table in ("skills", "user_missions", "reviews", "reports"):
        try:
            supabase.table(table).delete().eq("user_id", user_id).execute()
        except Exception as e:
            print(f"[demo_seed] WARN — failed clearing {table}: {type(e).__name__}: {e}")


def seed_demo_rows(supabase, user_id: str) -> None:
    """(Re)populate a realistic, already-used profile for the demo user."""
    email = os.getenv("DEMO_USER_EMAIL", "")

    try:
        supabase.table("profiles").upsert({
            "id": user_id,
            "email": email,
            "full_name": DEMO_FULL_NAME,
            "career": DEMO_CAREER,
        }).execute()
    except Exception as e:
        print(f"[demo_seed] WARN — failed upserting profile: {type(e).__name__}: {e}")

    mission = _find_seed_mission(supabase)
    if mission is None:
        print("[demo_seed] WARN — missions catalog is empty; skipping mission/report seed")
    else:
        try:
            supabase.table("user_missions").insert({
                "user_id": user_id,
                "mission_id": mission["id"],
                "status": "active",
            }).execute()
        except Exception as e:
            print(f"[demo_seed] WARN — failed seeding user_missions: {type(e).__name__}: {e}")

    skill_rows = [
        {
            "user_id": user_id,
            "name": s["name"],
            "career": DEMO_CAREER,
            "mission": DEMO_MISSION_PROJECT,
            "repo_url": DEMO_REPO_URL,
            "score": s["score"],
            "dimension": _get_dimension(s["name"]),
        }
        for s in DEMO_SKILLS
    ]
    try:
        supabase.table("skills").upsert(skill_rows, on_conflict="user_id,name,mission").execute()
    except Exception as e:
        print(f"[demo_seed] WARN — failed seeding skills: {type(e).__name__}: {e}")

    try:
        supabase.table("reviews").insert({
            "user_id": user_id,
            "mission": DEMO_MISSION_PROJECT,
            "overall": DEMO_REVIEW["overall"],
            "scores": DEMO_REVIEW["scores"],
            "strengths": DEMO_REVIEW["strengths"],
            "weaknesses": DEMO_REVIEW["weaknesses"],
            "summary": DEMO_REVIEW["summary"],
            "verified_skills": DEMO_REVIEW["verified_skills"],
        }).execute()
    except Exception as e:
        print(f"[demo_seed] WARN — failed seeding reviews: {type(e).__name__}: {e}")

    if mission is not None:
        try:
            supabase.table("reports").insert({
                "user_id": user_id,
                "career": DEMO_CAREER,
                "readiness": DEMO_REPORT["readiness"],
                "confidence": DEMO_REPORT["confidence"],
                "placement_probability": DEMO_REPORT["placement_probability"],
                "percentile": DEMO_REPORT["percentile"],
                "strengths": DEMO_REPORT["strengths"],
                "weaknesses": DEMO_REPORT["weaknesses"],
                "matched_roles": DEMO_REPORT["matched_roles"],
                "roadmap": DEMO_REPORT["roadmap"],
                "summary": DEMO_REPORT["summary"],
            }).execute()
        except Exception as e:
            print(f"[demo_seed] WARN — failed seeding reports: {type(e).__name__}: {e}")


def reset_demo_user(supabase) -> str:
    """Full cycle: ensure the auth user exists, wipe its data, reseed it. Returns the user id."""
    user_id = ensure_demo_user(supabase)
    delete_demo_rows(supabase, user_id)
    seed_demo_rows(supabase, user_id)
    return user_id
