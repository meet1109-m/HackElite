"""SmartBinX AI Decision Support Assistant Endpoint.

Endpoint for natural-language operational queries powered by the grounded AI manager.
"""

from fastapi import APIRouter

from app.schemas.ai import AIQueryRequest, AIQueryResponse
from app.services.ai_manager_service import process_ai_query

router = APIRouter(prefix="/api/ai", tags=["AI Operations Copilot"])


@router.post("/query", response_model=AIQueryResponse)
def query_ai_endpoint(payload: AIQueryRequest):
    """Submit a natural-language question to the SmartBinX Operations Copilot.

    Returns a markdown-formatted answer, actionable UI cards, and concrete recommendations.
    """
    response = process_ai_query(payload.effective_query)
    
    # Ensure suggested_actions is populated
    if "suggested_actions" not in response:
        response["suggested_actions"] = list(response.get("recommended_actions", []))
    
    # Ensure each card has a structured data list for frontend card grid
    for card in response.get("cards", []):
        if not card.get("data") and card.get("details"):
            card["data"] = [
                {"label": k.replace("_", " ").title(), "value": str(v)}
                for k, v in card["details"].items()
            ]

    return response

