from datetime import datetime
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class ActionCard(BaseModel):
    title: str
    subtitle: str
    badge: str
    details: Dict[str, Any]
    action_type: str = Field(..., description="e.g. 'assign_vehicle', 'replan_route', 'inspect_bin'")
    action_target: Optional[str] = None


class AIQueryRequest(BaseModel):
    query: str = Field(
        ...,
        description="Natural language question e.g. 'Which bins need immediate collection?'"
    )


class AIQueryResponse(BaseModel):
    query: str
    answer: str
    cards: List[ActionCard] = Field(default_factory=list)
    recommended_actions: List[str] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
