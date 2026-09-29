from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    col, lag, avg, stddev, to_timestamp, lit
)
from pyspark.sql.window import Window
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BUCKET = "cryptospark-ai-bucket"

def create_spark():
    return SparkSession.builder \
        .appName("CryptoSpark-Preprocessing") \
        .config("spark.sql.adaptive.enabled", "true") \
        .getOrCreate()
    # No .master(...) here on purpose - EMR/YARN sets it when the
    # job is submitted. Forcing "local[*]" here was what crashed it before.

def load(spark, path, symbol):
    # All 4 raw files share the same schema:
    # timestamp, open, high, low, close, volume (all lowercase)
    df = spark.read.csv(path, header=True, inferSchema=True)
    df = df.withColumn(
        "timestamp",
        to_timestamp(col("timestamp"), "yyyy-MM-dd HH:mm:ss")
    )
    return df.select("timestamp", "open", "high", "low", "close", "volume")

def clean(df, symbol):
    before = df.count()
    df = df.filter(
        col("close").isNotNull() &
        (col("close")  > 0) &
        (col("open")   > 0) &
        (col("volume") >= 0)
    )
    df = df.dropDuplicates(["timestamp"])
    df = df.orderBy("timestamp")
    df = df.withColumn("symbol", lit(symbol))
    after = df.count()
    print(f"{symbol}: {before:,} -> {after:,} rows after cleaning")
    return df

def add_features(df, symbol):
    w7   = Window.orderBy("timestamp").rowsBetween(-6,  0)
    w30  = Window.orderBy("timestamp").rowsBetween(-29, 0)
    wlag = Window.orderBy("timestamp")

    df = df \
        .withColumn("MA7",
            avg("close").over(w7)) \
        .withColumn("MA30",
            avg("close").over(w30)) \
        .withColumn("volatility_7",
            stddev("close").over(w7)) \
        .withColumn("prev_close",
            lag("close",  1).over(wlag)) \
        .withColumn("prev_volume",
            lag("volume", 1).over(wlag)) \
        .withColumn("price_change",
            col("close") - col("open")) \
        .withColumn("pct_change",
            (col("close") - col("open"))
            / col("open") * 100) \
        .withColumn("high_low_range",
            col("high") - col("low")) \
        .withColumn("target_1d",
            lag("close", -1).over(wlag)) \
        .withColumn("target_7d",
            lag("close", -7).over(wlag))

    df = df.dropna(subset=[
        "target_1d", "prev_close",
        "MA7", "volatility_7"
    ])
    print(f"{symbol} final: {df.count():,} rows")
    return df

def save(df, out_path):
    # Write directly to S3 using Spark (not pandas/local disk,
    # which would disappear when the cluster terminates).
    # coalesce(1) forces one output CSV instead of many part-files.
    df.coalesce(1).write.mode("overwrite").option("header", "true").csv(out_path)
    print(f"Saved -> {out_path}")

def main():
    spark = create_spark()

    coins = ["BTC", "ETH", "SOL", "ADA"]

    for symbol in coins:
        print(f"\n{'='*40}")
        print(f"Processing {symbol}...")

        path = f"s3://{BUCKET}/raw/{symbol.lower()}_raw.csv"
        df = load(spark, path, symbol)
        df = clean(df, symbol)
        df = add_features(df, symbol)
        save(df, f"s3://{BUCKET}/processed/{symbol.lower()}_processed_spark/")

    spark.stop()
    print("\n[SUCCESS] All 4 coins processed successfully")

if __name__ == "__main__":
    main()