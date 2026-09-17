import json
import re
from groq import AsyncGroq
import os

client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

_FENCE_RE = re.compile(r"```(?:json)?\s*|\s*```", re.IGNORECASE)
_THINK_RE = re.compile(r"<think>.*?</think>", re.DOTALL | re.IGNORECASE)


def _strip_fences(text: str) -> str:
    return _FENCE_RE.sub("", text).strip()


REPORT_REQUIRED_KEYS = {"readiness", "confidence", "placement_probability", "percentile",
                        "strengths", "weaknesses", "matched_roles", "roadmap", "summary"}


def _extract_report_json(text: str) -> str:
    """
    Collect all complete {…} candidates, try json.loads on each (largest first),
    return the first that has all required report keys.
    Falls back to auto-closing truncated JSON if nothing matches.
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

    candidates.sort(key=len, reverse=True)
    for candidate in candidates:
        try:
            data = json.loads(candidate)
            if isinstance(data, dict) and REPORT_REQUIRED_KEYS.issubset(data.keys()):
                return candidate
        except json.JSONDecodeError:
            continue

    # Truncation fallback: auto-close unclosed braces from first {
    start = text.find("{")
    if start != -1:
        fragment = text[start:]
        depth = fragment.count("{") - fragment.count("}")
        if depth > 0:
            fragment += "}" * depth
        return fragment

    return text


def _clean_response(text: str) -> str:
    """Strip <think>...</think> blocks and markdown fences, then extract report JSON."""
    text = _THINK_RE.sub("", text).strip()
    text = _strip_fences(text)
    return _extract_report_json(text)


async def generate_report(career: str, mission: dict, reviews: list) -> dict:
    if not reviews:
        raise ValueError("Cannot generate a report with no completed reviews")

    reviews_summary = "\n\n".join([
        f"Mission: {r.get('mission', 'Unknown')}\n"
        f"Overall score: {r.get('overall')}\n"
        f"Scores: {json.dumps(r.get('scores', []))}\n"
        f"Strengths: {json.dumps(r.get('strengths', []))}\n"
        f"Weaknesses: {json.dumps(r.get('weaknesses', []))}\n"
        f"Summary: {r.get('summary', '')}"
        for r in reviews
    ])

    prompt = f"""You are a senior career advisor specializing in tech hiring. You are generating an honest 
employability report for a student who completed a {career} simulation mission.

Mission context: {mission.get('project', 'Unknown project')} for {mission.get('company', 'Unknown company')}

Their actual performance across {len(reviews)} reviewed submission(s):
{reviews_summary}

Generate a holistic, honest employability report based EXCLUSIVELY on the code review scores and 
feedback shown above. Do not factor in any assumed skills outside of what is demonstrated in the 
reviews. Do not inflate the numbers — a student with weak review scores should get a low readiness 
score and probability, not an inflated one. Be specific to the {career} career path and to what 
was actually demonstrated in the reviews, not generic advice.

Return ONLY a JSON object, no markdown, no explanation, with this exact structure:
{{
  "readiness": 74,
  "confidence": "Nearly There",
  "placement_probability": 62,
  "percentile": 71,
  "strengths": [
    {{ "title": "short title", "note": "specific note referencing actual performance" }},
    {{ "title": "short title", "note": "specific note referencing actual performance" }},
    {{ "title": "short title", "note": "specific note referencing actual performance" }}
  ],
  "weaknesses": [
    {{ "title": "short title", "note": "specific gap based on actual scores or missing skills" }},
    {{ "title": "short title", "note": "specific gap based on actual scores or missing skills" }},
    {{ "title": "short title", "note": "specific gap based on actual scores or missing skills" }}
  ],
  "matched_roles": [
    {{ "title": "specific job title matching this career and skill level", "company": "plausible company type", "match": 85 }},
    {{ "title": "specific job title matching this career and skill level", "company": "plausible company type", "match": 78 }},
    {{ "title": "specific job title matching this career and skill level", "company": "plausible company type", "match": 71 }}
  ],
  "roadmap": [
    {{ "month": 1, "focus": "specific focus area", "actions": ["specific action", "specific action"] }},
    {{ "month": 2, "focus": "specific focus area", "actions": ["specific action", "specific action"] }},
    {{ "month": 3, "focus": "specific focus area", "actions": ["specific action", "specific action"] }}
  ],
  "summary": "2-3 sentence honest verdict referencing actual strengths and gaps shown above"
}}

confidence must be one of: "Early Stage", "Needs Work", "Nearly There", "Job Ready" — chosen based on 
the actual readiness score (below 50: Early Stage, 50-65: Needs Work, 66-80: Nearly There, 81+: Job Ready)."""

    response = await client.chat.completions.create(
        model="openai/gpt-oss-120b",
        max_tokens=4000,
        temperature=0.4,
        messages=[{"role": "user", "content": prompt}]
    )

    text = response.choices[0].message.content.strip()
    text = _clean_response(text)
    return json.loads(text)
