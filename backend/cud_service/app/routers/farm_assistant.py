from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
import logging
from app.services.gemini_service import ask_gemini

logger = logging.getLogger(__name__)
router = APIRouter()

class FarmAssistantRequest(BaseModel):
    question: str

class FarmAssistantResponse(BaseModel):
    answer: str
    question: str

@router.post("/farm-assistant", response_model=FarmAssistantResponse)
async def farm_assistant(request: FarmAssistantRequest, req: Request):
    user_id = getattr(req.state, "user_id", None)
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if not request.question or len(request.question.strip()) == 0:
        raise HTTPException(status_code=400, detail="Question is required")
    
    try:
        logger.info(f"Farm assistant request from user {user_id}: {request.question[:50]}...")
        
        answer = ask_gemini(request.question)
        
        return FarmAssistantResponse(
            answer=answer,
            question=request.question
        )
        
    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Farm assistant error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get response: {str(e)}")
