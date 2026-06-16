import os
import re
import json
from fastapi import APIRouter, HTTPException
from groq import AsyncGroq
from models.schemas import ReviewRequest, ReviewResponse
from agents.prompts import get_review_prompt
from services.github import fetch_repo_bundle
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Initialize AsyncGroq client (same key as chat)
api_key = os.getenv("GROQ_API_KEY")
client = AsyncGroq(api_key=api_key)

_FENCE_RE = re.compile(r"```(?:json)?\s*|\s*```", re.IGNORECASE)


def _strip_fences(text: str) -> str:
    """Remove markdown code fences that Groq may wrap around the JSON."""
    return _FENCE_RE.sub("", text).strip()


@router.post("/api/review", response_model=ReviewResponse)
async def review_endpoint(request: ReviewRequest):
    print(f"\n{'='*60}")
    print(f"[review] POST /api/review")
    print(f"[review] GitHub URL: {request.github_url}")
    print(f"[review] Project:    {request.mission_context.project}")
    print(f"[review] Company:    {request.mission_context.company}")
    print(f"{'='*60}")

    # 1. Fetch and bundle the repository
    print(f"[review] Step 1 — Fetching repository bundle...")
    bundle = fetch_repo_bundle(request.github_url)
    if bundle.startswith("ERROR:"):
        print(f"[review] ERROR fetching bundle: {bundle}")
        raise HTTPException(status_code=400, detail=bundle[len("ERROR:"):].strip())
    print(f"[review] Step 1 DONE — bundle ready ({len(bundle):,} chars)")

    # 2. Build Aisha's review prompts
    print(f"[review] Step 2 — Building Aisha review prompt...")
    system_prompt, user_message = get_review_prompt(request.mission_context, bundle)
    print(f"[review] Step 2 DONE — system={len(system_prompt)} chars, user_msg={len(user_message):,} chars")

    # 3. Call Groq — non-streaming, wait for the full response
    print(f"[review] Step 3 — Calling Groq (llama-3.3-70b-versatile, non-streaming)...")
    try:
        completion = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt + "\n\nCRITICAL: Return JSON only. No markdown. No code fences. No preamble. Just the raw JSON object.",
                },
                {
                    "role": "user",
                    "content": user_message,
                },
            ],
            max_tokens=2000,
            temperature=0.3,
            stream=False,
        )
    except Exception as e:
        print(f"[review] ERROR Groq call failed: {e}")
        raise HTTPException(status_code=500, detail=f"Groq API error: {e}")

    raw_text = completion.choices[0].message.content or ""
    print(f"[review] Step 3 DONE — Groq returned {len(raw_text)} chars")
    print(f"[review] Raw Groq response (first 300 chars): {raw_text[:300]}")

    # 4. Strip fences and parse JSON
    print(f"[review] Step 4 — Parsing JSON response...")
    cleaned = _strip_fences(raw_text)
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        print(f"[review] ERROR JSON parse failed: {e}")
        print(f"[review] Cleaned text (first 500 chars): {cleaned[:500]}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse Groq response as JSON: {e}. Raw: {cleaned[:300]}",
        )
    print(f"[review] Step 4 DONE — JSON keys: {list(data.keys())}")

    # 5. Validate against ReviewResponse schema
    print(f"[review] Step 5 — Validating against ReviewResponse schema...")
    try:
        review = ReviewResponse(**data)
    except Exception as e:
        print(f"[review] ERROR Schema validation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Review response did not match expected schema: {e}",
        )

    print(f"[review] Step 5 DONE — overall={review.overall}, scores={[s.label for s in review.scores]}")
    print(f"[review] verified_skills={review.verified_skills}")
    print(f"[review] SUCCESS — returning ReviewResponse")
    print(f"{'='*60}\n")
    return review
