import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PRESIDENCY_CAMPUS_META, CAMPUS_FACILITIES } from "./presidencyCampus.js";
import { generatePresidencyCampusTelemetry } from "./syntheticGenerator.js";
import { detectAllCampusInefficiencies } from "../engine/anomalyEngine.js";
import { generatePresidencyRecommendations } from "../engine/recommendationsEngine.js";
import { generateSolarDayAheadForecast } from "../engine/forecastingEngine.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "presidency_campus_state.json");

class PresidencyDataStore {
  constructor() {
    this.meta = PRESIDENCY_CAMPUS_META;
    this.facilities = CAMPUS_FACILITIES;

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

    // Seed realistic pre-existing tracked actions across Solar, Water, and Waste
    this.actions = [
      {
        id: "ACT-PRES-01",
        resourceType: "Solar",
        title: "Central Admin Rooftop Solar Module Spray Wash & String Test",
        facilityId: "bldg-admin",
        facilityName: "Central Administration & Chancellery Building",
        recommendationId: "REC-SOLAR-01",
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
        title: "Central Lawn Turf Irrigation Lateral Rupture Sealing",
        facilityId: "bldg-stp",
        facilityName: "Campus Sewage Treatment Plant (STP) & Green Lawns",
        recommendationId: "REC-WATER-03",
        status: "Resolved",
        priority: "High",
        assignedTo: "P. Gowda (Plumbing & STP Maintenance)",
        targetDate: "2026-10-26",
        interventionDetails: "Excavated fractured 90mm schedule-40 PVC joint near Chancellery lawn; replaced with HDPE electrofusion coupling.",
        potentialResourceSavings: 1850000,
        potentialInrSavings: Math.round((1850000 / 1000) * this.settings.waterTariffInr),
        verifiedResourceSavings: 1780000, // Verified through M&V!
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
        title: "Cafeteria Waste Weigh-Back Scale & Compost Bin Expansion",
        facilityId: "bldg-foodcourt",
        facilityName: "Central Food Court, Dining Commons & Cafeteria",
        recommendationId: "REC-WASTE-04",
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

    // Refresh action potential/verified INR values
    this.actions = this.actions.map((act) => {
      let tariffRate = this.settings.electricityTariffInr;
      let divider = 1;

      if (act.resourceType === "Water") {
        tariffRate = this.settings.waterTariffInr;
        divider = 1000; // per kL
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

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.recomputeAnalytics();
    this.save();
    return this.settings;
  }

  addManualEntry(entry) {
    const newEntry = {
      id: `manual-${Date.now()}`,
      createdAt: new Date().toISOString(),
      dataClassification: "IMPORTED_MEASUREMENT",
      ...entry
    };
    this.manualEntries.unshift(newEntry);

    // Also route into the appropriate resource array
    if (entry.resourceType === "Solar" || entry.resourceType === "Electricity") {
      this.electricityReadings.unshift({
        id: newEntry.id,
        facilityId: entry.facilityId,
        facilityName: entry.facilityName || entry.facilityId,
        meterId: entry.meterId || "MANUAL-ELEC-MTR",
        timestamp: entry.timestamp || new Date().toISOString(),
        dateFormatted: new Date(entry.timestamp || Date.now()).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }),
        hour: new Date(entry.timestamp || Date.now()).getHours(),
        kwh: Number(entry.value),
        baselineKwh: Number(entry.baselineValue || entry.value * 0.85),
        solarContributionKwh: entry.solarContributionKwh || 0,
        gridImportKwh: Number(entry.value),
        isOperatingHours: true,
        dataClassification: "IMPORTED_MEASUREMENT",
        sourceTag: `Manual Operator Entry (${entry.operatorName || "Technician"})`,
        notes: entry.notes || "Logged via Manual Entry Form"
      });
    } else if (entry.resourceType === "Water") {
      this.waterDailyReadings.unshift({
        id: newEntry.id,
        date: (entry.timestamp || new Date().toISOString()).slice(0, 10),
        dateFormatted: new Date(entry.timestamp || Date.now()).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }),
        facilityId: entry.facilityId || "bldg-stp",
        facilityName: "Campus Sewage Treatment Plant (STP) & Green Lawns",
        meterId: entry.meterId || "MANUAL-FLOW-MTR",
        baselineTreatmentLitres: 295000,
        actualTreatedLitres: Number(entry.value),
        landscapeReuseLitres: Number(entry.reuseValue || entry.value * 0.88),
        reuseRatioPct: 88,
        freshWaterAvoidedLitres: Number(entry.reuseValue || entry.value * 0.88),
        publishedCampusReferenceLitres: 300000,
        dataClassification: "IMPORTED_MEASUREMENT",
        sourceTag: `Manual Operator Entry (${entry.operatorName || "Plumbing Lead"})`,
        notes: entry.notes || "Logged via Manual Entry Form"
      });
    } else if (entry.resourceType === "Waste") {
      this.wasteDailyReadings.unshift({
        id: newEntry.id,
        date: (entry.timestamp || new Date().toISOString()).slice(0, 10),
        dateFormatted: new Date(entry.timestamp || Date.now()).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }),
        facilityId: entry.facilityId || "bldg-foodcourt",
        facilityName: "Central Food Court, Dining Commons & Cafeteria",
        meterId: entry.meterId || "MANUAL-SCALE-01",
        baselineFoodWasteKg: 135,
        actualFoodWasteKg: Number(entry.value),
        dryRecyclableKg: Number(entry.dryRecyclableKg || 80),
        plasticRecycledKg: Number(entry.plasticRecycledKg || 40),
        vermicompostedKg: Number(entry.vermicompostedKg || entry.value * 0.9),
        divertedFromLandfillKg: Number(entry.value * 0.9) + 120,
        diversionRatePct: 91,
        publishedReferenceRange: "120 - 150 kg/day",
        dataClassification: "IMPORTED_MEASUREMENT",
        sourceTag: `Manual Operator Entry (${entry.operatorName || "Cafeteria Supervisor"})`,
        notes: entry.notes || "Logged via Manual Entry Form"
      });
    }

    this.recomputeAnalytics();
    this.save();
    return newEntry;
  }

  createAction(actionData) {
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
      id: `ACT-PRES-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resourceType: actionData.resourceType || "Electricity",
      title: actionData.title,
      facilityId: actionData.facilityId,
      facilityName: actionData.facilityName,
      recommendationId: actionData.recommendationId || null,
      status: actionData.status || "Open",
      priority: actionData.priority || "Medium",
      assignedTo: actionData.assignedTo || "Campus Sustainability Officer",
      targetDate: actionData.targetDate || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
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
