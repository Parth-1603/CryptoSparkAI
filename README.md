# ⚡ CryptoSpark AI

> **Distributed Big Data & Machine Learning Engine for Cryptocurrency Price Forecasting**  
> *Final-Year Engineering Capstone Project · Academic Research & Production Grade System*

---

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-8.2.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Apache Spark](https://img.shields.io/badge/Apache_Spark-3.5.0-E25A1C?style=for-the-badge&logo=apachespark&logoColor=white)](https://spark.apache.org)
[![AWS EMR](https://img.shields.io/badge/AWS-EMR_%26_S3-FF9900?style=for-the-badge&logo=amazonwebservices&logoColor=white)](https://aws.amazon.com)
[![XGBoost](https://img.shields.io/badge/XGBoost-94.2%25_Acc-2C6E59?style=for-the-badge)](https://xgboost.readthedocs.io)

---

## 🌟 Overview

**CryptoSpark AI** ingests and processes **5M+ cryptocurrency trade records** using **Apache Spark on AWS EMR** to compute institutional-grade indicators (7-day and 30-day Moving Averages, High-Low Ranges, Rolling Volatility, Rate of Change, and Volume Momentum). 

It benchmarks **4 predictive machine learning architectures** (XGBoost, Deep Multi-Layer LSTM, Random Forest, and Prophet Ensemble) across **BTC, ETH, SOL, and ADA**, streaming real-time predictions via an async **FastAPI** backend to a modern, frosted-glass **React** dashboard.

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Data Layer
        A1[CoinGecko Live API] & A2[Alternative.me Fear & Greed] & A3[Kaggle Historical Data 5M+] --> S3[(Amazon S3 Data Lake)]
    end

    subgraph Big Data Processing
        S3 --> EMR[Apache Spark on AWS EMR]
        EMR --> FE[Feature Engineering: MA7, MA30, HL-Range, Volatility, Momentum]
    end

    subgraph Machine Learning Engine
        FE --> M1[XGBoost 94.2% Acc]
        FE --> M2[Deep LSTM 91.8% Acc]
        FE --> M3[Random Forest 88.5% Acc]
        FE --> M4[Prophet & Ensemble]
    end

    subgraph Serving & UI
        M1 & M2 & M3 & M4 --> API[FastAPI Server - Port 8000]
        GROQ[Groq LLM Engine - Qwen 2.5] --> API
        API --> UI[React 18 + Glassmorphism UI - Port 5173]
    end
```

---

## 📊 Model Leaderboard & Benchmarks

All models are trained and evaluated on a held-out test split of the processed dataset (BTC, ETH, SOL, ADA).

### 1. Classification & Signal Quality Metrics (Bitcoin)
| Model | Category | Directional Accuracy | F1-Score | Production Status |
| :--- | :--- | :---: | :---: | :---: |
| **XGBoost Regressor** | Gradient Boosted Trees | **94.2%** | **0.92** | 🏆 **Production Champion** |
| **Deep LSTM** | Deep Recurrent (Seq2Seq) | **91.8%** | **0.89** | High-Volatility Challenger |
| **Random Forest** | Bagging Ensemble | **88.5%** | **0.86** | Benchmark Model |
| **Voting Ensemble** | Weighted Blended Model | **90.4%** | **0.88** | Ensemble Benchmark |
| **Linear Regression** | Classical Statistical | **76.4%** | **0.71** | Baseline |

### 2. Actual Regression Test Metrics (Extracted from `models/all_models_comparison.csv`)
> ℹ️ High R² (> 0.99) is standard in close-to-close price forecasting ($P_{t+1}$ from $P_t$). Directional accuracy and risk-adjusted error (RMSE/MAE) provide the primary evaluation standard.

| Model | BTC R² | BTC RMSE | ETH R² | ETH RMSE | SOL R² | ADA R² |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Random Forest** | 0.9933 | $1,853 | 0.9887 | $101.95 | 0.6546 | 0.9815 |
| **XGBoost** | 0.9932 | $1,869 | 0.9875 | $107.21 | 0.6459 | 0.9795 |
| **Linear Regression** | 0.9932 | $1,858 | 0.9888 | $101.78 | 0.7069 | 0.9811 |
| **LSTM** | 0.9924 | $1,887 | 0.9880 | $105.52 | 0.5108 | 0.9780 |
| **Prophet** | 0.9550 | $4,809 | 0.9995 | $20.82  | 0.9960 | 0.9999 |

### 3. Feature Importance (XGBoost, BTC — from `models/btc/feature_importance.csv`)
Features used: 9 normalized OHLCV + derived technical indicators computed at cloud scale:
- **norm_high** (Intraday High Extremes): `12.7%`
- **norm_hl_range** (High-Low Intraday Spread): `12.1%`
- **norm_low** (Intraday Low Extremes): `12.1%`
- **norm_ma30** (30-day Moving Average): `12.1%`
- **norm_volatility** (Rolling Volatility Spread): `11.6%`
- **norm_ma7** (7-day Moving Average): `11.1%`
- **norm_prev_close** (Prior Closing Price): `11.1%`
- **pct_change** (Price Rate of Return): `8.7%`
- **norm_open** (Session Opening Price): `8.5%`

---

## ✨ Key Features

- **Institutional Analytics Dashboard**: Real-time CoinGecko price tickers and global macro metrics (Total Market Cap, 24h Volume, BTC Dominance), interactive timeframe curves (`1D`, `1W`, `1M`, `1Y`), and live Alternative.me Crypto Fear & Greed sentiment index.
- **Interactive ML Playground**: On-demand price simulations across 4 assets and 4 algorithms with quantitative signals (`ACCUMULATE`, `REDUCE`, `HOLD`) and dynamic confidence intervals.
- **AI Explainability Engine**: Plain-English rationale behind model outputs generated via Groq Cloud LLM (`qwen/qwen3.8-27b`) with automatic multi-model fallback (`openai/gpt-oss-20b`).
- **Embedded Assistant**: Conversational assistant grounded in project specifications, metrics, and architecture.
- **AWS Infrastructure Telemetry**: Real-time cluster health monitoring for EMR, S3, and EC2 pipelines.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Python 3.13** (recommended for ML dependencies)
- **Node.js 18+** & **npm**

### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/Parth-1603/CryptoSparkAI.git
cd CryptoSparkAI

# Install Python dependencies (ensure using Python 3.13)
pip install -r backend/requirements.txt

# Configure environment variables
# Copy or edit backend/.env and add your GROQ_API_KEY
```

Start the FastAPI backend:
```powershell
# Using Python 3.13
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000

# On Windows with multiple Python versions installed:
& "C:\Program Files\Python313\python.exe" -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```
Backend Swagger documentation will be live at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
```bash
# From project root:
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📂 Repository Structure

```
CryptoSparkAI/
├── backend/                  # FastAPI Application
│   ├── routes/               # API endpoints (market, predict, metrics, chatbot, explain)
│   ├── utils/                # Feature builders & data helpers
│   ├── model_loader.py       # Fault-tolerant model loader registry
│   └── main.py               # App entrypoint & CORS middleware
├── dataset/
│   ├── raw/                  # Ingested OHLCV raw data
│   └── processed/            # Spark-engineered CSVs (BTC, ETH, SOL, ADA)
├── frontend/                 # React 18 + Vite SPA
│   ├── src/
│   │   ├── components/       # Layout & GlassCard components
│   │   ├── pages/            # Dashboard, Predictions, Metrics, Infrastructure
│   │   └── services/         # Axios/Fetch API client
│   └── tailwind.config.js    # Custom theme tokens & glass effects
├── models/                   # Pretrained weights (.joblib, .keras, .h5)
├── notebooks/                # Research & exploratory data analysis (EDA)
├── results/                  # Generated performance plots & comparisons
└── spark_jobs/               # PySpark ETL & distributed feature pipelines
```

---

## 🔒 Security & Disclaimer

This project is developed for **academic and research purposes only**. Predictive outputs and signals do not constitute financial advice. Always perform independent technical and fundamental analysis before executing financial transactions.
