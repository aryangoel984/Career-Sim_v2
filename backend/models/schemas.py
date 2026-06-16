from pydantic import BaseModel
from typing import List

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class MissionContext(BaseModel):
    project: str
    company: str
    requirements: List[str]
    constraints: List[str]
    acceptance: List[str]

class ChatRequest(BaseModel):
    agent_id: str
    messages: List[ChatMessage]
    mission_context: MissionContext

# --- Review feature models ---

class ReviewRequest(BaseModel):
    github_url: str
    mission_context: MissionContext

class ScoreItem(BaseModel):
    label: str
    value: int  # 0-100
    note: str

class StrengthWeaknessItem(BaseModel):
    title: str
    note: str

class ReviewResponse(BaseModel):
    overall: int  # 0-100
    scores: List[ScoreItem]
    strengths: List[StrengthWeaknessItem]
    weaknesses: List[StrengthWeaknessItem]
    summary: str
    verified_skills: List[str]
