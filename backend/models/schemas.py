from pydantic import BaseModel
from typing import List, Optional

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class MissionContext(BaseModel):
    project: str
    company: str
    company_tag: Optional[str] = None
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


# --- Auth models ---

class SignupRequest(BaseModel):
    full_name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str


# --- Skills models ---

class SaveSkillsRequest(BaseModel):
    verified_skills: List[str]
    career: str
    mission: str
    repo_url: str
    scores: List[ScoreItem]
    overall: int

class SkillRecord(BaseModel):
    id: str
    name: str
    career: Optional[str] = ""
    mission: Optional[str] = ""
    repo_url: Optional[str] = ""
    score: Optional[int] = 0
    dimension: Optional[str] = ""
    verified_at: Optional[str] = ""


# --- Profile models ---

class UpdateCareerRequest(BaseModel):
    career: str


# --- Mission models ---

class AssignMissionRequest(BaseModel):
    career_id: str
