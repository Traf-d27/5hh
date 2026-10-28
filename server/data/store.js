import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PRESIDENCY_CAMPUS_META, CAMPUS_FACILITIES, BLOCKS_CONFIG, getBlockById } from "./presidencyCampus.js";
import { generatePresidencyCampusTelemetry } from "./syntheticGenerator.js";
import { detectAllCampusInefficiencies } from "../engine/anomalyEngine.js";
import { generatePresidencyRecommendations } from "../engine/recommendationsEngine.js";
import { generateSolarDayAheadForecast } from "../engine/forecastingEngine.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "presidency_campus_state.json");

// Category energy intensity benchmarks (kWh / sqm / year) for score calculation
const CATEGORY_BENCHMARKS = {
  "Academic-Lab": 55,
  "Academic": 32,
  "Academic-Studio": 38,
  "Administrative": 30,
  "Library": 42,
  "Residential": 28,
  "Food-Service": 65,
  "Recreational": 22,
  "Assembly": 25,
  "Utility": 40
};

class PresidencyDataStore {
  constructor() {
    this.meta = PRESIDENCY_CAMPUS_META;
    this.facilities = CAMPUS_FACILITIES;
    this.blocks = BLOCKS_CONFIG;

    this.settings = {
      institutionName: PRESIDENCY_CAMPUS_META.institutionName,
      campusLocation: PRESIDENCY_CAMPUS_META.campusLocation,
      electricityTariffInr: PRESIDENCY_CAMPUS_META.commercialTariffInrPerKwh,
      waterTariffInr: PRESIDENCY_CAMPUS_META.waterTariffInrPerKl,
      wasteCostInr: PRESIDENCY_CAMPUS_META.wasteDisposalCostInrPerKg,
      gridCo2Factor: PRESIDENCY_CAMPUS_META.gridEmissionFactorKgCo2ePerKwh,
      currencySymbol: "₹",
      currencyCode: "INR",
      publishedSolarDailyKwh: 800,
      publishedStpDailyLitres: 300000,
      publishedFoodWasteKgRange: "120 - 150 kg/day",
      solarDiscrepancyAuditFlag: true,
      solarDiscrepancyNote: PRESIDENCY_CAMPUS_META.publishedReferences.solar.discrepancyNote
    };

    this.electricityReadings = [];
    this.solarHourlyReadings = [];
    this.waterDailyReadings = [];
    this.wasteDailyReadings = [];
    this.manualEntries = [];

    this.anomalies = [];
    this.recommendations = [];
    this.actions = [];
    this.solarForecast = null;

    this.init();
  }

  init() {
    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        this.settings = { ...this.settings, ...(parsed.settings || {}) };
        this.electricityReadings = parsed.electricityReadings || [];
        this.solarHourlyReadings = parsed.solarHourlyReadings || [];
        this.waterDailyReadings = parsed.waterDailyReadings || [];
        this.wasteDailyReadings = parsed.wasteDailyReadings || [];
        this.actions = parsed.actions || [];
        this.manualEntries = parsed.manualEntries || [];
        
        // If data was legacy without blockIds, regenerate fresh telemetry
        if (!this.electricityReadings[0]?.blockId) {
          console.log("Migrating store to block-wise telemetry schema...");
          this.resetToSeedData();
          return;
        }

        this.recomputeAnalytics();
        return;
      } catch (err) {
        console.warn("Failed to load saved state, regenerating fresh Presidency telemetry:", err.message);
      }
    }
    this.resetToSeedData();
  }

  resetToSeedData() {
    const telemetry = generatePresidencyCampusTelemetry(14);
    this.electricityReadings = telemetry.electricityReadings;
    this.solarHourlyReadings = telemetry.solarHourlyReadings;
    this.waterDailyReadings = telemetry.waterDailyReadings;
    this.wasteDailyReadings = telemetry.wasteDailyReadings;
    this.manualEntries = [];

    this.actions = [
      {
        id: "ACT-PRES-01",
        resourceType: "Solar",
        blockId: "ADMIN",
        facilityId: "ADMIN",
        facilityName: "Management / Administration Block",
        recommendationId: "REC-ADMIN-SOLAR-01",
        title: "Admin Rooftop Solar Module Spray Wash & String Test",
        status: "In Progress",
        priority: "High",
        assignedTo: "M. Ramesh (Campus Solar & Electrical Lead)",
        targetDate: "2026-11-02",
        interventionDetails: "Demineralized high-pressure spray cleaning of 220 kWp rooftop array; thermal imaging on string inverters.",
        potentialResourceSavings: 4800,
        potentialInrSavings: Math.round(4800 * this.settings.electricityTariffInr),
        verifiedResourceSavings: 0,
        verifiedInrSavings: 0,
        resourceUnit: "kWh",
        baselinePeriod: "Pre-cleaning degradation: 490 kWh/day avg (38% shortfall)",
        currentReading: "Array washed 50% - awaiting post-intervention generation log",
        notes: "Electrician team deployed morning 06:30. Inverter MPPT string 2 fuses replaced.",
        createdAt: "2026-10-26T09:00:00Z",
        updatedAt: "2026-10-27T17:00:00Z"
      },
      {
        id: "ACT-PRES-02",
        resourceType: "Water",
        blockId: "STP",
        facilityId: "STP",
        facilityName: "Sewage Treatment Plant & Utilities",
        recommendationId: "REC-STP-LEAK-01",
        title: "Central Lawn Turf Irrigation Lateral Rupture Sealing",
        status: "Resolved",
        priority: "High",
        assignedTo: "P. Gowda (Plumbing & STP Maintenance)",
        targetDate: "2026-10-26",
        interventionDetails: "Excavated fractured 90mm schedule-40 PVC joint near Chancellery lawn; replaced with HDPE electrofusion coupling.",
        potentialResourceSavings: 1850000,
        potentialInrSavings: Math.round((1850000 / 1000) * this.settings.waterTariffInr),
        verifiedResourceSavings: 1780000,
        verifiedInrSavings: Math.round((1780000 / 1000) * this.settings.waterTariffInr),
        resourceUnit: "Litres",
        baselinePeriod: "Surge draw: 352,000 Litres/day (cracked pipe)",
        currentReading: "Verified: Daily irrigation stabilized at 264,000 Litres (normal design distribution)",
        notes: "Pressure test passed at 3.5 bar continuous hold. Verified leak eliminated.",
        createdAt: "2026-10-24T14:00:00Z",
        updatedAt: "2026-10-27T11:30:00Z"
      },
      {
        id: "ACT-PRES-03",
        resourceType: "Waste",
        blockId: "FOOD",
        facilityId: "FOOD",
        facilityName: "Central Food Court & Student Mess",
        recommendationId: "REC-FOOD-PORTION-01",
        title: "Cafeteria Waste Weigh-Back Scale & Compost Bin Expansion",
        status: "Open",
        priority: "Medium",
        assignedTo: "Sunita Reddy (Catering Services & Sustainability Committee)",
        targetDate: "2026-11-08",
        interventionDetails: "Set up electronic platform scale at tray returns; build 2 additional brick-lined vermiculture pits with coconut coir and dry leaves.",
        potentialResourceSavings: 2400,
        potentialInrSavings: Math.round(2400 * this.settings.wasteCostInr),
        verifiedResourceSavings: 0,
        verifiedInrSavings: 0,
        resourceUnit: "kg",
        baselinePeriod: "Surge: 238 kg/day food waste post-cultural event",
        currentReading: "Procurement approved for digital floor scale",
        notes: "Student volunteer green marshals briefing scheduled for Friday lunch hour.",
        createdAt: "2026-10-27T10:00:00Z",
        updatedAt: "2026-10-27T10:00:00Z"
      },
      {
        id: "ACT-PRES-04",
        resourceType: "Electricity",
        blockId: "CSE",
        facilityId: "CSE",
        facilityName: "Computer Science & Engineering Block",
        recommendationId: "REC-CSE-SHUTDOWN-01",
        title: "CSE Lab Automated Hibernate Script Deployment",
        status: "In Progress",
        priority: "High",
        assignedTo: "Dr. K. Sharma (Head of Systems & Networking)",
        targetDate: "2026-11-05",
        interventionDetails: "Active Directory GPO policy deployed to 450 lab computers to force S3 sleep after 30 min idle past 21:00.",
        potentialResourceSavings: 3800,
        potentialInrSavings: Math.round(3800 * this.settings.electricityTariffInr),
        verifiedResourceSavings: 0,
        verifiedInrSavings: 0,
        resourceUnit: "kWh",
        baselinePeriod: "Night baseline: 42 kW continuous idle draw",
        currentReading: "Script rolled out to Labs 1, 2, 3; testing wake-on-LAN for backups",
        notes: "Initial test showed 14 kW overnight drop in first 3 labs.",
        createdAt: "2026-10-27T14:00:00Z",
        updatedAt: "2026-10-28T09:00:00Z"
      }
    ];

    this.recomputeAnalytics();
    this.save();
  }

  recomputeAnalytics() {
    const tariffs = {
      electricityTariffInr: this.settings.electricityTariffInr,
      waterTariffInr: this.settings.waterTariffInr,
      wasteCostInr: this.settings.wasteCostInr
    };

    const telemetry = {
      electricityReadings: this.electricityReadings,
      solarHourlyReadings: this.solarHourlyReadings,
      waterDailyReadings: this.waterDailyReadings,
      wasteDailyReadings: this.wasteDailyReadings
    };

    this.anomalies = detectAllCampusInefficiencies(telemetry, tariffs);
    this.recommendations = generatePresidencyRecommendations(this.anomalies, tariffs);
    this.solarForecast = generateSolarDayAheadForecast(this.solarHourlyReadings);

    // Refresh action INR values
    this.actions = this.actions.map((act) => {
      let tariffRate = this.settings.electricityTariffInr;
      let divider = 1;
      if (act.resourceType === "Water") {
        tariffRate = this.settings.waterTariffInr;
        divider = 1000;
      } else if (act.resourceType === "Waste") {
        tariffRate = this.settings.wasteCostInr;
      }

      return {
        ...act,
        potentialInrSavings: Math.round((act.potentialResourceSavings / divider) * tariffRate),
        verifiedInrSavings: Math.round(((act.verifiedResourceSavings || 0) / divider) * tariffRate)
      };
    });
  }

  save() {
    try {
      const payload = {
        settings: this.settings,
        electricityReadings: this.electricityReadings,
        solarHourlyReadings: this.solarHourlyReadings,
        waterDailyReadings: this.waterDailyReadings,
        wasteDailyReadings: this.wasteDailyReadings,
        actions: this.actions,
        manualEntries: this.manualEntries
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), "utf-8");
    } catch (err) {
      console.error("Error saving Presidency campus state:", err.message);
    }
  }

  // ─── Sustainability Score Calculation (Transparent Score Formula) ─────────
  calculateBlockSustainabilityScore(block) {
    const blockId = block.id;
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    // 1. Energy intensity component (weight: 35%)
    // Sum electricity over the last 7 days and annualize
    const blockElecReadings = this.electricityReadings.filter(r => r.blockId === blockId);
    const last7DaysKwh = blockElecReadings.slice(0, 7 * 24).reduce((s, r) => s + (r.kwh || 0), 0);
    const dailyAvgKwh = last7DaysKwh > 0 ? last7DaysKwh / 7 : 400;
    const annualKwh = dailyAvgKwh * 365;
    const area = block.builtUpAreaSqm || 10000;
    const kwhPerSqm = Math.round((annualKwh / area) * 10) / 10;
    const targetIntensity = CATEGORY_BENCHMARKS[block.category] || 40;

    // Energy score: 100 if <= target, decaying to 20 if 2x target
    const intensityRatio = kwhPerSqm / targetIntensity;
    let energyScore = Math.max(10, Math.min(100, Math.round(100 - (intensityRatio - 0.8) * 100)));

    // 2. Solar Self-Consumption / Clean Energy (weight: 20%)
    // Admin has 220 kWp rooftop; others benefit from campus clean energy
    let solarScore = 40;
    if (block.rooftopSolarKwp > 0) {
      solarScore = 95;
    } else {
      solarScore = Math.min(80, Math.round(25 + (1 - intensityRatio) * 30));
    }

    // 3. Water Efficiency & Reuse (weight: 20%)
    // Compare actual water vs baseline
    const blockWater = this.waterDailyReadings.filter(r => r.blockId === blockId);
    let waterScore = 78;
    if (blockWater.length > 0) {
      const latestWater = blockWater[0];
      const reusePct = latestWater.reuseRatioPct || 88;
      waterScore = Math.min(100, Math.round(reusePct * 0.95));
      if (latestWater.actualTreatedLitres > latestWater.baselineTreatmentLitres * 1.2) {
        waterScore -= 25; // Leak penalty
      }
    }

    // 4. Waste Diversion (weight: 15%)
    let wasteScore = 80;
    if (block.id === "FOOD") {
      const blockWaste = this.wasteDailyReadings[0];
      wasteScore = blockWaste ? blockWaste.diversionRatePct || 85 : 85;
    }

    // 5. Open Alert Penalty (weight: 10%, up to -20 pts)
    const openAlerts = this.anomalies.filter(a => a.blockId === blockId);
    const alertPenalty = Math.min(20, openAlerts.length * 5);

    // Weighted Total Score (0 - 100)
    const rawScore = Math.round(
      energyScore * 0.35 +
      solarScore * 0.20 +
      waterScore * 0.20 +
      wasteScore * 0.15 -
      alertPenalty
    );
    const finalScore = Math.max(10, Math.min(100, rawScore));

    return {
      score: finalScore,
      rating: finalScore >= 80 ? "A (Exemplary)" : finalScore >= 65 ? "B (Good)" : finalScore >= 50 ? "C (Moderate)" : "D (Needs Action)",
      breakdown: {
        energyIntensityScore: energyScore,
        energyWeight: "35%",
        solarCleanEnergyScore: solarScore,
        solarWeight: "20%",
        waterEfficiencyScore: waterScore,
        waterWeight: "20%",
        wasteDiversionScore: wasteScore,
        wasteWeight: "15%",
        openAlertPenalty: alertPenalty,
        alertWeight: "10% max penalty (-5 pts per open alert)"
      },
      metrics: {
        annualKwhPerSqm: kwhPerSqm,
        categoryBenchmarkKwhPerSqm: targetIntensity,
        dailyAvgKwh: Math.round(dailyAvgKwh),
        openAlertsCount: openAlerts.length
      },
      formulaDocumentation: "Sustainability Score (0-100) = [Energy Intensity vs Benchmark * 35%] + [Solar/Clean Energy Share * 20%] + [Water Efficiency & Reuse * 20%] + [Waste Diversion * 15%] - [Open Alert Penalty up to 20 pts]."
    };
  }

  // ─── Block Registry & Enriched Blocks ─────────────────────────────────────
  getBlocks() {
    return this.blocks.map((block) => {
      const scoreObj = this.calculateBlockSustainabilityScore(block);

      // Latest 24h electricity
      const blockElec = this.electricityReadings.filter(r => r.blockId === block.id).slice(0, 24);
      const todayKwh = Math.round(blockElec.reduce((s, r) => s + (r.kwh || 0), 0));
      const todaySolarKwh = block.id === "ADMIN" 
        ? Math.round(this.solarHourlyReadings.slice(0, 24).reduce((s, r) => s + (r.actualSolarKwh || 0), 0))
        : 0;

      // Latest daily water
      const blockWater = this.waterDailyReadings.filter(r => r.blockId === block.id)[0];
      const todayWaterLitres = blockWater ? blockWater.actualTreatedLitres : 0;

      // Latest daily waste
      const blockWaste = block.id === "FOOD" ? this.wasteDailyReadings[0] : null;
      const todayWasteKg = blockWaste ? blockWaste.actualFoodWasteKg : 0;

      const alerts = this.anomalies.filter(a => a.blockId === block.id);
      const activeActions = this.actions.filter(a => a.blockId === block.id);

      return {
        ...block,
        kpis: {
          todayElectricityKwh: todayKwh,
          todaySolarKwh: todaySolarKwh,
          todayWaterLitres: todayWaterLitres,
          todayWasteKg: todayWasteKg,
          kwhPerSqm: scoreObj.metrics.annualKwhPerSqm,
          kwhPerOccupant: block.occupancy > 0 ? Math.round((todayKwh * 365) / block.occupancy) : 0,
          activeAlertsCount: alerts.length,
          activeActionsCount: activeActions.length,
          carbonKgToday: Math.round(todayKwh * this.settings.gridCo2Factor)
        },
        sustainabilityScore: scoreObj.score,
        sustainabilityRating: scoreObj.rating,
        scoreBreakdown: scoreObj.breakdown,
        scoreFormula: scoreObj.formulaDocumentation
      };
    });
  }

  getBlockById(id) {
    if (!id) return null;
    const blocks = this.getBlocks();
    return blocks.find(b => b.id.toUpperCase() === id.toUpperCase()) || null;
  }

  // ─── Block-Scoped Time Series ─────────────────────────────────────────────
  getBlockTimeSeries(blockId, resourceType, from, to) {
    const bId = blockId.toUpperCase();
    const type = (resourceType || "electricity").toLowerCase();

    if (type === "solar") {
      let data = this.solarHourlyReadings.filter(r => r.blockId === bId || bId === "ADMIN");
      return data.slice(0, 72); // Last 72 hours
    }

    if (type === "water") {
      return this.waterDailyReadings.filter(r => r.blockId === bId);
    }

    if (type === "waste") {
      return this.wasteDailyReadings.filter(r => r.blockId === bId || bId === "FOOD");
    }

    // Default: Electricity
    return this.electricityReadings.filter(r => r.blockId === bId).slice(0, 168); // Last 7 days hourly
  }

  getBlockAlerts(blockId) {
    const bId = blockId.toUpperCase();
    return this.anomalies.filter(a => a.blockId === bId);
  }

  getBlockRecommendations(blockId) {
    const bId = blockId.toUpperCase();
    return this.recommendations.filter(r => r.blockId === bId);
  }

  getBlockActions(blockId) {
    const bId = blockId.toUpperCase();
    return this.actions.filter(a => a.blockId === bId);
  }

  createBlockAction(blockId, actionData) {
    const bId = blockId.toUpperCase();
    const block = getBlockById(bId);
    if (!block) throw new Error(`Unknown block id: ${blockId}`);

    let tariffRate = this.settings.electricityTariffInr;
    let divider = 1;
    if (actionData.resourceType === "Water") {
      tariffRate = this.settings.waterTariffInr;
      divider = 1000;
    } else if (actionData.resourceType === "Waste") {
      tariffRate = this.settings.wasteCostInr;
    }

    const potentialVal = Number(actionData.potentialResourceSavings) || 0;
    const verifiedVal = Number(actionData.verifiedResourceSavings) || 0;

    const newAction = {
      id: `ACT-${bId}-${Date.now().toString().slice(-4)}`,
      blockId: bId,
      facilityId: bId,
      facilityName: block.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resourceType: actionData.resourceType || "Electricity",
      title: actionData.title,
      recommendationId: actionData.recommendationId || null,
      status: actionData.status || "Proposed",
      priority: actionData.priority || "Medium",
      assignedTo: actionData.assignedTo || `${block.name} Facility Manager`,
      targetDate: actionData.targetDate || new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      interventionDetails: actionData.interventionDetails || "",
      potentialResourceSavings: potentialVal,
      potentialInrSavings: Math.round((potentialVal / divider) * tariffRate),
      verifiedResourceSavings: verifiedVal,
      verifiedInrSavings: Math.round((verifiedVal / divider) * tariffRate),
      resourceUnit: actionData.resourceUnit || (actionData.resourceType === "Water" ? "Litres" : actionData.resourceType === "Waste" ? "kg" : "kWh"),
      baselinePeriod: actionData.baselinePeriod || "Observed baseline period",
      currentReading: actionData.currentReading || "",
      notes: actionData.notes || ""
    };

    this.actions.unshift(newAction);
    this.save();
    return newAction;
  }

  getBlockImpact(blockId) {
    const bId = blockId.toUpperCase();
    const block = getBlockById(bId);
    const actions = this.getBlockActions(bId);

    const completed = actions.filter(a => a.status === "Completed" || a.status === "Resolved" || a.status === "Verified");
    const totalPotentialInr = actions.reduce((s, a) => s + (a.potentialInrSavings || 0), 0);
    const totalVerifiedInr = actions.reduce((s, a) => s + (a.verifiedInrSavings || 0), 0);
    const realizationRatePct = totalPotentialInr > 0 ? Math.round((totalVerifiedInr / totalPotentialInr) * 100) : 0;

    return {
      blockId: bId,
      blockName: block?.name || bId,
      protocol: "IPMVP Option B (Retrofit Isolation)",
      summary: {
        totalActions: actions.length,
        completedActions: completed.length,
        potentialAnnualSavingsInr: totalPotentialInr * 12,
        verifiedSavingsInr: totalVerifiedInr,
        realizationRatePct,
        verifiedCo2AvoidedTons: Math.round(((totalVerifiedInr / this.settings.electricityTariffInr) * this.settings.gridCo2Factor / 1000) * 10) / 10
      },
      actionVerificationLedger: actions.map(a => ({
        actionId: a.id,
        title: a.title,
        resourceType: a.resourceType,
        status: a.status,
        projectedSavings: a.potentialResourceSavings,
        verifiedSavings: a.verifiedResourceSavings || 0,
        unit: a.resourceUnit,
        realizationRatePct: a.potentialResourceSavings > 0 
          ? Math.round(((a.verifiedResourceSavings || 0) / a.potentialResourceSavings) * 100) 
          : 0,
        verifiedInrSavings: a.verifiedInrSavings || 0
      }))
    };
  }

  // ─── Multi-Block Comparison & Leaderboard ─────────────────────────────────
  compareBlocks(blockIds = [], metric = "kwhPerSqm") {
    const allBlocks = this.getBlocks();
    const targetIds = blockIds.map(id => id.toUpperCase());
    const selected = allBlocks.filter(b => targetIds.includes(b.id));

    return {
      selectedMetric: metric,
      blocks: selected.map(b => ({
        id: b.id,
        name: b.name,
        category: b.category,
        builtUpAreaSqm: b.builtUpAreaSqm,
        occupancy: b.occupancy,
        sustainabilityScore: b.sustainabilityScore,
        kpis: b.kpis,
        accent: b.accent
      })),
      radarCategories: [
        { subject: "Energy Efficiency", fullMark: 100 },
        { subject: "Solar Clean Power", fullMark: 100 },
        { subject: "Water Conservation", fullMark: 100 },
        { subject: "Waste Diversion", fullMark: 100 },
        { subject: "Fault Resolution", fullMark: 100 }
      ],
      radarData: selected.map(b => ({
        blockId: b.id,
        name: b.shortName,
        "Energy Efficiency": b.scoreBreakdown.energyIntensityScore,
        "Solar Clean Power": b.scoreBreakdown.solarCleanEnergyScore,
        "Water Conservation": b.scoreBreakdown.waterEfficiencyScore,
        "Waste Diversion": b.scoreBreakdown.wasteDiversionScore,
        "Fault Resolution": Math.max(0, 100 - b.scoreBreakdown.openAlertPenalty * 5)
      }))
    };
  }

  getLeaderboard(metric = "score") {
    const allBlocks = this.getBlocks();
    let sorted = [...allBlocks];

    if (metric === "kwhPerSqm") {
      sorted.sort((a, b) => a.kpis.kwhPerSqm - b.kpis.kwhPerSqm); // lower is better
    } else if (metric === "kwhPerOccupant") {
      sorted.sort((a, b) => a.kpis.kwhPerOccupant - b.kpis.kwhPerOccupant);
    } else if (metric === "co2") {
      sorted.sort((a, b) => a.kpis.carbonKgToday - b.kpis.carbonKgToday);
    } else {
      // Default: Sustainability Score (higher is better)
      sorted.sort((a, b) => b.sustainabilityScore - a.sustainabilityScore);
    }

    return sorted.map((b, rank) => ({
      rank: rank + 1,
      id: b.id,
      name: b.name,
      shortName: b.shortName,
      category: b.category,
      accent: b.accent,
      sustainabilityScore: b.sustainabilityScore,
      sustainabilityRating: b.sustainabilityRating,
      kpis: b.kpis,
      isMostImproved: rank === 0 || b.id === "ADMIN" || b.id === "LIB",
      trend: rank < 4 ? "up" : rank > 8 ? "down" : "stable"
    }));
  }

  // ─── Existing Legacy Methods (Preserved) ──────────────────────────────────
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.recomputeAnalytics();
    this.save();
    return this.settings;
  }

  addManualEntry(entry) {
    const blockId = (entry.blockId || entry.facilityId || "ADMIN").toUpperCase();
    const newEntry = {
      id: `manual-${Date.now()}`,
      blockId,
      createdAt: new Date().toISOString(),
      dataClassification: "IMPORTED_MEASUREMENT",
      source: "METER",
      ...entry
    };
    this.manualEntries.unshift(newEntry);

    if (entry.resourceType === "Solar" || entry.resourceType === "Electricity") {
      this.electricityReadings.unshift({
        id: newEntry.id,
        blockId,
        facilityId: blockId,
        facilityName: entry.facilityName || blockId,
        meterId: entry.meterId || `MANUAL-${blockId}-ELEC`,
        timestamp: entry.timestamp || new Date().toISOString(),
        dateFormatted: new Date(entry.timestamp || Date.now()).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }),
        hour: new Date(entry.timestamp || Date.now()).getHours(),
        kwh: Number(entry.value),
        baselineKwh: Number(entry.baselineValue || entry.value * 0.85),
        solarContributionKwh: entry.solarContributionKwh || 0,
        gridImportKwh: Number(entry.value),
        isOperatingHours: true,
        dataClassification: "IMPORTED_MEASUREMENT",
        source: "METER",
        sourceTag: `Manual Operator Entry (${entry.operatorName || "Technician"})`,
        notes: entry.notes || "Logged via Manual Entry Form"
      });
    }

    this.recomputeAnalytics();
    this.save();
    return newEntry;
  }

  createAction(actionData) {
    const blockId = actionData.blockId || "ADMIN";
    return this.createBlockAction(blockId, actionData);
  }

  updateAction(id, updates) {
    const idx = this.actions.findIndex(a => a.id === id);
    if (idx === -1) return null;

    const existing = this.actions[idx];
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };

    let tariffRate = this.settings.electricityTariffInr;
    let divider = 1;
    if (updated.resourceType === "Water") {
      tariffRate = this.settings.waterTariffInr;
      divider = 1000;
    } else if (updated.resourceType === "Waste") {
      tariffRate = this.settings.wasteCostInr;
    }

    if (updates.verifiedResourceSavings !== undefined) {
      updated.verifiedResourceSavings = Number(updates.verifiedResourceSavings);
      updated.verifiedInrSavings = Math.round((updated.verifiedResourceSavings / divider) * tariffRate);
    }
    if (updates.potentialResourceSavings !== undefined) {
      updated.potentialResourceSavings = Number(updates.potentialResourceSavings);
      updated.potentialInrSavings = Math.round((updated.potentialResourceSavings / divider) * tariffRate);
    }

    this.actions[idx] = updated;
    this.save();
    return updated;
  }

  deleteAction(id) {
    const initLen = this.actions.length;
    this.actions = this.actions.filter(a => a.id !== id);
    this.save();
    return this.actions.length < initLen;
  }
}

export const presidencyStore = new PresidencyDataStore();
