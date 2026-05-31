"""
Routes for ML predictions: delay, budget, and recommendation.
"""

from fastapi import APIRouter
import joblib
import pandas as pd
from pathlib import Path

from app.models.schemas import (
    BudgetPredictionRequest,
    BudgetPredictionResponse,
    DelayPredictionRequest,
    DelayPredictionResponse,
    RecommendationRequest,
    RecommendationResponse,
)

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ARTIFACTS_DIR = BASE_DIR / "model_artifacts"

encoder = None
config = None
delay_model = None
budget_model = None

def load_models():
    global encoder, config, delay_model, budget_model
    try:
        encoder = joblib.load(ARTIFACTS_DIR / "encoder.pkl")
        config = joblib.load(ARTIFACTS_DIR / "feature_config.pkl")
        delay_model = joblib.load(ARTIFACTS_DIR / "xgb_delay_model.pkl")
        budget_model = joblib.load(ARTIFACTS_DIR / "xgb_budget_model.pkl")
    except Exception as e:
        print(f"Models not loaded (run notebooks first): {e}")

load_models()


@router.post("/predict-delay", response_model=DelayPredictionResponse)
async def predict_delay(payload: DelayPredictionRequest):
    """
    POST /api/predict-delay

    Predicts the probability that a flood control project
    will be delivered late, based on province, contractor,
    budget, and project type.

    """
    if delay_model is None or encoder is None or config is None:
        return DelayPredictionResponse(delay_probability=0.0)
        
    df = pd.DataFrame([{
        'Region': 'Unknown',
        'Province': payload.province,
        'Municipality': 'Unknown',
        'TypeOfWork': payload.project_type,
        'Contractor': payload.contractor,
        'MainIsland': 'Unknown',
        'ApprovedBudgetForContract': payload.budget,
        'ContractorCount': 1,
        'FundingYear': 2024
    }])
    
    cat_cols = config['cat_cols']
    encoded_cols = config['encoded_cols']
    for col in cat_cols:
        if col not in df.columns:
            df[col] = 'Unknown'
            
    df[encoded_cols] = encoder.transform(df[cat_cols])
    X = df[config['delay_features']]
    prob = float(delay_model.predict_proba(X)[0][1])
    
    return DelayPredictionResponse(delay_probability=prob)


@router.post("/predict-budget", response_model=BudgetPredictionResponse)
async def predict_budget(payload: BudgetPredictionRequest):
    """
    POST /api/predict-budget

    Predicts the estimated contract cost for a future
    flood control project based on province and project type.

    """
    if budget_model is None or encoder is None or config is None:
        return BudgetPredictionResponse(predicted_budget=0.0)
        
    df = pd.DataFrame([{
        'Region': 'Unknown',
        'Province': payload.province,
        'Municipality': payload.municipality or 'Unknown',
        'TypeOfWork': payload.project_type,
        'MainIsland': 'Unknown',
        'FundingYear': 2024
    }])
    
    cat_cols = config['cat_cols']
    encoded_cols = config['encoded_cols']
    for col in cat_cols:
        if col not in df.columns:
            df[col] = 'Unknown'
            
    df[encoded_cols] = encoder.transform(df[cat_cols])
    X = df[config['budget_features']]
    pred = float(budget_model.predict(X)[0])
    
    return BudgetPredictionResponse(predicted_budget=pred)


@router.post("/predict")
async def predict_combined(payload: dict):
    """
    POST /api/predict
    Combines budget and delay predictions.
    """
    province = payload.get("province", "Unknown")
    budget = payload.get("approved_budget", 0)
    contractor = payload.get("implementing_office", "Unknown")
    
    # Simple calculation for frontend
    delay_prob = 0.0
    pred_budget = 0.0
    
    if delay_model is not None and encoder is not None and config is not None:
        df = pd.DataFrame([{
            'Region': payload.get("region", 'Unknown'),
            'Province': province,
            'Municipality': payload.get("municipality", 'Unknown'),
            'TypeOfWork': 'Flood Control',
            'Contractor': contractor,
            'MainIsland': 'Unknown',
            'ApprovedBudgetForContract': budget,
            'ContractorCount': 1,
            'FundingYear': 2024
        }])
        
        cat_cols = config['cat_cols']
        encoded_cols = config['encoded_cols']
        for col in cat_cols:
            if col not in df.columns:
                df[col] = 'Unknown'
                
        df[encoded_cols] = encoder.transform(df[cat_cols])
        
        try:
            X_delay = df[config['delay_features']]
            delay_prob = float(delay_model.predict_proba(X_delay)[0][1])
        except Exception:
            pass
            
        try:
            X_budget = df[config['budget_features']]
            pred_budget = float(budget_model.predict(X_budget)[0])
        except Exception:
            pred_budget = float(budget) * 1.1

    delay_days = delay_prob * 100 # Rough conversion for demo
    
    return {
        "delay_days": delay_days,
        "estimated_completion": "2024-12-31",
        "projected_budget": pred_budget,
        "cost_overrun_risk": pred_budget > (budget * 1.05) or delay_prob > 0.5
    }
