from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    col, lag, avg, stddev,
    first, last,
    max as spark_max,
    min as spark_min,
    sum as spark_sum,
    date_trunc, to_timestamp, lit
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
    # NOTE: no .master(...) here — EMR/YARN already sets the master
    # when it submits the job. Forcing "local[*]" on top of that is
    # what caused the immediate crash.

def load_btc(spark, path):
    df = spark.read.csv(
        path, header=True, inferSchema=True)
    vol_col = "Volume_(Currency)" if "Volume_(Currency)" in df.columns else "Volume"
    df = df \
        .withColumnRenamed("Timestamp", "timestamp") \
        .withColumnRenamed("Open",      "open") \
        .withColumnRenamed("High",      "high") \
        .withColumnRenamed("Low",       "low") \
        .withColumnRenamed("Close",     "close") \
        .withColumn("volume",
            col(vol_col).cast("double")) \
        .withColumn("timestamp",
            to_timestamp(col("timestamp").cast("long")))
    return df.select(
        "timestamp","open","high","low","close","volume")

def load_altcoin(spark, path, symbol):
    df = spark.read.csv(
        path, header=True, inferSchema=True)
    df = df \
        .withColumn("timestamp",
            to_timestamp(col("Date"))) \
        .withColumn("open",
            col("Open").cast("double")) \
        .withColumn("high",
            col("High").cast("double")) \
        .withColumn("low",
            col("Low").cast("double")) \
        .withColumn("close",
            col("Close").cast("double")) \
        .withColumn("volume",
            col("Volume").cast("double"))
    return df.select(
        "timestamp","open","high","low","close","volume")

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

def resample_to_daily(df, symbol):
    df = df.withColumn("day",
        date_trunc("day", col("timestamp")))
    daily = df.groupBy("day").agg(
        first("open",  ignorenulls=True).alias("open"),
        spark_max("high").alias("high"),
        spark_min("low").alias("low"),
        last("close",  ignorenulls=True).alias("close"),
        spark_sum("volume").alias("volume")
    ).withColumnRenamed("day", "timestamp") \
     .orderBy("timestamp") \
     .withColumn("symbol", lit(symbol))
    print(f"{symbol} after daily resample: {daily.count():,} rows")
    return daily

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
    # Write directly to S3 using Spark instead of pandas + local disk.
    # coalesce(1) forces a single output file instead of Spark's usual
    # multi-part output, so you get one clean CSV instead of a folder
    # of part-0000-*.csv files.
    df.coalesce(1).write.mode("overwrite").option("header", "true").csv(out_path)
    print(f"Saved -> {out_path}")

def main():
    spark = create_spark()

    coins = [
        ("BTC", f"s3://{BUCKET}/raw/btc_raw.csv", True),
        ("ETH", f"s3://{BUCKET}/raw/eth_raw.csv", False),
        ("SOL", f"s3://{BUCKET}/raw/sol_raw.csv", False),
        ("ADA", f"s3://{BUCKET}/raw/ada_raw.csv", False),
    ]

    for symbol, path, is_btc in coins:
        print(f"\n{'='*40}")
        print(f"Processing {symbol}...")

        if is_btc:
            df = load_btc(spark, path)
            df = clean(df, symbol)
            df = resample_to_daily(df, symbol)
        else:
            df = load_altcoin(spark, path, symbol)
            df = clean(df, symbol)

        df = add_features(df, symbol)
        save(df, f"s3://{BUCKET}/processed/{symbol.lower()}_processed_spark/")

    spark.stop()
    print("\n[SUCCESS] All 4 coins processed successfully")

if __name__ == "__main__":
    main()