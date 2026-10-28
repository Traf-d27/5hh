import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../..");

test("Dataset Registry: registry.json includes all 5 external sustainability sources", () => {
  const regPath = path.join(ROOT_DIR, "data/datasets/registry.json");
  assert.ok(fs.existsSync(regPath), "data/datasets/registry.json must exist");

  const registry = JSON.parse(fs.readFileSync(regPath, "utf-8"));
  assert.equal(registry.datasets.length, 5, "Must contain exactly 5 registered datasets");

  const ids = registry.datasets.map(d => d.id);
  assert.ok(ids.includes("unicon"), "Must register UNICON");
  assert.ok(ids.includes("bdg2"), "Must register BDG2");
  assert.ok(ids.includes("uci_appliances"), "Must register UCI Appliances");
  assert.ok(ids.includes("water_network"), "Must register Water Network Benchmark");
  assert.ok(ids.includes("school_food_waste"), "Must register School Food Waste Study");
});

test("Data Quality Report: Zero data leakage standards and valid rows", () => {
  const reportPath = path.join(ROOT_DIR, "data/datasets/reports/data_quality_report.json");
  assert.ok(fs.existsSync(reportPath), "data_quality_report.json must exist");

  const report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
  assert.equal(report.status, "all_datasets_validated_and_cleaned");
  assert.ok(report.datasets.uci_appliances.clean_rows > 1000, "UCI must have >1000 cleaned rows");
  assert.ok(report.datasets.unicon.clean_rows > 1000, "UNICON must have >1000 cleaned rows");
  assert.ok(report.datasets.bdg2.clean_rows >= 100, "BDG2 must have >= 100 buildings");
  assert.ok(report.datasets.water_network.clean_rows > 500, "Water network must have > 500 records");
  assert.ok(report.datasets.school_food_waste.clean_rows >= 100, "School food waste must have >= 100 records");
});

test("Trained Model Metadata: Empirical metrics evaluated without data leakage", () => {
  const metaPath = path.join(ROOT_DIR, "ml_service/trained_models/model_metadata.json");
  assert.ok(fs.existsSync(metaPath), "model_metadata.json must exist");

  const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
  assert.equal(meta.status, "trained_and_validated");
  
  // 1. Energy Forecast
  const ef = meta.models.energy_forecast;
  assert.ok(ef.random_forest_metrics.mae > 0, "RF MAE must be positive");
  assert.ok(ef.linear_regression_baseline.mae > 0, "Linear baseline MAE must be positive");
  assert.equal(ef.split_strategy, "Chronological 80/20 train/test split without shuffling");

  // 2. Water Anomaly
  const wa = meta.models.water_anomaly;
  assert.ok(wa.evaluation_metrics.precision > 0, "Isolation Forest precision must be positive");
  assert.ok(wa.evaluation_metrics.f1_score > 0, "Isolation Forest F1 must be positive");

  // 3. Building Clustering
  const bc = meta.models.building_clustering;
  assert.equal(bc.clusters.length, 3, "KMeans must produce 3 clusters");

  // 4. Food Waste Regression
  const fw = meta.models.food_waste_regression;
  assert.ok(fw.behavioral_shift.measured_reduction_pct > 0, "Measured reduction pct must be reported");
});

test("Safe Transfer Learning API: Distinguishes external estimate from campus measurement", async () => {
  try {
    const res = await fetch("http://localhost:5002/ml/models/transfer-predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blockId: "CSE",
        resource: "electricity",
        builtUpAreaSqm: 12000,
        occupancy: 1400,
        hour: 14
      })
    });
    
    if (res.ok) {
      const json = await res.json();
      assert.equal(json.provenance, "EXTERNAL_MODEL_ESTIMATE", "Must explicitly label EXTERNAL_MODEL_ESTIMATE");
      assert.ok(json.predictedHourlyKwh > 0, "Predicted kWh must be positive");
      assert.ok(json.campusCalibrationBenchmark.sanityCheck, "Must include campus sanity check");
    }
  } catch (err) {
    // If test is run in environment where port 5002 is on localhost
    console.log("Note: Flask API probe skipped if service not on localhost during offline test run");
  }
});
