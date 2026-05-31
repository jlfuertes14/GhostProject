# Notebooks

Google Colab ML pipeline notebooks:

| Notebook | Purpose |
|----------|---------|
| `01_eda.ipynb` | Exploratory Data Analysis |
| `02_preprocessing.ipynb` | Feature engineering & encoding |
| `03_delay_prediction.ipynb` | Train delay classification model |
| `04_budget_prediction.ipynb` | Train budget regression model |
| `05_export_model.ipynb` | Export model artifacts (.pkl) |

## How to use

1. Upload your CSV to Google Colab
2. Run notebooks in order (01 → 05)
3. Download the exported `.pkl` files from notebook 05
4. Place them in the `model_artifacts/` directory
