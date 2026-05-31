<div align="center">
  
  # 🌊 AI Flood Infrastructure Planning Platform
  
  **Predictive intelligence and geospatial analytics for Philippine flood control infrastructure.** <br>
  *Powered by 9,855 historical DPWH projects (2018–2025).*

  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![XGBoost](https://img.shields.io/badge/XGBoost-2.0-blue?style=flat)](https://xgboost.ai/)
  [![DuckDB](https://img.shields.io/badge/DuckDB-Analytics-yellow?style=flat)](https://duckdb.org/)
  [![Hugging Face](https://img.shields.io/badge/%F0%9F%A4%97-Hugging_Face-FFD21E?style=flat)](https://huggingface.co/)
  
  [**View Live Demo**](#) • [**API Documentation**](#) • [**Read Case Study**](#)

</div>

---

## 📖 Overview

Flood control infrastructure planning in the Philippines has historically faced challenges with budget estimation accuracy and project delivery timelines. 

This platform leverages **Machine Learning** to provide stakeholders with predictive analytics, predicting **project delivery risk** and estimating **future project costs** based on historical data. By transforming over 9,800 raw government procurement records into actionable geospatial intelligence, we empower better decision-making for climate resilience.

## ✨ Key Features

- 🗺️ **Nationwide Geospatial Visualization**: Interactive map rendering thousands of infrastructure dots, clustered and color-coded by risk and status.
- 📊 **Real-time Analytics Dashboard**: Live metrics on total budgets, top executing contractors, and regional infrastructure distribution using an embedded analytical database.
- ⏱️ **Delay Prediction ML Engine**: XGBoost classification model that flags high-risk projects likely to exceed their intended timelines based on regional and fiscal parameters.
- 💰 **Budget Estimation ML Engine**: XGBoost regression model that predicts the optimal contract budget for proposed flood control projects.
- ⚡ **Lightning-Fast Architecture**: Fully decoupled Next.js Server Components frontend communicating with a containerized FastAPI backend.

---

## 🏗️ Architecture & Tech Stack

The platform is designed as a decoupled, microservice-style application optimized for free-tier cloud deployment.

### Frontend (Client UI) - *Deployed on Vercel*
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **Mapping**: Leaflet / React-Leaflet
- **Data Fetching**: React Server Components (RSC)

### Backend (API & ML) - *Deployed on Hugging Face Spaces (Docker)*
- **Framework**: FastAPI
- **Language**: Python 3.11
- **Database**: DuckDB (in-memory analytics via local `.duckdb` persistence)
- **Machine Learning**: XGBoost, Scikit-Learn, Pandas

---

## 🧠 The Machine Learning Pipeline

Our models were trained and evaluated on historical DPWH datasets in a series of Jupyter Notebooks (`02_preprocessing.ipynb`, `03_delay_prediction.ipynb`, `04_budget_prediction.ipynb`). 

To ensure full transparency into how the AI detects anomalies (often referred to as potential "Ghost Projects"), the models evaluate risk based on three core learned patterns:

1. **Contractor History:** The AI learned that specific contractors who take on massive budgets but consistently fail to deliver on time carry an inherently high risk.
2. **Budget vs. Physical Target Discrepancies:** If a project requests an enormous budget (e.g., ₱500M) but the "Physical Target" (the actual amount of concrete/work) is suspiciously low compared to historical averages, the AI flags it as a high risk for budget overruns or anomalies.
3. **Regional Patterns:** The AI learned from the dataset which specific Regions and Provinces have the highest rates of uncompleted or severely delayed flood infrastructure projects.

### Model Details

1. **Delay Risk Classifier** (XGBoost Classification)
   - **Target**: `IsDelayed` (Boolean) based on comparing actual vs original completion dates.
   - **Features**: Region, Province, Contract Duration, Original Budget, Contractor.
   - **Evaluation**: The model underwent extensive hyperparameter tuning using GridSearch to maximize Precision and Recall, ensuring false positives for project delays are minimized.

2. **Budget Estimator** (XGBoost Regression)
   - **Target**: `ApprovedBudgetForContract` (Continuous prediction).
   - **Features**: Region, Province, Target Days, Intervention Type.
   - **Evaluation**: The model was evaluated using Mean Absolute Error (MAE) and R² to accurately estimate the required budget based strictly on historical, completed baselines.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Git

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/ai-flood-infra-platform.git
cd ai-flood-infra-platform
```

### 2. Backend Setup
The backend serves the ML models and the DuckDB analytics engine.
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup Environment Variables (Optional for local dev)
cp .env.example .env

# Run the FastAPI server
uvicorn app.main:app --reload --port 8000
```
*The backend API will be available at `http://localhost:8000`.*

### 3. Frontend Setup
The frontend provides the interactive map and dashboards.
```bash
cd ../frontend

# Install dependencies
npm install

# Configure Environment Variables
# Create a .env.local file and add:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Start the development server
npm run dev
```
*The frontend will be available at `http://localhost:3000`.*

---

## 🌐 Deployment Architecture

- **Backend (Hugging Face Spaces)**: The `backend/` directory is containerized via a custom `Dockerfile` using a non-root user and deployed directly to Hugging Face Spaces. It uses **Git LFS** for hosting the `.pkl` and `.parquet` model artifacts securely.
- **Frontend (Vercel)**: The `frontend/` directory is linked to Vercel, which automatically builds the Next.js App Router static pages and serverless functions.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments & Data Source

Special thanks to **[bwandowando](https://www.kaggle.com/bwandowando)** for providing the core dataset that powers these models. The data was sourced from the Kaggle dataset: 
**[DPWH Flood Control Projects](https://www.kaggle.com/datasets/bwandowando/dpwh-flood-control-projects/code)**.

---

<div align="center">
  <i>Built to enhance climate resilience and infrastructure planning in the Philippines.</i>
</div>
