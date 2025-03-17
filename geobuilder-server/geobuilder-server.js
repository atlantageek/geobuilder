const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = 3000;

// PostgreSQL connection configuration
const pool = new Pool({
  user: "your_user",
  host: "your_host",
  database: "your_database",
  password: "your_password",
  port: 5432, // Default PostgreSQL port
});

// Handle GET requests
app.get("/extract-osm", async (req, res) => {
  const { min_lon, min_lat, max_lon, max_lat } = req.query;

  // Check if all required query parameters are provided
  if (!min_lon || !min_lat || !max_lon || !max_lat) {
    return res.status(400).send("Missing query parameters: min_lon, min_lat, max_lon, max_lat are required.");
  }

  // SQL query to copy the portion of the OSM database
  const createSchemaQuery = `CREATE SCHEMA IF NOT EXISTS osm_portion`;
  const copyDataQuery = `
    CREATE TABLE IF NOT EXISTS osm_portion.extracted_data AS
    SELECT *
    FROM your_osm_table
    WHERE
      ST_Within(geom, ST_MakeEnvelope($1, $2, $3, $4, 4326));
  `;

  try {
    const client = await pool.connect();

    // Create the schema
    await client.query(createSchemaQuery);

    // Copy the data to the new schema
    await client.query(copyDataQuery, [min_lon, min_lat, max_lon, max_lat]);

    client.release();
    res.send("Data successfully copied to schema osm_portion.");
  } catch (error) {
    console.error("Error copying data:", error);
    res.status(500).send("An error occurred while copying the data.");
  }
});

app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
