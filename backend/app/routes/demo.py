"""SmartBinX Scripted Hackathon Demo Endpoints.

Endpoints for running the automated 10-step hackathon demo sequence and step-by-step inspections.
"""

from fastapi import APIRouter, HTTPException, Path, Depends

from app.schemas.demo import DemoStep, DemoRunResponse
from app.services.demo_runner import demo_runner
from app.models.entities import User
from app.services.security import get_current_active_user

router = APIRouter(prefix="/api/demo", tags=["Demo Runner"])


@router.post("/run", response_model=DemoRunResponse)
def run_full_demo_endpoint(
    current_user: User = Depends(get_current_active_user),
):
    """Execute the full 10-step scripted hackathon demo sequence automatically."""
    result = demo_runner.run_full_demo()
    return result


@router.get("/step/{step_number}", response_model=DemoStep)
def run_demo_step_endpoint(
    step_number: int = Path(..., ge=1, le=10, description="Demo step number (1 to 10)")
):
    """Execute and inspect an individual step of the 10-step demo sequence."""
    try:
        result = demo_runner.run_demo_step(step_number)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to execute demo step {step_number}: {str(e)}")


@router.post("/reset")
def reset_demo_endpoint(
    current_user: User = Depends(get_current_active_user),
):
    """Reset the demo runner and in-memory data store to baseline."""
    result = demo_runner.reset_demo()
    return result
