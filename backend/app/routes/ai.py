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
    response = process_ai_query(payload.query)
    return response
