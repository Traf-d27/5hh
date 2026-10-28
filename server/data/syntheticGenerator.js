import { CAMPUS_FACILITIES, PRESIDENCY_CAMPUS_META } from "./presidencyCampus.js";

/**
 * Multi-Resource Synthetic Telemetry Generator for Presidency University
 * Calibrated against published campus references:
 * - Solar: ~800 kWh/day on Central Admin Building
 * - Water STP: ~300,000 Litres/day treated & reused for landscape irrigation
 * - Waste: 120-150 kg/day food waste vermicomposted for organic horticulture
 */
export function generatePresidencyCampusTelemetry(daysBack = 14) {
  const electricityReadings = [];
  const solarHourlyReadings = [];
  const waterDailyReadings = [];
  const wasteDailyReadings = [];

  const now = new Date("2026-10-28T10:00:00+05:30");
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // 1. Generate Hourly Electricity & Solar Telemetry
  const totalHours = daysBack * 24;

  for (let h = totalHours; h >= 0; h--) {
    const timestamp = new Date(now.getTime() - h * 60 * 60 * 1000);
    const hour = timestamp.getHours();
    const dayOfWeek = timestamp.getDay();
    const dayStr = dayNames[dayOfWeek];
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isoString = timestamp.toISOString();
    const dateFormatted = timestamp.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
    const dayOfMonth = timestamp.getDate();

    // Weather simulation (Bengaluru weather in late October: largely clear with occasional partly cloudy afternoon)
    let weatherCondition = "Clear Sky";
    let cloudFactor = 1.0;
    if (dayOfMonth === 21 || dayOfMonth === 22) {
      weatherCondition = "Partly Cloudy";
      cloudFactor = 0.78;
    } else if (dayOfMonth === 27) {
      weatherCondition = "Monsoon Overcast & Rain";
      cloudFactor = 0.45;
    }

    // Solar generation model for Central Administration 220 kWp array
    // Sun hours: 06:00 to 18:00, peak irradiance around 12:00 - 13:00
    let expectedSolarKw = 0;
    let actualSolarKw = 0;
    let solarNotes = "";

    if (hour >= 6 && hour <= 18) {
      // Bell curve solar insolation: normalized 0 to 1
      const solarAngle = Math.sin(((hour - 6) / 12) * Math.PI);
      // Peak array production around 165 kW on 220 kWp DC rating (accounting for inverter PR = 75-80%)
      expectedSolarKw = Math.round(165 * Math.pow(solarAngle, 1.5) * 10) / 10;
      actualSolarKw = Math.round(expectedSolarKw * cloudFactor * 10) / 10;

      // Inefficiency 1: Soiling & Construction Dust Degradation (Admin rooftop array, Oct 24-26)
      if (dayOfMonth >= 24 && dayOfMonth <= 26) {
        actualSolarKw = Math.round(actualSolarKw * 0.62 * 10) / 10; // -38% output due to dust/soiling
        solarNotes = "Rooftop PV array experiencing heavy dust/soiling accumulation from adjacent lawn civil works.";
      }
    }

    if (expectedSolarKw > 0 || actualSolarKw > 0) {
      solarHourlyReadings.push({
        id: `sol-${timestamp.getTime()}`,
        facilityId: "bldg-admin",
        facilityName: "Central Administration & Chancellery Building",
        meterId: "MTR-ADMIN-SOLAR-01",
        timestamp: isoString,
        dateFormatted,
        hour,
        weatherCondition,
        expectedSolarKw,
        actualSolarKw,
        expectedSolarKwh: expectedSolarKw, // 1 hour integration
        actualSolarKwh: actualSolarKw,
        generationDeltaKwh: Math.round((actualSolarKw - expectedSolarKw) * 10) / 10,
        generationDeltaPct: expectedSolarKw > 0 ? Math.round(((actualSolarKw - expectedSolarKw) / expectedSolarKw) * 100) : 0,
        dataClassification: "SYNTHETIC_DEMO",
        sourceTag: "Calibrated Rooftop Solar PV Model (220 kWp Array)",
        publishedCampusBenchmarkKwh: 800, // Daily reference note
        notes: solarNotes || undefined
      });
    }

    // Generate building electricity demand
    CAMPUS_FACILITIES.forEach((bldg) => {
      const isOpenDay = bldg.operatingHours.days.includes(dayStr);
      const [openHour] = bldg.operatingHours.open.split(":").map(Number);
      const [closeHour] = bldg.operatingHours.close.split(":").map(Number);
      const isOperatingHours = isOpenDay && hour >= openHour && hour < closeHour;

      let expectedDemandKwh = 0;
      let actualDemandKwh = 0;
      let demandNotes = "";

      if (bldg.id === "bldg-hostels") {
        let factor = 0.35;
        if (hour >= 7 && hour <= 9) factor = 0.88;
        else if (hour >= 18 && hour <= 23) factor = 0.96;
        else if (hour >= 1 && hour <= 5) factor = 0.24;
        expectedDemandKwh = bldg.baseLoadKwh + (bldg.peakLoadKwh - bldg.baseLoadKwh) * factor;
      } else if (bldg.id === "bldg-stp") {
        // Continuous aeration blower baseload + batch pumping at 10:00 and 16:00
        const isPumpingCycle = hour === 10 || hour === 11 || hour === 16 || hour === 17;
        expectedDemandKwh = isPumpingCycle ? bldg.peakLoadKwh : bldg.baseLoadKwh;
      } else if (isOperatingHours) {
        const midPoint = (openHour + closeHour) / 2;
        const normalizedDist = Math.abs(hour - midPoint) / ((closeHour - openHour) / 2);
        const curveFactor = Math.max(0.25, 1 - Math.pow(normalizedDist, 2) * 0.65);
        expectedDemandKwh = bldg.baseLoadKwh + (bldg.peakLoadKwh - bldg.baseLoadKwh) * curveFactor;
      } else {
        expectedDemandKwh = bldg.baseLoadKwh * (isWeekend ? 0.88 : 1.05);
      }

      // Add mild noise
      actualDemandKwh = expectedDemandKwh * (1 + Math.sin(h * 2.8 + bldg.areaSqMeters) * 0.035);

      // Inefficiency 2: School of Engineering - Chiller Short-Cycling (Oct 26, 13:00-17:00)
      if (bldg.id === "bldg-eng" && dayOfMonth === 26 && hour >= 13 && hour <= 17) {
        actualDemandKwh = expectedDemandKwh * 1.48;
        demandNotes = "Chiller compressor sequencing fault causing simultaneous secondary compressor staging.";
      }

      // Inefficiency 3: Admin Building - Weekend Split AC Overrun (Oct 24-25)
      if (bldg.id === "bldg-admin" && (dayOfMonth === 24 || dayOfMonth === 25)) {
        actualDemandKwh = expectedDemandKwh * 3.4;
        demandNotes = "Chancellery boardroom split-AC units left operational continuously across weekend closure.";
      }

      const solarContributionKwh = bldg.id === "bldg-admin" ? Math.min(actualDemandKwh, actualSolarKw) : 0;
      const gridImportKwh = Math.max(0, actualDemandKwh - solarContributionKwh);

      electricityReadings.push({
        id: `el-${bldg.id}-${timestamp.getTime()}`,
        facilityId: bldg.id,
        facilityName: bldg.name,
        meterId: bldg.activeMeters[0],
        timestamp: isoString,
        dateFormatted,
        hour,
        kwh: Math.round(actualDemandKwh * 10) / 10,
        baselineKwh: Math.round(expectedDemandKwh * 10) / 10,
        solarContributionKwh: Math.round(solarContributionKwh * 10) / 10,
        gridImportKwh: Math.round(gridImportKwh * 10) / 10,
        isOperatingHours,
        dataClassification: "SYNTHETIC_DEMO",
        sourceTag: "Campus Power Substation Calibrated Profile",
        notes: demandNotes || undefined
      });
    });
  }

  // 2. Generate Daily Water & STP Telemetry (Past 14 Days)
  for (let d = daysBack; d >= 0; d--) {
    const timestamp = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    const dateFormatted = timestamp.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
    const dayOfMonth = timestamp.getDate();

    // Published reference: ~300,000 Litres/day
    const baselineTreatmentLitres = 295000 + Math.round((Math.sin(d * 1.5) * 8000));
    let actualTreatedLitres = baselineTreatmentLitres;
    let landscapeReuseLitres = Math.round(actualTreatedLitres * 0.88); // 88% recycled to landscape
    let freshWaterIntakeLitres = 120000;
    let waterNotes = "";

    // Inefficiency 4: STP Irrigation Mainline Joint Leak (Oct 24-26)
    // Excessive water drawn for irrigation due to cracked subterranean PVC valve
    if (dayOfMonth >= 24 && dayOfMonth <= 26) {
      landscapeReuseLitres = 352000; // Exceeds treated reservoir capacity!
      waterNotes = "Central Green Lawn irrigation line pressure drop detected. Continuous flow indicated cracked pipe joint.";
    }

    waterDailyReadings.push({
      id: `wtr-${timestamp.getTime()}`,
      date: timestamp.toISOString().slice(0, 10),
      dateFormatted,
      facilityId: "bldg-stp",
      facilityName: "Campus Sewage Treatment Plant (STP) & Green Lawns",
      meterId: "FLOW-STP-TREATED-02",
      baselineTreatmentLitres,
      actualTreatedLitres,
      landscapeReuseLitres,
      reuseRatioPct: Math.min(100, Math.round((landscapeReuseLitres / actualTreatedLitres) * 100)),
      freshWaterAvoidedLitres: landscapeReuseLitres,
      publishedCampusReferenceLitres: 300000,
      dataClassification: "SYNTHETIC_DEMO",
      sourceTag: "STP Flow Transmitter & Irrigation SCADA Simulator",
      notes: waterNotes || "Normal cyclic SBR wastewater treatment and recycled turf irrigation."
    });

    // 3. Generate Daily Cafeteria Waste Telemetry (Past 14 Days)
    // Published reference: 120 - 150 kg/day food waste
    const baselineFoodWasteKg = 135 + Math.round(Math.sin(d * 2.2) * 10); // Center around ~135 kg
    let actualFoodWasteKg = baselineFoodWasteKg;
    let dryRecyclableKg = 85 + Math.round(Math.cos(d * 1.8) * 8);
    let plasticRecycledKg = 42 + Math.round(Math.sin(d * 3.1) * 5);
    let vermicompostedKg = Math.round(actualFoodWasteKg * 0.92); // 92% into vermicompost pits
    let wasteNotes = "";

    // Inefficiency 5: Food Court Event Surplus Spoilage (Oct 23, Cultural Fest Prep)
    if (dayOfMonth === 23) {
      actualFoodWasteKg = 238; // +76% spike above 135 kg baseline
      vermicompostedKg = 150; // Pit capacity maxed out, 88 kg overflowed to municipal stream
      wasteNotes = "Post-event dining surge and unmonitored buffet over-preparation exceeded vermicomposting pit batch capacity.";
    }

    const totalDivertedKg = vermicompostedKg + dryRecyclableKg + plasticRecycledKg;
    const diversionRatePct = Math.round((totalDivertedKg / (actualFoodWasteKg + dryRecyclableKg + plasticRecycledKg)) * 100);

    wasteDailyReadings.push({
      id: `wst-${timestamp.getTime()}`,
      date: timestamp.toISOString().slice(0, 10),
      dateFormatted,
      facilityId: "bldg-foodcourt",
      facilityName: "Central Food Court, Dining Commons & Cafeteria",
      meterId: "SCALE-WASTE-01",
      baselineFoodWasteKg,
      actualFoodWasteKg,
      dryRecyclableKg,
      plasticRecycledKg,
      vermicompostedKg,
      divertedFromLandfillKg: totalDivertedKg,
      diversionRatePct,
      publishedReferenceRange: "120 - 150 kg/day",
      dataClassification: "SYNTHETIC_DEMO",
      sourceTag: "Cafeteria Digital Platform Scale & Compost Log",
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
