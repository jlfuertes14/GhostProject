import duckdb
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
CSV_PATH = DATA_DIR / "dpwh_flood_control_projects.csv"
DB_PATH = BASE_DIR / "flood_projects.duckdb"

def get_db_connection():
    """Returns a DuckDB connection."""
    return duckdb.connect(str(DB_PATH))

def init_db():
    """Initialize the DuckDB database from the CSV file."""
    if not CSV_PATH.exists():
        print(f"Warning: CSV data not found at {CSV_PATH}")
        return
        
    conn = get_db_connection()
    try:
        # Check if table exists
        result = conn.execute("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='projects'").fetchone()
        if result[0] == 0:
            print("Initializing DuckDB 'projects' table from CSV...")
            conn.execute(f"CREATE TABLE projects AS SELECT * FROM read_csv_auto('{CSV_PATH}')")
            print("Table created successfully.")
        else:
            print("DuckDB 'projects' table already exists.")
    except Exception as e:
        print(f"Database initialization error: {e}")
    finally:
        conn.close()
