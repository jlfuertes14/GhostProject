"""
Routes for dashboard analytics (cached).
"""

from functools import lru_cache

from fastapi import APIRouter

from app.models.schemas import AnalyticsResponse
from app.database import get_db_connection

router = APIRouter()


@lru_cache(maxsize=1)
def _compute_analytics() -> dict:
    """
    Compute analytics from the data store.
    Cached because historical data only changes after a retrain.
    """
    conn = get_db_connection()
    try:
        # Check if table exists
        result = conn.execute("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='projects'").fetchone()
        if result[0] == 0:
            return {
                "total_projects": 0,
                "total_budget": 0.0,
                "top_provinces": [],
                "top_contractors": [],
            }
            
        total_projects = conn.execute("SELECT COUNT(*) FROM projects").fetchone()[0]
        total_budget = conn.execute("SELECT SUM(TRY_CAST(REPLACE(ApprovedBudgetForContract, ',', '') AS DOUBLE)) FROM projects").fetchone()[0] or 0.0
        
        provinces_df = conn.execute("SELECT Province as province, COUNT(*) as count FROM projects GROUP BY Province ORDER BY count DESC LIMIT 5").fetchdf()
        top_provinces = provinces_df.to_dict(orient="records")
        
        contractors_df = conn.execute("SELECT Contractor as contractor, COUNT(*) as count FROM projects GROUP BY Contractor ORDER BY count DESC LIMIT 5").fetchdf()
        top_contractors = contractors_df.to_dict(orient="records")
        
        return {
            "total_projects": int(total_projects),
            "total_budget": float(total_budget),
            "top_provinces": top_provinces,
            "top_contractors": top_contractors,
        }
    except Exception as e:
        print(f"Error computing analytics: {e}")
        return {
            "total_projects": 0,
            "total_budget": 0.0,
            "top_provinces": [],
            "top_contractors": [],
        }
    finally:
        conn.close()


@router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics():
    """
    GET /api/analytics

    Returns aggregated dashboard statistics.
    Results are cached and only invalidated on retrain.
    """
    return _compute_analytics()
