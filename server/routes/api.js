import express from "express";
import multer from "multer";
import { Readable } from "stream";
import csvParser from "csv-parser";
import { presidencyStore } from "../data/store.js";
import { CAMPUS_FACILITIES, PRESIDENCY_CAMPUS_META } from "../data/presidencyCampus.js";

export const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// 1. Campus Facilities
router.get("/facilities", (req, res) => {
  res.json({
    success: true,
    data: CAMPUS_FACILITIES,
    meta: PRESIDENCY_CAMPUS_META
  });
});

// 2. Unified Overview Matrix
router.get("/overview", (req, res) => {
  const settings = presidencyStore.settings;
  const electricityReadings = presidencyStore.electricityReadings;
  const solarHourly = presidencyStore.solarHourlyReadings;
  const waterReadings = presidencyStore.waterDailyReadings;
  const wasteReadings = presidencyStore.wasteDailyReadings;
  const anomalies = presidencyStore.anomalies;
  const actions = presidencyStore.actions;

  // Multi-Resource Totals
  const totalElectricityDemandKwh = Math.round(electricityReadings.reduce((sum, r) => sum + r.kwh, 0));
  const totalSolarGeneratedKwh = Math.round(solarHourly.reduce((sum, r) => sum + r.actualSolarKwh, 0));
  const totalWaterTreatedLitres = Math.round(waterReadings.reduce((sum, r) => sum + r.actualTreatedLitres, 0));
  const totalWaterReusedLitres = Math.round(waterReadings.reduce((sum, r) => sum + r.landscapeReuseLitres, 0));
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
  const totalVerifiedInr = actions.filter(a => a.status === "Resolved").reduce((s, a) => s + (a.verifiedInrSavings || 0), 0);

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
          open: actions.filter(a => a.status === "Open").length,
          inProgress: actions.filter(a => a.status === "In Progress").length,
          resolved: actions.filter(a => a.status === "Resolved").length,
          potentialInr: totalPotentialInr,
          verifiedInr: totalVerifiedInr
        },
        activeAnomaliesCount: anomalies.length
      },
      recentAnomalies: anomalies.slice(0, 4),
      publishedReferences: PRESIDENCY_CAMPUS_META.publishedReferences
    }
  });
});

// 3. Flagship Solar Intelligence Endpoint
router.get("/solar", (req, res) => {
  const solarHourly = presidencyStore.solarHourlyReadings;
  const electricityReadings = presidencyStore.electricityReadings;
  const settings = presidencyStore.settings;

  // Aggregate daily solar trends
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

  // Average 24-hr diurnal curve (Generation vs Campus Load)
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
      publishedReference: PRESIDENCY_CAMPUS_META.publishedReferences.solar,
      metrics: {
        totalSolarKwh: totalSolar,
        dailyAverageKwh: Math.round(totalSolar / (dailyTrend.length || 1)),
        publishedReferenceDailyKwh: 800,
        totalCostAvoidedInr,
        co2eAvoidedTons: Math.round(((totalSolar * settings.gridCo2Factor) / 1000) * 10) / 10,
        activeTariffInr: settings.electricityTariffInr,
        arrayCapacityKwp: 220,
        installationSite: "Central Administration & Chancellery Building Rooftop"
      },
      dailyTrend,
      diurnalCurve,
      dayAheadForecast: presidencyStore.solarForecast,
      anomalies: presidencyStore.anomalies.filter(a => a.resourceType === "Solar"),
      discrepancyNote: PRESIDENCY_CAMPUS_META.publishedReferences.solar.discrepancyNote
    }
  });
});

// 4. Water Intelligence Endpoint
router.get("/water", (req, res) => {
  const waterReadings = presidencyStore.waterDailyReadings;
  const settings = presidencyStore.settings;

  const totalTreated = Math.round(waterReadings.reduce((s, r) => s + r.actualTreatedLitres, 0));
  const totalReused = Math.round(waterReadings.reduce((s, r) => s + r.landscapeReuseLitres, 0));
  const avgDailyTreated = Math.round(totalTreated / (waterReadings.length || 1));
  const avgDailyReused = Math.round(totalReused / (waterReadings.length || 1));

  res.json({
    success: true,
    data: {
      publishedReference: PRESIDENCY_CAMPUS_META.publishedReferences.water,
      metrics: {
        totalTreatedLitres: totalTreated,
        totalReusedLitres: totalReused,
        avgDailyTreatedLitres: avgDailyTreated,
        avgDailyReusedLitres: avgDailyReused,
        publishedDesignCapacityLitres: 300000,
        averageReuseRatioPct: totalTreated > 0 ? Math.round((totalReused / totalTreated) * 100) : 0,
        estimatedCostSavingsInr: Math.round((totalReused / 1000) * settings.waterTariffInr),
        activeWaterTariffInrPerKl: settings.waterTariffInr
      },
      dailyTrend: waterReadings.map(r => ({
        date: r.dateFormatted,
        treatedLitres: r.actualTreatedLitres,
        reusedLitres: r.landscapeReuseLitres,
        publishedReferenceLitres: 300000,
        notes: r.notes
      })),
      anomalies: presidencyStore.anomalies.filter(a => a.resourceType === "Water")
    }
  });
});

// 5. Waste Intelligence Endpoint
router.get("/waste", (req, res) => {
  const wasteReadings = presidencyStore.wasteDailyReadings;
  const settings = presidencyStore.settings;

  const totalFoodWaste = Math.round(wasteReadings.reduce((s, r) => s + r.actualFoodWasteKg, 0));
  const totalVermicomposted = Math.round(wasteReadings.reduce((s, r) => s + r.vermicompostedKg, 0));
  const totalDryRecycled = Math.round(wasteReadings.reduce((s, r) => s + r.dryRecyclableKg, 0));
  const totalPlasticRecycled = Math.round(wasteReadings.reduce((s, r) => s + r.plasticRecycledKg, 0));
  const totalDiverted = totalVermicomposted + totalDryRecycled + totalPlasticRecycled;

  res.json({
    success: true,
    data: {
      publishedReference: PRESIDENCY_CAMPUS_META.publishedReferences.waste,
      metrics: {
        totalFoodWasteKg: totalFoodWaste,
        avgDailyFoodWasteKg: Math.round(totalFoodWaste / (wasteReadings.length || 1)),
        publishedReferenceRange: "120 - 150 kg/day",
        totalVermicompostedKg: totalVermicomposted,
        totalDryRecycledKg: totalDryRecycled,
        totalPlasticRecycledKg: totalPlasticRecycled,
        totalDivertedFromLandfillKg: totalDiverted,
        diversionRatePct: totalFoodWaste > 0 ? Math.round((totalDiverted / (totalFoodWaste + totalDryRecycled + totalPlasticRecycled)) * 100) : 0,
        avoidedMethaneCo2eKg: Math.round(totalVermicomposted * 1.9),
        costAvoidanceInr: Math.round(totalDiverted * settings.wasteCostInr),
        activeWasteCostInr: settings.wasteCostInr
      },
      dailyTrend: wasteReadings.map(r => ({
        date: r.dateFormatted,
        foodWasteKg: r.actualFoodWasteKg,
        vermicompostedKg: r.vermicompostedKg,
        dryRecyclableKg: r.dryRecyclableKg,
        plasticRecycledKg: r.plasticRecycledKg,
        refBaselineMin: 120,
        refBaselineMax: 150,
        notes: r.notes
      })),
      anomalies: presidencyStore.anomalies.filter(a => a.resourceType === "Waste")
    }
  });
});

// 6. Inefficiencies & Anomalies Hub
router.get("/inefficiencies", (req, res) => {
  const { resourceType, facilityId, severity } = req.query;
  let list = presidencyStore.anomalies;

  if (resourceType && resourceType !== "all") {
    list = list.filter(a => a.resourceType.toLowerCase() === resourceType.toLowerCase());
  }
  if (facilityId && facilityId !== "all") {
    list = list.filter(a => a.facilityId === facilityId);
  }
  if (severity && severity !== "all") {
    list = list.filter(a => a.severity.toLowerCase() === severity.toLowerCase());
  }

  res.json({
    success: true,
    data: list,
    total: list.length,
    highCount: list.filter(a => a.severity === "High").length,
    mediumCount: list.filter(a => a.severity === "Medium").length,
    lowCount: list.filter(a => a.severity === "Low").length
  });
});

// 7. Recommendations
router.get("/recommendations", (req, res) => {
  res.json({
    success: true,
    data: presidencyStore.recommendations,
    tariffs: {
      electricityTariffInr: presidencyStore.settings.electricityTariffInr,
      waterTariffInr: presidencyStore.settings.waterTariffInr,
      wasteCostInr: presidencyStore.settings.wasteCostInr
    }
  });
});

// 8. Actions (SENSE -> ACT -> VERIFY Closed Loop)
router.get("/actions", (req, res) => {
  res.json({ success: true, data: presidencyStore.actions });
});

router.post("/actions", (req, res) => {
  const newAction = presidencyStore.createAction(req.body);
  res.status(201).json({ success: true, data: newAction });
});

router.patch("/actions/:id", (req, res) => {
  const updated = presidencyStore.updateAction(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, message: "Action not found" });
  res.json({ success: true, data: updated });
});

router.delete("/actions/:id", (req, res) => {
  const deleted = presidencyStore.deleteAction(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: "Action not found" });
  res.json({ success: true, message: "Action removed" });
});

// 9. Manual Entry Ingestion Form
router.post("/manual-entry", (req, res) => {
  const { resourceType, facilityId, value, timestamp, notes, operatorName } = req.body;
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

// 10. Multi-Resource CSV Upload with Validation
router.post("/upload-csv", upload.single("file"), (req, res) => {
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
      const rawFacility = row.facilityId || row.buildingId || row.facility || row.Building;
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
        facilityId: rawFacility || "bldg-admin",
        value: numVal,
        timestamp: rawTimestamp,
        meterId: row.meterId || `CSV-${resourceType.toUpperCase()}-MTR`,
        notes: row.notes || `Imported via CSV: ${req.file.originalname}`
      });
    })
    .on("end", () => {
      if (results.length === 0) {
        return res.status(400).json({ success: false, message: "No valid rows imported from CSV.", errors });
      }

      results.forEach(r => presidencyStore.addManualEntry(r));

      res.json({
        success: true,
        message: `Successfully validated and ingested ${results.length} ${resourceType} records into Presidency University repository.`,
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

// 11. Multi-Resource Sample CSV Download
router.get("/sample-csv", (req, res) => {
  const { type = "solar" } = req.query;
  let sampleContent = "";
  let filename = "presidency_sample.csv";

  if (type === "solar" || type === "electricity") {
    filename = "presidency_solar_electricity_sample.csv";
    sampleContent = `timestamp,facilityId,value,meterId,notes
2026-10-28T09:00:00Z,bldg-admin,72.4,MTR-ADMIN-SOLAR-01,Central admin morning solar output
2026-10-28T12:00:00Z,bldg-admin,164.2,MTR-ADMIN-SOLAR-01,Peak clear sky solar insolation
2026-10-28T15:00:00Z,bldg-admin,118.5,MTR-ADMIN-SOLAR-01,Afternoon solar generation
2026-10-28T10:00:00Z,bldg-eng,240.5,MTR-SOE-MAIN-01,Engineering heavy labs operating load`;
  } else if (type === "water") {
    filename = "presidency_water_stp_sample.csv";
    sampleContent = `timestamp,facilityId,value,meterId,notes
2026-10-28,bldg-stp,298000,FLOW-STP-TREATED-02,STP daily treated effluent (Litres)
2026-10-27,bldg-stp,302000,FLOW-STP-TREATED-02,STP design baseline volume
2026-10-26,bldg-stp,295000,FLOW-STP-TREATED-02,Normal SBR aeration batch cycle`;
  } else if (type === "waste") {
    filename = "presidency_cafeteria_waste_sample.csv";
    sampleContent = `timestamp,facilityId,value,meterId,notes
2026-10-28,bldg-foodcourt,138,SCALE-WASTE-01,Daily cafeteria food waste (kg)
2026-10-27,bldg-foodcourt,142,SCALE-WASTE-01,Normal lunch and dinner plate collection
2026-10-26,bldg-foodcourt,130,SCALE-WASTE-01,Post-consumer organic waste for vermicomposting`;
  }

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  res.send(sampleContent);
});

// 12. Settings & Config
router.get("/settings", (req, res) => {
  res.json({ success: true, data: presidencyStore.settings });
});

router.put("/settings", (req, res) => {
  const updated = presidencyStore.updateSettings(req.body);
  res.json({ success: true, data: updated, message: "Settings updated and analytics dynamically recomputed." });
});

// 13. Reset to Clean Presidency Demo Benchmark
router.post("/reset-data", (req, res) => {
  presidencyStore.resetToSeedData();
  res.json({
    success: true,
    message: "Presidency University benchmark telemetry restored successfully (800 kWh/day Solar, 300,000 L STP, 120-150 kg Waste)."
  });
});
