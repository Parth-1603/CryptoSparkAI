from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    col, avg, max, min, count, year, month
)

def run_analysis(input_path, output_path):
    spark = SparkSession.builder \
        .appName("CryptoSpark-Analysis") \
        .getOrCreate()
    
    df = spark.read.csv(input_path, header=True, inferSchema=True)
    
    # Overall stats
    stats = df.select(
        avg("close").alias("avg_price"),
        max("close").alias("max_price"),
        min("close").alias("min_price"),
        avg("volume").alias("avg_volume"),
        count("*").alias("total_records")
    )
    stats.show()
    
    # Monthly averages
    monthly = df.withColumn("year",  year("timestamp")) \
                .withColumn("month", month("timestamp")) \
                .groupBy("year","month") \
                .agg(avg("close").alias("avg_monthly_close")) \
                .orderBy("year","month")
    monthly.show(24)
    
    # Save both
    stats.coalesce(1).write.csv(
        output_path + "/stats", header=True, mode="overwrite")
    monthly.coalesce(1).write.csv(
        output_path + "/monthly", header=True, mode="overwrite")
    
    spark.stop()

if __name__ == "__main__":
    import sys
    run_analysis(sys.argv[1], sys.argv[2])