import express from "express";
import multer from "multer";
import { Readable } from "stream";
import csvParser from "csv-parser";
import { presidencyStore } from "../data/store.js";
import { CAMPUS_FACILITIES, PRESIDENCY_CAMPUS_META, BLOCKS_CONFIG, getBlockById } from "../data/presidencyCampus.js";

export const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// ─── Middleware: Demo Role-Based Access Control (RBAC) ────────────────────────
function checkRoleAccess(req, res, next) {
  const role = req.headers["x-user-role"] || req.query.role || "SUSTAINABILITY_ADMIN";
  const userBlockId = (req.headers["x-block-id"] || req.query.userBlockId || "").toUpperCase();
  
  // Extract targetBlockId from path (e.g. /blocks/ADMIN/actions) or body/params
  const pathMatch = req.path.match(/\/blocks\/([A-Za-z0-9_-]+)/i);
  const targetBlockId = (pathMatch ? pathMatch[1] : (req.body?.blockId || req.params?.id || "")).toUpperCase();

  req.userRole = role;
  req.userBlockId = userBlockId;

  if (role === "BLOCK_MANAGER") {
    // Block Manager cannot mutate another block's actions or data
    if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
      if (targetBlockId && userBlockId && targetBlockId !== userBlockId && !["COMPARE", "LEADERBOARD"].includes(targetBlockId)) {
        return res.status(403).json({
          success: false,
          error: `Access denied: As Block Manager for ${userBlockId}, you are not authorized to modify block ${targetBlockId}.`
        });
      }
    }
  }
  next();
}

// Apply role parsing middleware across all routes
router.use(checkRoleAccess);

// ─── 1. Campus Facilities & Metadata ──────────────────────────────────────────
router.get("/facilities", (req, res) => {
  res.json({
    success: true,
    data: CAMPUS_FACILITIES,
    blocks: BLOCKS_CONFIG,
    meta: PRESIDENCY_CAMPUS_META
  });
});

// ─── 2. Unified Overview Matrix (Campus-Level Aggregate) ──────────────────────
router.get("/overview", (req, res) => {
  const settings = presidencyStore.settings;
  const electricityReadings = presidencyStore.electricityReadings;
  const solarHourly = presidencyStore.solarHourlyReadings;
  const waterReadings = presidencyStore.waterDailyReadings;
  const wasteReadings = presidencyStore.wasteDailyReadings;
  const anomalies = presidencyStore.anomalies;
  const actions = presidencyStore.actions;
  const blocks = presidencyStore.getBlocks();

  // Multi-Resource Totals
  const totalElectricityDemandKwh = Math.round(electricityReadings.reduce((sum, r) => sum + r.kwh, 0));
  const totalSolarGeneratedKwh = Math.round(solarHourly.reduce((sum, r) => sum + r.actualSolarKwh, 0));
  const totalWaterTreatedLitres = Math.round(waterReadings.filter(r => r.blockId === "STP").reduce((sum, r) => sum + r.actualTreatedLitres, 0)) || 300000 * 14;
  const totalWaterReusedLitres = Math.round(waterReadings.filter(r => r.blockId === "STP").reduce((sum, r) => sum + r.landscapeReuseLitres, 0)) || 264000 * 14;
  const totalFoodWasteKg = Math.round(wasteReadings.reduce((sum, r) => sum + r.actualFoodWasteKg, 0));
  const totalVermicompostedKg = Math.round(wasteReadings.reduce((sum, r) => sum + r.vermicompostedKg, 0));

  // Carbon Accounting (CEA Grid Factor = 0.716 kg CO2e / kWh)
  const solarCo2AvoidedTons = Math.round(((totalSolarGeneratedKwh * settings.gridCo2Factor) / 1000) * 10) / 10;
  const waterPumpingCo2AvoidedTons = Math.round((((totalWaterReusedLitres / 1000) * 0.45) / 1000) * 10) / 10;
  const wasteMethaneAvoidedTons = Math.round(((totalVermicompostedKg * 1.9) / 1000) * 10) / 10;
  const totalCarbonAvoidedTons = Math.round((solarCo2AvoidedTons + waterPumpingCo2AvoidedTons + wasteMethaneAvoidedTons) * 10) / 10;

  // Financial Metrics
  const totalSolarSavingsInr = Math.round(totalSolarGeneratedKwh * settings.electricityTariffInr);
  const totalWaterReuseSavingsInr = Math.round((totalWaterReusedLitres / 1000) * settings.waterTariffInr);
  const totalWasteDiversionSavingsInr = Math.round(totalVermicompostedKg * settings.wasteCostInr);
  const totalGrossSustainabilityYieldInr = totalSolarSavingsInr + totalWaterReuseSavingsInr + totalWasteDiversionSavingsInr;

  // Potential vs Verified Savings across actions
  const totalPotentialInr = actions.reduce((s, a) => s + (a.potentialInrSavings || 0), 0);
  const totalVerifiedInr = actions.filter(a => a.status === "Resolved" || a.status === "Completed" || a.status === "Verified").reduce((s, a) => s + (a.verifiedInrSavings || 0), 0);

  // Top Consuming Blocks Bar Data & Blocks Needing Attention
  const topConsumingBlocks = [...blocks]
    .sort((a, b) => b.kpis.todayElectricityKwh - a.kpis.todayElectricityKwh)
    .slice(0, 6)
    .map(b => ({
      id: b.id,
      name: b.shortName,
      kwhToday: b.kpis.todayElectricityKwh,
      kwhPerSqm: b.kpis.kwhPerSqm,
      score: b.sustainabilityScore,
      accent: b.accent
    }));

  const blocksNeedingAttention = [...blocks]
    .filter(b => b.kpis.activeAlertsCount > 0 || b.sustainabilityScore < 60)
    .sort((a, b) => b.kpis.activeAlertsCount - a.kpis.activeAlertsCount);

  res.json({
    success: true,
    data: {
      campusMeta: PRESIDENCY_CAMPUS_META,
      settings,
      metrics: {
        totalSolarGeneratedKwh,
        totalElectricityDemandKwh,
        solarSelfSufficiencyPct: totalElectricityDemandKwh > 0 ? Math.round((totalSolarGeneratedKwh / totalElectricityDemandKwh) * 100) : 0,
        totalWaterTreatedLitres,
        totalWaterReusedLitres,
        waterReuseRatioPct: totalWaterTreatedLitres > 0 ? Math.round((totalWaterReusedLitres / totalWaterTreatedLitres) * 100) : 0,
        totalFoodWasteKg,
        totalVermicompostedKg,
        wasteCompostDiversionPct: totalFoodWasteKg > 0 ? Math.round((totalVermicompostedKg / totalFoodWasteKg) * 100) : 0,
        totalCarbonAvoidedTons,
        carbonBreakdownTons: {
          solar: solarCo2AvoidedTons,
          water: waterPumpingCo2AvoidedTons,
          waste: wasteMethaneAvoidedTons
        },
        financialYieldInr: {
          solar: totalSolarSavingsInr,
          water: totalWaterReuseSavingsInr,
          waste: totalWasteDiversionSavingsInr,
          total: totalGrossSustainabilityYieldInr
        },
        actionsSummary: {
          total: actions.length,
          open: actions.filter(a => a.status === "Open" || a.status === "Proposed").length,
          inProgress: actions.filter(a => a.status === "In Progress").length,
          resolved: actions.filter(a => a.status === "Resolved" || a.status === "Completed" || a.status === "Verified").length,
          potentialInr: totalPotentialInr,
          verifiedInr: totalVerifiedInr
        },
        activeAnomaliesCount: anomalies.length
      },
      topConsumingBlocks,
      blocksNeedingAttention,
      recentAnomalies: anomalies.slice(0, 4),
      publishedReferences: PRESIDENCY_CAMPUS_META.publishedReferences
    }
  });
});

// ─── 3. BLOCK REGISTRY & ANALYSIS ENDPOINTS ───────────────────────────────────

// List all blocks with KPIs & sustainability score
router.get("/blocks", (req, res) => {
  const blocks = presidencyStore.getBlocks();
  res.json({
    success: true,
    count: blocks.length,
    data: blocks
  });
});

// Compare multiple blocks side-by-side
router.get("/blocks/compare", (req, res) => {
  const { ids = "ADMIN,CSE,ENGG", metric = "kwhPerSqm" } = req.query;
  const blockIds = ids.split(",").map(id => id.trim()).filter(Boolean);
  const comparison = presidencyStore.compareBlocks(blockIds, metric);
  res.json({
    success: true,
    data: comparison
  });
});

// Leaderboard rankings
router.get("/blocks/leaderboard", (req, res) => {
  const { metric = "score" } = req.query;
  const leaderboard = presidencyStore.getLeaderboard(metric);
  res.json({
    success: true,
    metric,
    data: leaderboard
  });
});

// Single Block Profile + KPIs
router.get("/blocks/:id", (req, res) => {
  const block = presidencyStore.getBlockById(req.params.id);
  if (!block) {
    return res.status(404).json({ success: false, message: `Block '${req.params.id}' not found.` });
  }

  // 24h diurnal curve for this block
  const blockElec = presidencyStore.electricityReadings.filter(r => r.blockId === block.id).slice(0, 24);
  const hourlyProfile = blockElec.map(r => ({
    hour: r.hour,
    hourFormatted: `${r.hour.toString().padStart(2, "0")}:00`,
    actualKwh: r.kwh,
    baselineKwh: r.baselineKwh,
    solarContributionKwh: r.solarContributionKwh || 0
  })).reverse();

  res.json({
    success: true,
    data: {
      ...block,
      hourlyProfile,
      recentAlerts: presidencyStore.getBlockAlerts(block.id).slice(0, 3)
    }
  });
});

// Block Time Series by Resource Type
router.get("/blocks/:id/resources/:type", (req, res) => {
  const { from, to } = req.query;
  const timeSeries = presidencyStore.getBlockTimeSeries(req.params.id, req.params.type, from, to);
  res.json({
    success: true,
    blockId: req.params.id.toUpperCase(),
    resourceType: req.params.type,
    count: timeSeries.length,
    data: timeSeries
  });
});

// Block Alerts / Anomalies
router.get("/blocks/:id/alerts", (req, res) => {
  const alerts = presidencyStore.getBlockAlerts(req.params.id);
  res.json({
    success: true,
    blockId: req.params.id.toUpperCase(),
    count: alerts.length,
    data: alerts
  });
});

// Block Recommendations
router.get("/blocks/:id/recommendations", (req, res) => {
  const recs = presidencyStore.getBlockRecommendations(req.params.id);
  res.json({
    success: true,
    blockId: req.params.id.toUpperCase(),
    count: recs.length,
    data: recs
  });
});

// Block Actions
router.get("/blocks/:id/actions", (req, res) => {
  const actions = presidencyStore.getBlockActions(req.params.id);
  res.json({
    success: true,
    blockId: req.params.id.toUpperCase(),
    count: actions.length,
    data: actions
  });
});

// Create Block Action (RBAC protected)
router.post("/blocks/:id/actions", (req, res) => {
  try {
    const newAction = presidencyStore.createBlockAction(req.params.id, req.body);
    res.status(201).json({
      success: true,
      message: `Action '${newAction.title}' created and bound to ${req.params.id.toUpperCase()}.`,
      data: newAction
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Block Impact (M&V IPMVP Option B)
router.get("/blocks/:id/impact", (req, res) => {
  const impact = presidencyStore.getBlockImpact(req.params.id);
  res.json({
    success: true,
    data: impact
  });
});

// CSV Upload Scoped to Block
router.post("/blocks/:id/upload", upload.single("file"), (req, res) => {
  const blockId = req.params.id.toUpperCase();
  const block = getBlockById(blockId);
  if (!block) {
    return res.status(404).json({ success: false, message: `Unknown block id '${blockId}'.` });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: "No CSV file provided." });
  }

  const { resourceType = "Electricity" } = req.body;
  const results = [];
  const errors = [];
  const stream = Readable.from(req.file.buffer.toString("utf-8"));
  let rowNumber = 1;

  stream
    .pipe(csvParser())
    .on("data", (row) => {
      rowNumber++;
      const rawTimestamp = row.timestamp || row.Timestamp || row.Date || row.date;
      const rawValue = row.value || row.kwh || row.litres || row.kg || row.Reading || row.reading;

      if (!rawTimestamp || !rawValue) {
        errors.push(`Row ${rowNumber}: Missing timestamp or measurement value.`);
        return;
      }

      const numVal = Number(rawValue);
      if (isNaN(numVal) || numVal < 0) {
        errors.push(`Row ${rowNumber}: Value must be positive numeric. Got "${rawValue}".`);
        return;
      }

      results.push({
        resourceType,
        blockId,
        facilityId: blockId,
        facilityName: block.name,
        value: numVal,
        timestamp: rawTimestamp,
        meterId: row.meterId || `CSV-${blockId}-${resourceType.toUpperCase()}-MTR`,
        notes: row.notes || `Block CSV upload for ${block.name}: ${req.file.originalname}`
      });
    })
    .on("end", () => {
      if (results.length === 0) {
        return res.status(400).json({ success: false, message: "No valid rows imported from CSV.", errors });
      }

      results.forEach(r => presidencyStore.addManualEntry(r));

      res.json({
        success: true,
        message: `Successfully validated and ingested ${results.length} ${resourceType} records for ${block.name}.`,
        blockId,
        importedCount: results.length,
        errorCount: errors.length,
        errors: errors.slice(0, 5),
        sample: results.slice(0, 3)
      });
    })
    .on("error", (err) => {
      res.status(500).json({ success: false, message: `CSV parse failure: ${err.message}` });
    });
});

// ─── 4. Resource Endpoints with Optional ?blockId= Filter ─────────────────────

// Flagship Solar Intelligence Endpoint
router.get("/solar", (req, res) => {
  const { blockId } = req.query;
  let solarHourly = presidencyStore.solarHourlyReadings;
  let electricityReadings = presidencyStore.electricityReadings;

  if (blockId) {
    const bId = blockId.toUpperCase();
    solarHourly = solarHourly.filter(r => r.blockId === bId || bId === "ADMIN");
    electricityReadings = electricityReadings.filter(r => r.blockId === bId);
  }

  const settings = presidencyStore.settings;

  const dailySolarMap = {};
  solarHourly.forEach((r) => {
    if (!dailySolarMap[r.dateFormatted]) {
      dailySolarMap[r.dateFormatted] = {
        date: r.dateFormatted,
        timestamp: r.timestamp,
        actualKwh: 0,
        expectedKwh: 0,
        weather: r.weatherCondition
      };
    }
    dailySolarMap[r.dateFormatted].actualKwh += r.actualSolarKwh;
    dailySolarMap[r.dateFormatted].expectedKwh += r.expectedSolarKwh;
  });

  const dailyTrend = Object.values(dailySolarMap)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(d => ({
      date: d.date,
      actualKwh: Math.round(d.actualKwh),
      expectedKwh: Math.round(d.expectedKwh),
      shortfallKwh: Math.max(0, Math.round(d.expectedKwh - d.actualKwh)),
      publishedReferenceKwh: 800,
      weather: d.weather
    }));

  const diurnalHourMap = {};
  for (let h = 0; h < 24; h++) {
    diurnalHourMap[h] = { hour: h, hourFormatted: `${h.toString().padStart(2, "0")}:00`, solarKw: 0, demandKw: 0, count: 0 };
  }

  solarHourly.forEach(r => {
    diurnalHourMap[r.hour].solarKw += r.actualSolarKw;
    diurnalHourMap[r.hour].count += 1;
  });

  electricityReadings.forEach(r => {
    diurnalHourMap[r.hour].demandKw += r.kwh;
  });

  const diurnalCurve = Object.values(diurnalHourMap).map(d => {
    const avgSolar = d.count > 0 ? Math.round((d.solarKw / d.count) * 10) / 10 : 0;
    const avgDemand = Math.round((d.demandKw / 14) * 10) / 10;
    const directSolarSelfConsumed = Math.min(avgSolar, avgDemand);
    const gridImportRequired = Math.max(0, avgDemand - avgSolar);

    return {
      hour: d.hour,
      hourFormatted: d.hourFormatted,
      solarGenerationKw: avgSolar,
      campusDemandKw: avgDemand,
      directSolarSelfConsumed,
      gridImportRequired
    };
  });

  const totalSolar = Math.round(solarHourly.reduce((s, r) => s + r.actualSolarKwh, 0));
  const totalCostAvoidedInr = Math.round(totalSolar * settings.electricityTariffInr);

  res.json({
    success: true,
    data: {
      metrics: {
        totalSolarGeneratedKwh: totalSolar,
        costAvoidedInr: totalCostAvoidedInr,
        co2AvoidedTons: Math.round(((totalSolar * settings.gridCo2Factor) / 1000) * 10) / 10,
        publishedBenchmarkKwh: 800,
        installedCapacityKwp: 220,
        performanceRatioPct: 78.4,
        solarDiscrepancyAuditFlag: settings.solarDiscrepancyAuditFlag
      },
      dailyTrend,
      diurnalCurve,
      hourlyTelemetry: solarHourly.slice(0, 48),
      publishedReference: PRESIDENCY_CAMPUS_META.publishedReferences.solar
    }
  });
});

// Water Intelligence Endpoint with optional ?blockId=
router.get("/water", (req, res) => {
  const { blockId } = req.query;
  const bId = blockId ? blockId.toUpperCase() : null;
  let waterDaily = presidencyStore.waterDailyReadings;

  if (bId) {
    waterDaily = waterDaily.filter(r => r.blockId === bId);
  }

  const settings = presidencyStore.settings;
  const stpRecords = presidencyStore.waterDailyReadings.filter(r => r.blockId === "STP");
  const metricsSource = bId ? waterDaily : stpRecords;
  const daysCount = Math.max(1, metricsSource.length);

  const totalTreated = Math.round(metricsSource.reduce((s, r) => s + (r.actualTreatedLitres || 0), 0));
  const totalReused = Math.round(metricsSource.reduce((s, r) => s + (r.landscapeReuseLitres || 0), 0));
  const avgDailyTreatedLitres = Math.round(totalTreated / daysCount);
  const avgDailyReusedLitres = Math.round(totalReused / daysCount);
  const reuseEfficiencyPct = totalTreated > 0 ? Math.round((totalReused / totalTreated) * 100) : 0;
  const totalFinancialYieldInr = Math.round((totalReused / 1000) * settings.waterTariffInr);

  const trendSource = bId ? waterDaily : stpRecords;
  const dailyTrend = trendSource.map(r => ({
    date: r.dateFormatted || r.date,
    dateRaw: r.date,
    treatedLitres: r.actualTreatedLitres,
    actualTreatedLitres: r.actualTreatedLitres,
    reusedLitres: r.landscapeReuseLitres,
    landscapeReuseLitres: r.landscapeReuseLitres,
    baselineTreatmentLitres: r.baselineTreatmentLitres,
    reuseRatioPct: r.reuseRatioPct
  }));

  const waterAnomalies = presidencyStore.anomalies.filter(a =>
    a.resourceType?.toLowerCase() === "water" && (!bId || a.blockId === bId)
  );

  res.json({
    success: true,
    data: {
      metrics: {
        totalTreatedLitres: totalTreated,
        totalReusedLitres: totalReused,
        avgDailyTreatedLitres,
        avgDailyReusedLitres,
        averageReuseRatioPct: reuseEfficiencyPct,
        reuseEfficiencyPct,
        financialYieldInr: totalFinancialYieldInr,
        estimatedCostSavingsInr: totalFinancialYieldInr,
        freshWaterAvoidedKl: Math.round(totalReused / 1000),
        pumpingCo2AvoidedTons: Math.round((((totalReused / 1000) * 0.45) / 1000) * 10) / 10,
        publishedTreatmentCapacityLitres: 300000
      },
      dailyTrend,
      dailyReadings: waterDaily,
      anomalies: waterAnomalies,
      publishedReference: PRESIDENCY_CAMPUS_META.publishedReferences.water
    }
  });
});

// Waste Intelligence Endpoint with optional ?blockId=
router.get("/waste", (req, res) => {
  const { blockId } = req.query;
  const bId = blockId ? blockId.toUpperCase() : null;
  let wasteDaily = presidencyStore.wasteDailyReadings;

  if (bId) {
    wasteDaily = wasteDaily.filter(r => r.blockId === bId || bId === "FOOD");
  }

  const settings = presidencyStore.settings;
  const daysCount = Math.max(1, wasteDaily.length);

  const totalFoodWasteKg = Math.round(wasteDaily.reduce((s, r) => s + (r.actualFoodWasteKg || 0), 0));
  const totalVermicompostedKg = Math.round(wasteDaily.reduce((s, r) => s + (r.vermicompostedKg || 0), 0));
  const totalDivertedKg = Math.round(wasteDaily.reduce((s, r) => s + (r.divertedFromLandfillKg || 0), 0));
  const avgDailyFoodWasteKg = Math.round(totalFoodWasteKg / daysCount);
  const totalOrganicCompostProducedKg = Math.round(totalVermicompostedKg * 0.45);
  const financialYieldInr = Math.round(totalVermicompostedKg * settings.wasteCostInr);
  const diversionRatePct = totalFoodWasteKg > 0 ? Math.round((totalVermicompostedKg / totalFoodWasteKg) * 100) : 0;
  const avoidedMethaneCo2eKg = Math.round(totalVermicompostedKg * 1.9);
  const methaneAvoidedTonsCo2e = Math.round((avoidedMethaneCo2eKg / 1000) * 10) / 10;

  const dailyTrend = wasteDaily.map(r => ({
    date: r.dateFormatted || r.date,
    dateRaw: r.date,
    foodWasteKg: r.actualFoodWasteKg,
    actualFoodWasteKg: r.actualFoodWasteKg,
    vermicompostedKg: r.vermicompostedKg,
    divertedKg: r.divertedFromLandfillKg,
    divertedFromLandfillKg: r.divertedFromLandfillKg,
    baselineFoodWasteKg: r.baselineFoodWasteKg
  }));

  const wasteAnomalies = presidencyStore.anomalies.filter(a =>
    a.resourceType?.toLowerCase() === "waste" && (!bId || a.blockId === bId || bId === "FOOD")
  );

  res.json({
    success: true,
    data: {
      metrics: {
        totalFoodWasteKg,
        avgDailyFoodWasteKg,
        totalVermicompostedKg,
        totalDivertedFromLandfillKg: totalDivertedKg,
        diversionRatePct,
        organicCompostProducedKg: totalOrganicCompostProducedKg,
        avoidedMethaneCo2eKg,
        methaneAvoidedTonsCo2e,
        financialSavingsInr: financialYieldInr,
        publishedFoodWasteRange: "120 - 150 kg/day"
      },
      dailyTrend,
      dailyReadings: wasteDaily,
      anomalies: wasteAnomalies,
      publishedReference: PRESIDENCY_CAMPUS_META.publishedReferences.waste
    }
  });
});

// Inefficiency Anomalies with optional ?blockId=
router.get("/anomalies", (req, res) => {
  const { blockId } = req.query;
  let anomalies = presidencyStore.anomalies;
  if (blockId) {
    anomalies = anomalies.filter(a => a.blockId === blockId.toUpperCase());
  }

  res.json({
    success: true,
    count: anomalies.length,
    data: anomalies
  });
});

// Recommendations with optional ?blockId=
router.get("/recommendations", (req, res) => {
  const { blockId } = req.query;
  let recs = presidencyStore.recommendations;
  if (blockId) {
    recs = recs.filter(r => r.blockId === blockId.toUpperCase());
  }

  res.json({
    success: true,
    count: recs.length,
    data: recs
  });
});

// Actions with optional ?blockId=
router.get("/actions", (req, res) => {
  const { blockId } = req.query;
  let actions = presidencyStore.actions;
  if (blockId) {
    actions = actions.filter(a => a.blockId === blockId.toUpperCase());
  }

  res.json({
    success: true,
    count: actions.length,
    data: actions
  });
});

router.post("/actions", (req, res) => {
  const actionData = req.body;
  if (!actionData.title) {
    return res.status(400).json({ success: false, message: "Action title is required" });
  }
  const created = presidencyStore.createAction(actionData);
  res.status(201).json({ success: true, data: created });
});

router.put("/actions/:id", (req, res) => {
  const updated = presidencyStore.updateAction(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, message: "Action not found" });
  res.json({ success: true, data: updated });
});

router.delete("/actions/:id", (req, res) => {
  const deleted = presidencyStore.deleteAction(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: "Action not found" });
  res.json({ success: true, message: "Action removed" });
});

// Manual Entry Ingestion Form
router.post("/manual-entry", (req, res) => {
  const { resourceType, value } = req.body;
  if (!resourceType || !value) {
    return res.status(400).json({ success: false, message: "Resource type and measurement value are required." });
  }

  const entry = presidencyStore.addManualEntry(req.body);
  res.status(201).json({
    success: true,
    message: `Manual ${resourceType} reading successfully ingested under classification: IMPORTED_MEASUREMENT`,
    data: entry
  });
});

// Settings & Config
router.get("/settings", (req, res) => {
  res.json({ success: true, data: presidencyStore.settings });
});

router.put("/settings", (req, res) => {
  const updated = presidencyStore.updateSettings(req.body);
  res.json({ success: true, data: updated, message: "Settings updated and analytics dynamically recomputed." });
});

// Reset Data
router.post("/reset-data", (req, res) => {
  presidencyStore.resetToSeedData();
  res.json({
    success: true,
    message: "Presidency University benchmark telemetry restored successfully (800 kWh/day Solar, 300,000 L STP, 120-150 kg Waste)."
  });
});
