"""
FastAPI REST API Endpoints for Machine Learning Models.
Exposes endpoints for real-time sentiment analysis, crisis risk evaluation, mood trajectory forecasting, and semantic search.
"""
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.api.deps import get_current_user
from app.ml.sentiment_engine import ml_sentiment_engine
from app.ml.crisis_sentinel import ml_crisis_sentinel
from app.ml.mood_forecaster import ml_mood_forecaster
from app.ml.semantic_embeddings import ml_semantic_engine

router = APIRouter()


# --- Pydantic Request & Response Schemas ---

class SentimentAnalysisRequest(BaseModel):
    text: str = Field(..., example="I felt peaceful after my evening breathing session.")

class SentimentAnalysisResponse(BaseModel):
    valence: float
    arousal: float
    dominance: float
    primary_emotion: str
    confidence: float
    emotion_breakdown: Dict[str, float]

class RiskEvaluationRequest(BaseModel):
    text: str = Field(..., example="Feeling very overwhelmed today.")

class RiskEvaluationResponse(BaseModel):
    risk_score: float
    risk_level: str
    flagged_crisis: bool
    triggers_detected: List[str]
    action_recommended: str

class MoodForecastRequest(BaseModel):
    mood_history: Optional[List[Dict[str, Any]]] = Field(default_factory=list)

class SemanticSearchRequest(BaseModel):
    query: str = Field(..., example="Find entries where I felt hopeful and calm")
    entries: List[Dict[str, Any]] = Field(default_factory=list)


# --- API Endpoints ---

@router.post(
    "/analyze-sentiment",
    response_model=SentimentAnalysisResponse,
    summary="Real-time ML Sentiment & Multi-dimensional Emotion Analysis",
    description="Calculates VAD (Valence, Arousal, Dominance) scores and emotion probabilities for text input."
)
def analyze_sentiment(payload: SentimentAnalysisRequest):
    result = ml_sentiment_engine.analyze_text(payload.text)
    return result


@router.post(
    "/predict-risk",
    response_model=RiskEvaluationResponse,
    summary="ML Crisis Sentinel & Distress Risk Evaluation",
    description="Evaluates input text for crisis distress indicators and returns safety recommendations."
)
def predict_risk(payload: RiskEvaluationRequest):
    result = ml_crisis_sentinel.evaluate_risk(payload.text)
    return result


@router.post(
    "/forecast-mood",
    summary="ML 7-Day Mood Trajectory & Burnout Vulnerability Predictor",
    description="Computes emotional momentum, stability scores, and 7-day predictive trajectory."
)
def forecast_mood(payload: MoodForecastRequest):
    result = ml_mood_forecaster.forecast_user_mood(payload.mood_history)
    return result


@router.post(
    "/semantic-search",
    summary="ML Semantic Vector Search for Encrypted Journal Reflections",
    description="Uses dense embedding cosine similarity to rank journal entries by semantic relevance."
)
def semantic_search(payload: SemanticSearchRequest):
    query_vector = ml_semantic_engine.generate_embedding(payload.query)
    results = []

    for entry in payload.entries:
        content = entry.get("content", "") or entry.get("title", "")
        entry_vector = ml_semantic_engine.generate_embedding(content)
        similarity = ml_semantic_engine.cosine_similarity(query_vector, entry_vector)
        
        entry_copy = dict(entry)
        entry_copy["semantic_similarity_score"] = similarity
        results.append(entry_copy)

    # Sort descending by similarity
    results.sort(key=lambda x: x["semantic_similarity_score"], reverse=True)
    return {"query": payload.query, "results": results}
