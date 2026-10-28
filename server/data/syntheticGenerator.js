import { BLOCKS_CONFIG } from "./presidencyCampus.js";

/**
 * Multi-Resource Block-Wise Synthetic Telemetry Generator for Presidency University
 * Calibrated against official published campus references:
 * - Solar: ~800 kWh/day on Central Admin Building (220 kWp array)
 * - Total Campus Electricity: ~12,800 kWh/day sum of all 12 blocks
 * - Water STP: ~300,000 Litres/day (300 kL) treated & 88% reused for landscape irrigation
 * - Waste: 120-150 kg/day food waste vermicomposted for organic horticulture
 *
 * Every reading includes:
 * - blockId: string
 * - resourceType: 'electricity' | 'solar' | 'water' | 'waste'
 * - source: 'SYNTHETIC_CALIBRATED' | 'METER' | 'CSV_UPLOAD'
 */

// Category load profile multipliers by hour (0 to 23)
const HOURLY_SHAPES = {
  "Academic-Lab": [
    0.15, 0.14, 0.14, 0.14, 0.15, 0.20, 0.35, 0.60, 0.85, 0.98,
    1.00, 0.96, 0.92, 0.95, 0.98, 0.94, 0.82, 0.60, 0.40, 0.28,
    0.22, 0.18, 0.16, 0.15
  ],
  "Academic": [
    0.12, 0.12, 0.12, 0.12, 0.13, 0.16, 0.30, 0.55, 0.82, 0.95,
    0.98, 0.92, 0.88, 0.92, 0.95, 0.88, 0.75, 0.50, 0.30, 0.20,
    0.16, 0.14, 0.13, 0.12
  ],
  "Academic-Studio": [
    0.14, 0.13, 0.13, 0.13, 0.14, 0.18, 0.30, 0.50, 0.78, 0.90,
    0.92, 0.90, 0.86, 0.90, 0.94, 0.92, 0.85, 0.70, 0.55, 0.42,
    0.32, 0.24, 0.18, 0.15
  ],
  "Administrative": [
    0.10, 0.10, 0.10, 0.10, 0.11, 0.14, 0.25, 0.50, 0.80, 0.96,
    0.98, 0.95, 0.85, 0.92, 0.96, 0.90, 0.75, 0.45, 0.25, 0.16,
    0.13, 0.11, 0.10, 0.10
  ],
  "Library": [
    0.18, 0.16, 0.15, 0.15, 0.16, 0.20, 0.35, 0.55, 0.75, 0.88,
    0.92, 0.94, 0.92, 0.94, 0.96, 0.94, 0.90, 0.85, 0.78, 0.65,
    0.50, 0.35, 0.24, 0.20
  ],
  "Residential": [
    0.32, 0.28, 0.25, 0.24, 0.26, 0.42, 0.75, 0.92, 0.85, 0.60,
    0.45, 0.40, 0.42, 0.45, 0.42, 0.45, 0.58, 0.78, 0.95, 1.00,
    0.94, 0.82, 0.62, 0.45
  ],
  "Food-Service": [
    0.15, 0.14, 0.14, 0.15, 0.22, 0.45, 0.75, 0.95, 0.85, 0.55,
    0.72, 0.98, 1.00, 0.88, 0.60, 0.55, 0.65, 0.85, 0.98, 0.92,
    0.68, 0.40, 0.25, 0.18
  ],
  "Recreational": [
    0.10, 0.10, 0.10, 0.10, 0.12, 0.35, 0.65, 0.75, 0.45, 0.30,
    0.28, 0.28, 0.30, 0.30, 0.32, 0.45, 0.75, 0.95, 1.00, 0.92,
    0.70, 0.40, 0.20, 0.12
  ],
  "Assembly": [
    0.08, 0.08, 0.08, 0.08, 0.08, 0.10, 0.15, 0.25, 0.45, 0.60,
    0.65, 0.62, 0.58, 0.65, 0.70, 0.65, 0.55, 0.40, 0.30, 0.20,
    0.14, 0.10, 0.09, 0.08
  ],
  "Utility": [
    0.48, 0.48, 0.48, 0.48, 0.50, 0.52, 0.55, 0.65, 0.75, 0.88,
    0.95, 0.90, 0.68, 0.68, 0.72, 0.88, 0.95, 0.85, 0.65, 0.55,
    0.52, 0.50, 0.48, 0.48
  ]
};

// Base allocation share of campus daily electricity (~12,800 kWh total)
const BLOCK_ELEC_SHARES = {
  ADMIN: 0.065,
  CSE: 0.150,
  ENGG: 0.180,
  CIVIL: 0.075,
  LIB: 0.060,
  ARCH: 0.055,
  COMM: 0.085,
  HOSTEL_B: 0.125,
  HOSTEL_G: 0.100,
  FOOD: 0.055,
  SPORTS: 0.025,
  AUD: 0.015,
  STP: 0.010
};

// Base allocation share of campus daily water demand (~300,000 Litres total)
const BLOCK_WATER_SHARES = {
  ADMIN: 0.03,
  CSE: 0.06,
  ENGG: 0.07,
  CIVIL: 0.03,
  LIB: 0.02,
  ARCH: 0.02,
  COMM: 0.04,
  HOSTEL_B: 0.24,
  HOSTEL_G: 0.20,
  FOOD: 0.16,
  SPORTS: 0.04,
  AUD: 0.01,
  STP: 0.08
};

export function generatePresidencyCampusTelemetry(daysBack = 14) {
  const electricityReadings = [];
  const solarHourlyReadings = [];
  const waterDailyReadings = [];
  const wasteDailyReadings = [];

  const now = new Date("2026-10-28T10:00:00+05:30");
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const CAMPUS_DAILY_ELEC_BASELINE = 12800; // kWh/day campus total
  const totalHours = daysBack * 24;

  // ─── 1. Generate Hourly Electricity & Solar Telemetry ───────────────────────
  for (let h = totalHours; h >= 0; h--) {
    const timestamp = new Date(now.getTime() - h * 60 * 60 * 1000);
    const hour = timestamp.getHours();
    const dayOfWeek = timestamp.getDay();
    const dayStr = dayNames[dayOfWeek];
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isoString = timestamp.toISOString();
    const dateFormatted = timestamp.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
    const dayOfMonth = timestamp.getDate();

    // Weather simulation (Bengaluru October: mostly clear, minor clouds)
    let weatherCondition = "Clear Sky";
    let cloudFactor = 1.0;
    if (dayOfMonth === 21 || dayOfMonth === 22) {
      weatherCondition = "Partly Cloudy";
      cloudFactor = 0.78;
    } else if (dayOfMonth === 27) {
      weatherCondition = "Monsoon Overcast & Rain";
      cloudFactor = 0.45;
    }

    // Solar generation (Admin 220 kWp array yields ~800 kWh/day reference)
    let expectedSolarKw = 0;
    let actualSolarKw = 0;
    let solarNotes = "";

    if (hour >= 6 && hour <= 18) {
      const solarAngle = Math.sin(((hour - 6) / 12) * Math.PI);
      expectedSolarKw = Math.round(165 * Math.pow(solarAngle, 1.5) * 10) / 10;
      actualSolarKw = Math.round(expectedSolarKw * cloudFactor * 10) / 10;

      // Injected Fault 2: Admin Rooftop Solar Soiling (Oct 24-26, PR drops to ~0.62)
      if (dayOfMonth >= 24 && dayOfMonth <= 26) {
        actualSolarKw = Math.round(actualSolarKw * 0.62 * 10) / 10;
        solarNotes = "Rooftop PV array experiencing heavy dust/soiling accumulation from lawn civil works.";
      }
    }

    if (expectedSolarKw > 0 || actualSolarKw > 0) {
      solarHourlyReadings.push({
        id: `sol-ADMIN-${timestamp.getTime()}`,
        blockId: "ADMIN",
        facilityId: "ADMIN",
        facilityName: "Management / Administration Block",
        meterId: "MTR-ADMIN-SOLAR-01",
        resourceType: "solar",
        source: "SYNTHETIC_CALIBRATED",
        sourceTag: "Calibrated Rooftop Solar PV Model (220 kWp Array)",
        dataClassification: "SYNTHETIC_CALIBRATED",
        timestamp: isoString,
        dateFormatted,
        hour,
        weatherCondition,
        expectedSolarKw,
        actualSolarKw,
        expectedSolarKwh: expectedSolarKw,
        actualSolarKwh: actualSolarKw,
        generationDeltaKwh: Math.round((actualSolarKw - expectedSolarKw) * 10) / 10,
        generationDeltaPct: expectedSolarKw > 0 ? Math.round(((actualSolarKw - expectedSolarKw) / expectedSolarKw) * 100) : 0,
        publishedCampusBenchmarkKwh: 800,
        notes: solarNotes || undefined
      });
    }

    // Generate Hourly Electricity for EVERY Block
    BLOCKS_CONFIG.forEach((block) => {
      const shape = HOURLY_SHAPES[block.category] || HOURLY_SHAPES["Academic"];
      const hourlyMult = shape[hour] || 0.5;
      const blockShare = BLOCK_ELEC_SHARES[block.id] || (1 / BLOCKS_CONFIG.length);
      const avgHourlyKwh = (CAMPUS_DAILY_ELEC_BASELINE * blockShare) / 24;

      const weekendDiscount = isWeekend && !["Residential", "Food-Service", "Utility"].includes(block.category) ? 0.45 : 1.0;
      let expectedDemandKwh = Math.round(avgHourlyKwh * (hourlyMult / 0.5) * weekendDiscount * 10) / 10;
      let actualDemandKwh = expectedDemandKwh * (1 + Math.sin(h * 3.1 + block.builtUpAreaSqm) * 0.035);
      let demandNotes = "";

      // Injected Fault 1: CSE Block Night Idle Baseload (>35% of peak at night, Oct 24-27)
      if (block.id === "CSE" && dayOfMonth >= 24 && dayOfMonth <= 27 && (hour >= 22 || hour <= 5)) {
        actualDemandKwh = expectedDemandKwh * 2.8;
        demandNotes = "CSE lab high-performance computing clusters and workstation rigs left idling overnight without sleep profiles.";
      }

      // Admin weekend boardroom AC overrun
      if (block.id === "ADMIN" && (dayOfMonth === 24 || dayOfMonth === 25)) {
        actualDemandKwh = expectedDemandKwh * 2.6;
        demandNotes = "Chancellery executive boardroom AC units left operational continuously across weekend closure.";
      }

      // Engg Block chiller staging on Oct 26
      if (block.id === "ENGG" && dayOfMonth === 26 && hour >= 13 && hour <= 17) {
        actualDemandKwh = expectedDemandKwh * 1.45;
        demandNotes = "Chiller compressor sequencing fault causing simultaneous secondary compressor staging.";
      }

      const solarContributionKwh = block.id === "ADMIN" ? Math.min(actualDemandKwh, actualSolarKw) : 0;
      const gridImportKwh = Math.max(0, actualDemandKwh - solarContributionKwh);

      electricityReadings.push({
        id: `el-${block.id}-${timestamp.getTime()}`,
        blockId: block.id,
        facilityId: block.id,
        facilityName: block.name,
        resourceType: "electricity",
        source: "SYNTHETIC_CALIBRATED",
        sourceTag: "Campus Power Substation Calibrated Profile",
        dataClassification: "SYNTHETIC_CALIBRATED",
        meterId: `MTR-${block.id}-ELEC-01`,
        timestamp: isoString,
        dateFormatted,
        hour,
        kwh: Math.round(actualDemandKwh * 10) / 10,
        baselineKwh: Math.round(expectedDemandKwh * 10) / 10,
        solarContributionKwh: Math.round(solarContributionKwh * 10) / 10,
        gridImportKwh: Math.round(gridImportKwh * 10) / 10,
        isOperatingHours: hour >= 8 && hour < 18,
        notes: demandNotes || undefined
      });
    });
  }

  // ─── 2. Generate Daily Water & STP Telemetry (Past 14 Days) ─────────────────
  const CAMPUS_DAILY_WATER_BASELINE = 300000; // Litres/day
  for (let d = daysBack; d >= 0; d--) {
    const timestamp = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    const dateFormatted = timestamp.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
    const dayOfMonth = timestamp.getDate();
    const dateStr = timestamp.toISOString().slice(0, 10);

    const campusBaselineWater = CAMPUS_DAILY_WATER_BASELINE + Math.round(Math.sin(d * 1.5) * 8000);
    let campusActualTreated = campusBaselineWater;
    let campusLandscapeReuse = Math.round(campusActualTreated * 0.88);
    let stpNotes = "";

    // Injected Fault 3: STP Discharge Surge (Oct 23, cracked joint irrigation leak)
    if (dayOfMonth === 23) {
      campusLandscapeReuse = 352000;
      stpNotes = "Central green lawn irrigation mainline pressure drop detected; continuous unmetered leakage.";
    }

    // Campus-level STP record
    waterDailyReadings.push({
      id: `wtr-STP-${timestamp.getTime()}`,
      blockId: "STP",
      facilityId: "STP",
      facilityName: "Sewage Treatment Plant & Utilities",
      meterId: "FLOW-STP-TREATED-02",
      resourceType: "water",
      source: "SYNTHETIC_CALIBRATED",
      sourceTag: "STP Flow Transmitter & Irrigation SCADA Simulator",
      dataClassification: "SYNTHETIC_CALIBRATED",
      date: dateStr,
      dateFormatted,
      baselineTreatmentLitres: campusBaselineWater,
      actualTreatedLitres: campusActualTreated,
      landscapeReuseLitres: campusLandscapeReuse,
      reuseRatioPct: Math.min(100, Math.round((campusLandscapeReuse / campusActualTreated) * 100)),
      freshWaterAvoidedLitres: campusLandscapeReuse,
      publishedCampusReferenceLitres: 300000,
      notes: stpNotes || "Normal cyclic SBR wastewater treatment and recycled turf irrigation."
    });

    // Generate block-wise water consumption for all blocks
    BLOCKS_CONFIG.forEach((block) => {
      if (block.id === "STP") return; // Handled above
      const share = BLOCK_WATER_SHARES[block.id] || (1 / BLOCKS_CONFIG.length);
      const baseLitres = Math.round(campusBaselineWater * share);
      let actualLitres = baseLitres * (1 + Math.sin(d * 2.1 + block.builtUpAreaSqm) * 0.04);
      let blockWaterNotes = "";

      // Injected Fault 5: Hostel G water leak signature (Oct 25-26)
      if (block.id === "HOSTEL_G" && (dayOfMonth === 25 || dayOfMonth === 26)) {
        actualLitres = Math.round(baseLitres * 1.38);
        blockWaterNotes = "Overnight continuous flow signature on Level 3 domestic supply lines (float valve failure).";
      }

      waterDailyReadings.push({
        id: `wtr-${block.id}-${timestamp.getTime()}`,
        blockId: block.id,
        facilityId: block.id,
        facilityName: block.name,
        meterId: `MTR-${block.id}-WTR-01`,
        resourceType: "water",
        source: "SYNTHETIC_CALIBRATED",
        sourceTag: "Sub-metered Block Hydro Flow Sensor",
        dataClassification: "SYNTHETIC_CALIBRATED",
        date: dateStr,
        dateFormatted,
        baselineTreatmentLitres: baseLitres,
        actualTreatedLitres: Math.round(actualLitres),
        landscapeReuseLitres: Math.round(actualLitres * 0.88),
        reuseRatioPct: 88,
        freshWaterAvoidedLitres: Math.round(actualLitres * 0.88),
        publishedCampusReferenceLitres: baseLitres,
        notes: blockWaterNotes || undefined
      });
    });

    // ─── 3. Generate Daily Food Waste Telemetry (Past 14 Days) ────────────────
    const baselineFoodWasteKg = 135 + Math.round(Math.sin(d * 2.2) * 10);
    let actualFoodWasteKg = baselineFoodWasteKg;
    let dryRecyclableKg = 85 + Math.round(Math.cos(d * 1.8) * 8);
    let plasticRecycledKg = 42 + Math.round(Math.sin(d * 3.1) * 5);
    let vermicompostedKg = Math.round(actualFoodWasteKg * 0.92);
    let wasteNotes = "";

    // Injected Fault 4: Food Court Event Surplus Spoilage (Oct 22, Cultural Fest Prep)
    if (dayOfMonth === 22) {
      actualFoodWasteKg = 238; // > 200 kg spike
      vermicompostedKg = 150;
      wasteNotes = "Post-event dining surge and unmonitored buffet over-preparation exceeded vermicomposting pit batch capacity.";
    }

    const totalDivertedKg = vermicompostedKg + dryRecyclableKg + plasticRecycledKg;
    const diversionRatePct = Math.round((totalDivertedKg / (actualFoodWasteKg + dryRecyclableKg + plasticRecycledKg)) * 100);

    wasteDailyReadings.push({
      id: `wst-FOOD-${timestamp.getTime()}`,
      blockId: "FOOD",
      facilityId: "FOOD",
      facilityName: "Central Food Court & Student Mess",
      meterId: "SCALE-WASTE-01",
      resourceType: "waste",
      source: "SYNTHETIC_CALIBRATED",
      sourceTag: "Cafeteria Digital Platform Scale & Compost Log",
      dataClassification: "SYNTHETIC_CALIBRATED",
      date: dateStr,
      dateFormatted,
      baselineFoodWasteKg,
      actualFoodWasteKg,
      dryRecyclableKg,
      plasticRecycledKg,
      vermicompostedKg,
      divertedFromLandfillKg: totalDivertedKg,
      diversionRatePct,
      publishedReferenceRange: "120 - 150 kg/day",
      notes: wasteNotes || "Daily segregated collection with active vermicomposting application to campus gardens."
    });
  }

  return {
    electricityReadings,
    solarHourlyReadings,
    waterDailyReadings,
    wasteDailyReadings
  };
}
