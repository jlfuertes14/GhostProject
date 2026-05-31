"""
Pydantic request/response schemas for the prediction and retrain endpoints.
"""

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Delay Prediction
# ---------------------------------------------------------------------------
class DelayPredictionRequest(BaseModel):
    """Input schema for POST /api/predict-delay"""

    province: str = Field(..., min_length=1, examples=["Bulacan"])
    contractor: str = Field(..., min_length=1, examples=["ABC Construction"])
    budget: float = Field(..., gt=0, examples=[45_000_000])
    project_type: str = Field(
        default="Flood Control",
        min_length=1,
        examples=["Flood Control"],
    )


class DelayPredictionResponse(BaseModel):
    """Output schema for POST /api/predict-delay"""

    delay_probability: float = Field(
        ..., ge=0, le=1, examples=[0.72]
    )


# ---------------------------------------------------------------------------
# Budget Prediction
# ---------------------------------------------------------------------------
class BudgetPredictionRequest(BaseModel):
    """Input schema for POST /api/predict-budget"""

    province: str = Field(..., min_length=1, examples=["Bulacan"])
    project_type: str = Field(..., min_length=1, examples=["Flood Control"])
    municipality: str | None = Field(default=None, examples=["Meycauayan"])


class BudgetPredictionResponse(BaseModel):
    """Output schema for POST /api/predict-budget"""

    predicted_budget: float = Field(..., examples=[51_000_000])


# ---------------------------------------------------------------------------
# Recommendation
# ---------------------------------------------------------------------------
class RecommendationRequest(BaseModel):
    """Input schema for POST /api/recommend"""

    province: str = Field(..., min_length=1, examples=["Bulacan"])
    municipality: str | None = Field(default=None, examples=["Meycauayan"])


class RecommendationResponse(BaseModel):
    """Output schema for POST /api/recommend"""

    recommended_project_type: str = Field(
        ..., examples=["Slope Protection"]
    )
    confidence: float = Field(..., ge=0, le=1, examples=[0.84])


# ---------------------------------------------------------------------------
# Retrain
# ---------------------------------------------------------------------------
class RetrainResponse(BaseModel):
    """Output schema for POST /api/retrain"""

    status: str = Field(..., examples=["success"])
    message: str = Field(
        ..., examples=["Models retrained successfully with 9855 records."]
    )
    records_processed: int = Field(..., examples=[9855])


# ---------------------------------------------------------------------------
# Analytics
# ---------------------------------------------------------------------------
class AnalyticsResponse(BaseModel):
    """Output schema for GET /api/analytics"""

    total_projects: int = Field(..., examples=[9855])
    total_budget: float = Field(..., examples=[128_000_000_000])
    top_provinces: list[dict] = Field(
        ...,
        examples=[[{"province": "Bulacan", "count": 320}]],
    )
    top_contractors: list[dict] = Field(
        ...,
        examples=[[{"contractor": "ABC Construction", "count": 45}]],
    )
