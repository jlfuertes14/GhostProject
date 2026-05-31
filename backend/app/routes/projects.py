"""
Routes for project listing and individual project retrieval.
"""

from fastapi import APIRouter, Query
import pandas as pd
from app.database import get_db_connection

from typing import Optional

router = APIRouter()

@router.get("/projects")
async def list_projects(
    limit: int = Query(50, ge=1, le=10000), 
    offset: int = Query(0, ge=0),
    search: Optional[str] = None,
    status: Optional[str] = None,
    region: Optional[str] = None,
    province: Optional[str] = None,
    municipality: Optional[str] = None,
    office: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "desc"
):
    """
    GET /api/projects

    Returns all DPWH flood control projects with their metadata.
    Will query from the DuckDB/SQLite data store.
    """
    conn = get_db_connection()
    try:
        where_clauses = []
        params = []
        
        if search:
            where_clauses.append("(LOWER(ProjectName) LIKE ? OR LOWER(Contractor) LIKE ? OR LOWER(ProjectId) LIKE ? OR LOWER(Province) LIKE ? OR LOWER(Region) LIKE ?)")
            search_pattern = f"%{search.lower()}%"
            params.extend([search_pattern, search_pattern, search_pattern, search_pattern, search_pattern])
            
        if status == "completed":
            where_clauses.append("ActualCompletionDate IS NOT NULL")
        elif status == "active":
            where_clauses.append("ActualCompletionDate IS NULL")
            
        if region:
            where_clauses.append("LOWER(Region) = ?")
            params.append(region.lower())
            
        if province:
            where_clauses.append("LOWER(Province) = ?")
            params.append(province.lower())
            
        if municipality:
            where_clauses.append("LOWER(Municipality) = ?")
            params.append(municipality.lower())
            
        if office:
            where_clauses.append("LOWER(DistrictEngineeringOffice) = ?")
            params.append(office.lower())
            
        where_sql = ""
        if where_clauses:
            where_sql = "WHERE " + " AND ".join(where_clauses)
            
        order_sql = ""
        if sort_by == "budget":
            direction = "ASC" if sort_order == "asc" else "DESC"
            order_sql = f"ORDER BY TRY_CAST(REPLACE(ApprovedBudgetForContract, ',', '') AS DOUBLE) {direction} NULLS LAST"
            
        count_query = f"SELECT COUNT(*) FROM projects {where_sql}"
        total = conn.execute(count_query, params).fetchone()[0]
        
        data_query = f"SELECT * FROM projects {where_sql} {order_sql} LIMIT {limit} OFFSET {offset}"
        df = conn.execute(data_query, params).fetchdf()
        
        # Handle NaN/NaT for JSON serialization
        df = df.replace({pd.NA: None, float('nan'): None})
        
        # Convert date columns to string
        for col in df.select_dtypes(include=['datetime', 'datetimetz']).columns:
            df[col] = df[col].dt.strftime('%Y-%m-%d')
            
        projects_list = df.to_dict(orient="records")
        
        return {
            "projects": projects_list,
            "total": total,
            "message": "Projects retrieved successfully.",
        }
    except Exception as e:
        return {
            "projects": [],
            "total": 0,
            "message": f"Error retrieving projects: {e}",
        }
    finally:
        conn.close()

@router.get("/options")
async def get_filter_options(
    region: Optional[str] = None,
    province: Optional[str] = None,
    municipality: Optional[str] = None
):
    """
    GET /api/options
    Returns distinct values for Region, Province, Municipality, and DistrictEngineeringOffice.
    Supports cascading filters via query parameters.
    """
    conn = get_db_connection()
    try:
        def fetch_list(query, params):
            results = conn.execute(query, params).fetchall()
            return [r[0] for r in results if r[0] is not None]
            
        # Regions: always full list
        regions = fetch_list("SELECT DISTINCT Region FROM projects WHERE Region IS NOT NULL ORDER BY Region", [])
        
        # Provinces: filtered by region only
        prov_where = ""
        prov_params = []
        if region:
            prov_where = " AND LOWER(Region) = ?"
            prov_params.append(region.lower())
        provinces = fetch_list(f"SELECT DISTINCT Province FROM projects WHERE Province IS NOT NULL{prov_where} ORDER BY Province", prov_params)
        
        # Municipalities: filtered by region and province
        muni_where = ""
        muni_params = []
        if region:
            muni_where += " AND LOWER(Region) = ?"
            muni_params.append(region.lower())
        if province:
            muni_where += " AND LOWER(Province) = ?"
            muni_params.append(province.lower())
        municipalities = fetch_list(f"SELECT DISTINCT Municipality FROM projects WHERE Municipality IS NOT NULL{muni_where} ORDER BY Municipality", muni_params)
        
        # Offices: filtered by region, province, and municipality
        off_where = muni_where
        off_params = muni_params.copy()
        if municipality:
            off_where += " AND LOWER(Municipality) = ?"
            off_params.append(municipality.lower())
        offices = fetch_list(f"SELECT DISTINCT DistrictEngineeringOffice FROM projects WHERE DistrictEngineeringOffice IS NOT NULL{off_where} ORDER BY DistrictEngineeringOffice", off_params)
        
        return {
            "regions": regions,
            "provinces": provinces,
            "municipalities": municipalities,
            "offices": offices
        }
    except Exception as e:
        return {
            "regions": [],
            "provinces": [],
            "municipalities": [],
            "offices": []
        }
    finally:
        conn.close()
