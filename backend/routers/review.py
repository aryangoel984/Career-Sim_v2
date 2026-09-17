import os
import re
import json
from fastapi import APIRouter, HTTPException, Depends
from groq import AsyncGroq
from models.schemas import ReviewRequest, ReviewResponse
from agents.prompts import get_review_prompt
from services.github import fetch_repo_bundle
from auth.verify import verify_token
from db.supabase import get_supabase
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Initialize AsyncGroq client (same key as chat)
api_key = os.getenv("GROQ_API_KEY")
client = AsyncGroq(api_key=api_key)

_FENCE_RE = re.compile(r"```(?:json)?\s*|\s*```", re.IGNORECASE)
_THINK_RE = re.compile(r"<think>.*?</think>", re.DOTALL | re.IGNORECASE)


def _strip_fences(text: str) -> str:
    """Remove markdown code fences that Groq may wrap around the JSON."""
    return _FENCE_RE.sub("", text).strip()


REVIEW_REQUIRED_KEYS = {"overall", "scores", "strengths", "weaknesses", "summary", "verified_skills"}


def _extract_review_json(text: str) -> str:
    """
    Extract the JSON object that contains all ReviewResponse keys.
    Strategy: collect all complete {…} candidates (largest-first), try json.loads on each,
    return the first that has all required keys. Falls back to auto-closing truncated JSON.
    """
    candidates = []
    for i, ch in enumerate(text):
        if ch != "{":
            continue
        depth = 0
        for j in range(i, len(text)):
            if text[j] == "{":
                depth += 1
            elif text[j] == "}":
                depth -= 1
                if depth == 0:
                    candidates.append(text[i:j + 1])
                    break

    # Sort largest first — the full response is always the biggest object
    candidates.sort(key=len, reverse=True)
    for candidate in candidates:
        try:
            data = json.loads(candidate)
            if isinstance(data, dict) and REVIEW_REQUIRED_KEYS.issubset(data.keys()):
                return candidate
        except json.JSONDecodeError:
            continue

    # Last resort: find the first { and close any unclosed braces (handles truncation)
    start = text.find("{")
    if start != -1:
        fragment = text[start:]
        depth = fragment.count("{") - fragment.count("}")
        if depth > 0:
            fragment += "}" * depth
        return fragment

    return text


def _clean_response(text: str) -> str:
    """Strip <think>...</think> blocks and markdown fences, then extract ReviewResponse JSON."""
    text = _THINK_RE.sub("", text).strip()
    text = _strip_fences(text)
    return _extract_review_json(text)


@router.post("/api/review", response_model=ReviewResponse)
async def review_endpoint(request: ReviewRequest, user_id: str = Depends(verify_token)):
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
    print(f"[review] Step 3 — Calling Groq (gpt-oss-120b, non-streaming)...")
    try:
        completion = await client.chat.completions.create(
            model="openai/gpt-oss-120b",
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
            max_tokens=4000,
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
    cleaned = _clean_response(raw_text)
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

    # 6. Persist full review to the reviews table (best-effort, non-blocking)
    print(f"[review] Step 6 — Persisting review to DB...")
    try:
        supabase = get_supabase()
        result = supabase.table("reviews").insert({
            "user_id": user_id,
            "mission": request.mission_context.project,
            # 'company' column does not exist in this table — omitted
            "overall": review.overall,
            "scores": [s.dict() for s in review.scores],
            "strengths": [s.dict() for s in review.strengths],
            "weaknesses": [s.dict() for s in review.weaknesses],
            "summary": review.summary,
            "verified_skills": review.verified_skills,
        }).execute()
        print(f"[review] Step 6 DONE — review persisted, id={result.data[0].get('id') if result.data else 'unknown'}")
    except Exception as e:
        # Non-blocking — review is still returned even if DB write fails
        print(f"[review] WARN Step 6 — DB write failed: {type(e).__name__}: {e}")

    print(f"[review] SUCCESS — returning ReviewResponse")
    print(f"{'='*60}\n")
    return review
