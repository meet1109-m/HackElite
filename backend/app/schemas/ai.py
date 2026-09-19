from datetime import datetime
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class ActionCard(BaseModel):
    title: str
    subtitle: Optional[str] = None
    badge: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    data: Optional[List[Dict[str, Any]]] = None
    action_type: Optional[str] = Field(None, description="e.g. 'assign_vehicle', 'replan_route', 'inspect_bin'")
    action_target: Optional[str] = None


class AIQueryRequest(BaseModel):
    query: Optional[str] = Field(
        None,
        description="Natural language question e.g. 'Which bins need immediate collection?'"
    )
    prompt: Optional[str] = Field(
        None,
        description="Frontend alias for query"
    )
    context: Optional[Dict[str, Any]] = None

    @property
    def effective_query(self) -> str:
        return self.query or self.prompt or "What is the status of the bins?"


class AIQueryResponse(BaseModel):
    query: str
    answer: str
    cards: List[ActionCard] = Field(default_factory=list)
    recommended_actions: List[str] = Field(default_factory=list)
    suggested_actions: List[str] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

