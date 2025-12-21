# app/routes/questions.py
"""Question endpoints."""

from fastapi import APIRouter, HTTPException
from ..models import QuestionResponse, LikertOption
from ..services import ontology_service

router = APIRouter(prefix="/api", tags=["Questions"])


@router.get("/questions")
async def get_questions():
    """Get all 50 IPIP questions."""
    if not ontology_service.is_loaded:
        raise HTTPException(status_code=500, detail="Ontology not loaded")
    
    questions_data, likert_data = ontology_service.get_questions()
    
    questions = [
        QuestionResponse(id=q['id'], text=q['text'], trait=q['trait'], reversed=q['reversed'])
        for q in questions_data
    ]
    likert_options = [
        LikertOption(value=opt['value'], label=opt['label'])
        for opt in likert_data
    ]
    
    return {"questions": questions, "likertOptions": likert_options}


@router.get("/likert-options")
async def get_likert_options():
    """Get Likert scale options."""
    if not ontology_service.is_loaded:
        raise HTTPException(status_code=500, detail="Ontology not loaded")
    
    _, likert_data = ontology_service.get_questions()
    return {"likertOptions": likert_data}


@router.get("/traits")
async def get_traits():
    """Get Big Five trait information."""
    if not ontology_service.is_loaded:
        raise HTTPException(status_code=500, detail="Ontology not loaded")
    
    return {"traits": ontology_service.get_trait_info()}
