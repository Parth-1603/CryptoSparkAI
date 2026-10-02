from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    col, avg, max as spark_max,
    min as spark_min, count,
    year, month, stddev
)
import sys

def main():
    spark = SparkSession.builder \
        .appName("CryptoSpark-Analysis") \
        .getOrCreate()
    # No .master("local[*]") here — only set this if you specifically
    # want to force local-only execution for quick testing on your own
    # laptop. Leave it out if this might ever run as an EMR step,
    # same reasoning as the preprocessing.py fix earlier.

    coins = ["btc","eth","sol","ada"]

    for coin in coins:
        path = f"dataset/processed/{coin}_processed.csv"
        df   = spark.read.csv(
            path, header=True, inferSchema=True)

        print(f"\n{'='*40}")
        print(f"Analysis: {coin.upper()}")

        # Overall stats
        stats = df.select(
            avg("close").alias("avg_price"),
            spark_max("close").alias("max_price"),
            spark_min("close").alias("min_price"),
            avg("volume").alias("avg_volume"),
            stddev("close").alias("price_stddev"),
            count("*").alias("total_records")
        )
        stats.show()

        # Monthly averages
        monthly = df \
            .withColumn("year",  year("timestamp")) \
            .withColumn("month", month("timestamp")) \
            .groupBy("year","month") \
            .agg(avg("close").alias("avg_monthly_close")) \
            .orderBy("year","month")
        monthly.show(24)

        # Save
        stats.coalesce(1).write.csv(
            f"dataset/analytics/{coin}_stats/",
            header=True, mode="overwrite")
        monthly.coalesce(1).write.csv(
            f"dataset/analytics/{coin}_monthly/",
            header=True, mode="overwrite")

    spark.stop()
    print("\n[SUCCESS] Analysis complete for all 4 coins")

if __name__ == "__main__":
    main()