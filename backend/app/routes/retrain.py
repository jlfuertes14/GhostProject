"""
Routes for CSV upload and model retraining.
"""

from fastapi import APIRouter, File, HTTPException, UploadFile
import pandas as pd
from pathlib import Path
import shutil

from app.models.schemas import RetrainResponse
from app.database import init_db
from app.routes.analytics import _compute_analytics
from app.routes.predict import load_models

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_PATH = BASE_DIR / "data" / "dpwh_flood_control_projects.csv"

# Columns that MUST exist in the uploaded CSV for retraining to proceed.
REQUIRED_COLUMNS = {
    "Region",
    "Province",
    "Municipality",
    "ContractCost",
    "ApprovedBudgetForContract",
}


@router.post("/retrain", response_model=RetrainResponse)
async def retrain_model(file: UploadFile = File(...)):
    """
    POST /api/retrain

    Accepts a CSV upload, validates the schema, replaces the dataset,
    and reinitializes the data pipeline and analytics cache.
    """
    # --- Step 1: Validate file type ---
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only .csv files are accepted.",
        )

    # Save uploaded file temporarily to validate it
    temp_path = BASE_DIR / "data" / "temp_upload.csv"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        df = pd.read_csv(temp_path)
    except Exception as e:
        temp_path.unlink()
        raise HTTPException(status_code=400, detail=f"Invalid CSV format: {e}")

    # Check for required columns
    missing_cols = REQUIRED_COLUMNS - set(df.columns)
    if missing_cols:
        temp_path.unlink()
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {', '.join(missing_cols)}"
        )

    # Replace old data
    if DATA_PATH.exists():
        DATA_PATH.unlink()
    temp_path.rename(DATA_PATH)

    # Rebuild database and caches
    try:
        init_db()
        _compute_analytics.cache_clear()
        
        # We would run notebooks here via subprocess for a real retraining pipeline,
        # but for V1 we just reload the existing/newest models to simulate.
        load_models()
        
        return RetrainResponse(
            status="success",
            message="Database rebuilt and models reloaded successfully.",
            records_processed=len(df),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {e}")
