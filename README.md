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

**CryptoSpark AI** ingests and processes **5M+ cryptocurrency trade records** using **Apache Spark on AWS EMR** to compute institutional-grade indicators (Moving Averages, Volume Momentum, Volatility Indices, RSI). 

It benchmarks **4 predictive machine learning architectures** (XGBoost, Deep Multi-Layer LSTM, Random Forest, and Prophet Ensemble) across **BTC, ETH, SOL, and ADA**, streaming real-time predictions via an async **FastAPI** backend to a modern, frosted-glass **React** dashboard.

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Data Layer
        A1[CoinGecko Live API] & A2[Kaggle Historical Data 5M+] --> S3[(Amazon S3 Data Lake)]
    end

    subgraph Big Data Processing
        S3 --> EMR[Apache Spark on AWS EMR]
        EMR --> FE[Feature Engineering: MA7, MA30, RSI, Volatility, Volume]
    end

    subgraph Machine Learning Engine
        FE --> M1[XGBoost 94.2%]
        FE --> M2[Deep LSTM 91.8%]
        FE --> M3[Random Forest 88.5%]
        FE --> M4[Prophet & Ensemble]
    end

    subgraph Serving & UI
        M1 & M2 & M3 & M4 --> API[FastAPI Server - Port 8000]
        GROQ[Groq LLM Engine] --> API
        API --> UI[React 18 + Glassmorphism UI - Port 5173]
    end
```

---

## 📊 Model Leaderboard & Benchmarks

All models are trained and cross-validated across multi-horizon corridors (`1H`, `1D`, `1W`, `1M`):

| Model | Architecture | Directional Accuracy | RMSE | F1-Score | Training Runtime |
| :--- | :--- | :---: | :---: | :---: | :--- |
| 🥇 **XGBoost v2.4** | Gradient Boosted Trees | **94.2%** | **0.041** | **0.92** | 42m · AWS EMR |
| 🥈 **Deep LSTM** | 2-Layer Recurrent Neural Net | **91.8%** | **0.058** | **0.89** | 124m · p3.2xlarge |
| 🥉 **Random Forest** | Bagging Ensemble | **88.5%** | **0.072** | **0.86** | 18m · m5.xlarge |
| 🔹 **Linear Baseline** | Ridge Regression | **76.4%** | **0.145** | **0.71** | 2m · Local CPU |

### Feature Importance Weights
- **Previous Close**: `42.8%`
- **Volume Momentum (24h)**: `28.4%`
- **RSI (14)**: `15.2%`
- **MACD Divergence**: `9.1%`
- **Order Book Imbalance / Volatility**: `4.5%`

---

## ✨ Key Features

- **Institutional Analytics Dashboard**: Real-time CoinGecko price tickers, interactive timeframe curves (`1D`, `1W`, `1M`, `1Y`), volume momentum distribution, and fear-and-greed sentiment gauges.
- **Interactive ML Playground**: On-demand price simulations across 4 assets and 4 algorithms with quantitative signals (`ACCUMULATE`, `REDUCE`, `HOLD`).
- **AI Explainability Engine**: Plain-English rationale behind model outputs generated via Groq LLM integration.
- **Embedded Assistant**: Conversational assistant trained on project specifications, metrics, and architecture.
- **AWS Infrastructure Telemetry**: Real-time cluster health monitoring for EMR, S3, and EC2 pipelines.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Python 3.13** (recommended)
- **Node.js 18+** & **npm**

### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/Parth-1603/CryptoSparkAI.git
cd CryptoSparkAI

# Install Python dependencies
pip install -r backend/requirements.txt

# Configure environment variables
# Edit backend/.env and add your GROQ_API_KEY if using LLM features
```

Start the FastAPI backend:
```powershell
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
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
