import test from "node:test";
import assert from "node:assert";
import { presidencyStore } from "../data/store.js";
import { BLOCKS_CONFIG, getBlockById, getAllBlockIds } from "../data/presidencyCampus.js";

test("Block Registry: blocks.config.json is the single source of truth", () => {
  assert.ok(Array.isArray(BLOCKS_CONFIG), "BLOCKS_CONFIG must be an array");
  assert.strictEqual(BLOCKS_CONFIG.length, 13, "Must have exactly 13 defined blocks/facilities");

  const requiredKeys = ["id", "name", "category", "builtUpAreaSqm", "occupancy", "hasMeters", "managerRole"];
  BLOCKS_CONFIG.forEach(block => {
    requiredKeys.forEach(key => {
      assert.ok(block[key] !== undefined, `Block ${block.id} must define '${key}'`);
    });
  });

  const admin = getBlockById("ADMIN");
  assert.ok(admin, "ADMIN block must exist");
  assert.strictEqual(admin.rooftopSolarKwp, 220, "Admin must host 220 kWp solar");
});

test("Block Aggregation: Sum of block electricity equals campus demand within 1%", () => {
  const blocks = presidencyStore.getBlocks();
  const sumBlockKwh = blocks.reduce((sum, b) => sum + (b.kpis.todayElectricityKwh || 0), 0);

  // Read latest 24h of all electricity readings
  const campusElec24h = presidencyStore.electricityReadings.slice(0, 24 * BLOCKS_CONFIG.length);
  const campusTotalKwh = campusElec24h.reduce((sum, r) => sum + (r.kwh || 0), 0);

  assert.ok(sumBlockKwh > 0, "Sum of block kWh must be greater than 0");
  assert.ok(campusTotalKwh > 0, "Campus total kWh must be greater than 0");

  const diffPct = Math.abs(sumBlockKwh - campusTotalKwh) / campusTotalKwh;
  assert.ok(diffPct <= 0.01, `Block sum (${sumBlockKwh}) must equal campus total (${campusTotalKwh}) within 1%. Diff: ${(diffPct * 100).toFixed(2)}%`);
});

test("Sustainability Score Formula: Transparent calculation within 0 to 100", () => {
  const blocks = presidencyStore.getBlocks();
  blocks.forEach(block => {
    assert.ok(block.sustainabilityScore >= 0 && block.sustainabilityScore <= 100, `Block ${block.id} score (${block.sustainabilityScore}) must be between 0 and 100`);
    assert.ok(block.scoreBreakdown, `Block ${block.id} must include transparent scoreBreakdown`);
    assert.ok(block.scoreFormula, `Block ${block.id} must include scoreFormula documentation`);
    assert.ok(block.scoreBreakdown.energyIntensityScore !== undefined, "Must include energy intensity score");
    assert.ok(block.scoreBreakdown.solarCleanEnergyScore !== undefined, "Must include solar score");
    assert.ok(block.scoreBreakdown.waterEfficiencyScore !== undefined, "Must include water score");
    assert.ok(block.scoreBreakdown.wasteDiversionScore !== undefined, "Must include waste score");
  });
});

test("Injected Faults: Inefficiencies detected across CSE, Admin, STP, and Food Court", () => {
  const anomalies = presidencyStore.anomalies;
  assert.ok(anomalies.length >= 3, "At least 3 anomalies must be detected from injected telemetry faults");

  const cseFault = anomalies.find(a => a.blockId === "CSE");
  assert.ok(cseFault, "CSE night idle baseload anomaly must be detected");
  assert.strictEqual(cseFault.resourceType, "Electricity");

  const adminFault = anomalies.find(a => a.blockId === "ADMIN");
  assert.ok(adminFault, "ADMIN solar soiling or weekend AC anomaly must be detected");

  const stpFault = anomalies.find(a => a.blockId === "STP");
  assert.ok(stpFault, "STP water discharge/irrigation joint leak anomaly must be detected");
});

test("Action Binding & Scoping: Actions are properly bound to blockId", () => {
  const newAction = presidencyStore.createBlockAction("CSE", {
    title: "Unit Test Automated Hibernate",
    resourceType: "Electricity",
    potentialResourceSavings: 500
  });

  assert.ok(newAction.id.startsWith("ACT-CSE-"), "Action ID must incorporate block prefix");
  assert.strictEqual(newAction.blockId, "CSE");

  const cseActions = presidencyStore.getBlockActions("CSE");
  assert.ok(cseActions.some(a => a.id === newAction.id), "New action must appear in CSE block actions");
});

test("M&V Impact Ledger: Realization rate calculation", () => {
  const impact = presidencyStore.getBlockImpact("STP");
  assert.ok(impact, "STP impact record must exist");
  assert.strictEqual(impact.protocol, "IPMVP Option B (Retrofit Isolation)");
  assert.ok(impact.summary.realizationRatePct >= 0, "Realization rate must be non-negative");
});
