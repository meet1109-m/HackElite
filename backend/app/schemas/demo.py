from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class DemoStep(BaseModel):
    step_number: int
    title: str
    description: str
    action_taken: str
    data_snapshot: Dict[str, Any]


class DemoRunResponse(BaseModel):
    demo_id: str
    status: str
    total_steps: int = 10
    steps: List[DemoStep]
    final_summary: Dict[str, Any]
    label: str = "Scripted Hackathon Demo Runner"
