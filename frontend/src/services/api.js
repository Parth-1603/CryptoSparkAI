/**
 * api.js — Centralised API client for CryptoSpark AI
 *
 * All components import { api } from '../services/api' (or the
 * equivalent relative path). The base URL is read from the Vite
 * environment variable VITE_API_URL so it stays configurable without
 * touching source code.
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Thin wrapper around fetch that throws a descriptive Error on non-2xx
 * responses, preserving the JSON body as the error message when the
 * backend sends one.
 */
async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE}${path}`, opts);

  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const json = await res.json();
      msg = json?.detail || JSON.stringify(json) || msg;
    } catch {
      // ignore JSON parse failure; use status text
    }
    throw new Error(msg);
  }

  return res.json();
}

export const api = {
  // ── Market ─────────────────────────────────────────────────────────
  /** Returns the full dashboard KPI / summary object */
  getMarketSummary: () => request('GET', '/v1/market/summary'),

  /** Returns the live watchlist array shown in the Dashboard table */
  getWatchlist: () => request('GET', '/v1/market/watchlist'),

  /** Returns the global-signals array shown in the Dashboard sidebar */
  getSignals: () => request('GET', '/v1/market/signals'),

  // ── Predictions ─────────────────────────────────────────────────────
  /**
   * Run a prediction pipeline.
   * @param {string} asset     e.g. "Bitcoin (BTC)"
   * @param {string} period    e.g. "1H" | "1D" | "1W"
   * @param {string} algorithm e.g. "XGBoost (Gradient Boosting)"
   */
  predict: (asset, period, algorithm) =>
    request('POST', '/v1/predict', { asset, period, algorithm }),

  // ── Explainability ──────────────────────────────────────────────────
  /**
   * Request natural language AI explainability for a prediction result.
   * @param {Object} predictionData Full result object returned by api.predict()
   */
  explain: (predictionData) =>
    request('POST', '/v1/explain', {
      asset: predictionData.asset,
      period: predictionData.period,
      algorithm: predictionData.algorithm,
      predictedPrice: predictionData.price,
      currentPrice: predictionData.currentPrice,
      signal: predictionData.signal,
      confidence: predictionData.confidence,
      pnlEstimate: predictionData.pnlEstimate,
      features: predictionData.features,
      topFeatures: predictionData.topFeatures,
    }),

  // ── Pipeline Health ─────────────────────────────────────────────────
  /**
   * Returns end-to-end component health (models, datasets, APIs).
   */
  getPipelineHealth: () => request('GET', '/v1/pipeline/health'),

  // ── Model Metrics ───────────────────────────────────────────────────
  /** Returns leaderboard and feature importances */
  getModelMetrics: () => request('GET', '/v1/models/metrics'),

  // ── Infrastructure ──────────────────────────────────────────────────
  /** Returns cluster and processing status */
  getInfrastructureStatus: () => request('GET', '/v1/infrastructure/status'),
  getInfrastructureLogs: () => request('GET', '/v1/infrastructure/logs'),

  // ── Chatbot ─────────────────────────────────────────────────────────
  /**
   * Send a message to the AI assistant.
   * @param {string} message   The user's latest message
   * @param {Array}  history   Prior { role, content } messages
   */
  chat: (message, history = []) =>
    request('POST', '/v1/chat', { message, history }),
};
