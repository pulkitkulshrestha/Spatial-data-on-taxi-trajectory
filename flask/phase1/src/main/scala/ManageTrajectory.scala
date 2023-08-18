
import org.apache.log4j.{Level, Logger}
import org.apache.spark.sql.{DataFrame, SparkSession}
import org.apache.spark.sql.functions.{col, collect_list, explode}

object ManageTrajectory {

  Logger.getLogger("org.spark_project").setLevel(Level.WARN)
  Logger.getLogger("org.apache").setLevel(Level.WARN)
  Logger.getLogger("akka").setLevel(Level.WARN)
  Logger.getLogger("com").setLevel(Level.WARN)


  def loadTrajectoryData(spark: SparkSession, filePath: String): DataFrame =
    {
      /* TO DO */
      val df = spark.read.option("multiline","true").json(filePath)
      val restructured_df = df.withColumn("arr", explode(col("trajectory")))
        .withColumn("location", col("arr.location"))
        .withColumn("latitude", col("arr.location").getItem(key = 0))
        .withColumn("longitude", col("arr.location").getItem(key = 1))
        .withColumn("timestamp", col("arr.timestamp"))
      restructured_df.printSchema()
      restructured_df
    }


  def getSpatialRange(spark: SparkSession, dfTrajectory: DataFrame, latMin: Double, lonMin: Double, latMax: Double, lonMax: Double): DataFrame =
  {
    dfTrajectory.createOrReplaceTempView("data")
    val query = spark.sql(s"SELECT trajectory_id, vehicle_id, timestamp, location FROM data WHERE ST_Contains(ST_PolygonFromEnvelope($latMin,$lonMin,$latMax,$lonMax),ST_POINT(latitude,longitude)) ORDER BY timestamp;")
    val result = query.groupBy("trajectory_id", "vehicle_id").agg(collect_list("timestamp").alias("timestamp"), collect_list("location").alias("location"))
    result.show()
    result
  }

  def getSpatioTemporalRange(spark: SparkSession, dfTrajectory: DataFrame, timeMin: Long, timeMax: Long, latMin: Double, lonMin: Double, latMax: Double, lonMax: Double): DataFrame =
  {
    dfTrajectory.createOrReplaceTempView("data")
    val query = spark.sql(s"SELECT trajectory_id, vehicle_id, timestamp, location FROM data WHERE ST_Contains(ST_PolygonFromEnvelope($latMin,$lonMin,$latMax,$lonMax),ST_POINT(latitude,longitude)) AND timestamp <= $timeMax and timestamp >= $timeMin ORDER BY timestamp;")
    val result = query.groupBy("trajectory_id", "vehicle_id").agg(collect_list("timestamp").alias("timestamp"), collect_list("location").alias("location"))
    result.show()
    result
  }

  def getKNNTrajectory(spark: SparkSession, dfTrajectory: DataFrame, trajectoryId: Long, neighbors: Int): DataFrame =
  {
    dfTrajectory.createOrReplaceTempView("data")
    val intermediate = spark.sql("SELECT trajectory_id, timestamp, ST_POINT(latitude, longitude) as point from data")
    intermediate.createOrReplaceTempView("intermediate_view")
    val query = spark.sql("SELECT * from intermediate_view where trajectory_id == %d".format(trajectoryId))
    query.createOrReplaceTempView("final")
    val query1 = "SELECT intermediate_view.trajectory_id, MIN(ST_Distance(intermediate_view.point, final.point)) as distance from intermediate_view, final where (final.timestamp==intermediate_view.timestamp & final.trajectory_id!=intermediate_view.trajectory_id) group by intermediate_view.trajectory_id order by distance limit %d".format(neighbors)
    var result = spark.sql(query1)
    result = result.drop("distance")
    result.show()
    result
  }
}
