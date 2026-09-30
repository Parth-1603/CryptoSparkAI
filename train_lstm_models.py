import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os
import warnings
warnings.filterwarnings("ignore")

import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping

FEATURES = [
    "open", "high", "low", "close", "volume",
    "MA7", "MA30", "prev_close", "prev_volume",
    "price_change", "pct_change", "high_low_range", "volatility_7"
]

TARGET = "target_1d"
COINS = ["btc", "eth", "sol", "ada"]
SEQ_LEN = 30

def load_coin(coin):
    path = os.path.join("dataset", "processed", f"{coin}_processed.csv")
    if not os.path.exists(path):
        path = f"{coin}_processed.csv"
    df = pd.read_csv(path)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values("timestamp")
    df = df.dropna(subset=FEATURES + [TARGET])
    df = df.reset_index(drop=True)
    return df

def time_split(df, ratio=0.80):
    split_idx = int(len(df) * ratio)
    train = df.iloc[:split_idx]
    test  = df.iloc[split_idx:]
    return train, test

def make_sequences(X, y, seq_len):
    Xs, ys = [], []
    for i in range(len(X) - seq_len):
        Xs.append(X[i : i + seq_len])
        ys.append(y[i + seq_len])
    return np.array(Xs), np.array(ys)

def build_lstm_model(seq_len, n_features):
    model = Sequential([
        LSTM(128, return_sequences=True, input_shape=(seq_len, n_features)),
        Dropout(0.2),
        LSTM(64, return_sequences=False),
        Dropout(0.2),
        Dense(32, activation="relu"),
        Dense(1)
    ])
    model.compile(optimizer="adam", loss="mse")
    return model

def evaluate(y_true, y_pred, model_name, coin):
    mae  = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2   = r2_score(y_true, y_pred)
    print(f"\n  === {coin.upper()} - {model_name} ===")
    print(f"  MAE  : ${mae:,.2f}")
    print(f"  RMSE : ${rmse:,.2f}")
    print(f"  R2   : {r2:.4f}")
    return {
        "coin": coin.upper(),
        "model": model_name,
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "r2": round(r2, 4)
    }

print("=" * 50)
print("TRAINING LSTM — ALL 4 COINS")
print("=" * 50)

lstm_results = []
os.makedirs("results", exist_ok=True)

for coin in COINS:
    print(f"\n{'='*40}\nCoin: {coin.upper()}")

    df = load_coin(coin)
    train, test = time_split(df)

    scaler_X = MinMaxScaler()
    scaler_y = MinMaxScaler()

    X_train_s = scaler_X.fit_transform(train[FEATURES])
    X_test_s  = scaler_X.transform(test[FEATURES])

    y_train_s = scaler_y.fit_transform(train[[TARGET]]).flatten()
    y_test_s  = scaler_y.transform(test[[TARGET]]).flatten()

    X_tr_seq, y_tr_seq = make_sequences(X_train_s, y_train_s, SEQ_LEN)
    X_te_seq, y_te_seq = make_sequences(X_test_s,  y_test_s,  SEQ_LEN)

    model = build_lstm_model(SEQ_LEN, len(FEATURES))

    early_stop = EarlyStopping(
        monitor="val_loss",
        patience=10,
        restore_best_weights=True,
        verbose=1
    )

    history = model.fit(
        X_tr_seq, y_tr_seq,
        epochs=50,
        batch_size=32,
        validation_split=0.1,
        callbacks=[early_stop],
        verbose=0
    )

    # Plot training loss
    plt.figure(figsize=(8, 4))
    plt.plot(history.history["loss"], label="Train Loss")
    plt.plot(history.history["val_loss"], label="Val Loss")
    plt.title(f"LSTM Training Loss - {coin.upper()}")
    plt.xlabel("Epochs")
    plt.ylabel("MSE Loss")
    plt.legend()
    plt.tight_layout()
    plt.savefig(f"results/lstm_loss_{coin}.png", dpi=150)
    plt.close()

    preds_scaled = model.predict(X_te_seq, verbose=0).flatten()
    preds = scaler_y.inverse_transform(preds_scaled.reshape(-1, 1)).flatten()

    actual = test[TARGET].values[SEQ_LEN:]

    result = evaluate(actual, preds, "LSTM", coin)
    lstm_results.append(result)

    folder = f"models/{coin}"
    os.makedirs(folder, exist_ok=True)
    model.save(f"{folder}/lstm.h5")
    model.save(f"{folder}/lstm.keras")
    joblib.dump(scaler_X, f"{folder}/scaler_lstm_X.joblib")
    joblib.dump(scaler_y, f"{folder}/scaler_lstm_y.joblib")
    joblib.dump(scaler_X, f"{folder}/scaler_X_lstm.joblib")
    joblib.dump(scaler_y, f"{folder}/scaler_y_lstm.joblib")
    print(f"  [SAVED] -> {folder}/lstm.h5 & scalers")

lstm_df = pd.DataFrame(lstm_results)
lstm_df.to_csv("results/lstm_results_summary.csv", index=False)
print("\n" + "=" * 50)
print("LSTM TRAINING COMPLETE")
print("=" * 50)
print(lstm_df.to_string(index=False))
