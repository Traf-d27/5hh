import { PRESIDENCY_CAMPUS_META, CAMPUS_FACILITIES } from "../data/presidencyCampus.js";

/**
 * Multi-Resource Anomaly Detection Engine for Presidency University
 * Identifies Solar Underperformance, Electricity Spikes, Water STP Leaks, and Food Waste Surges
 */
export function detectAllCampusInefficiencies(telemetry, tariffs = {}) {
  const anomalies = [];
  const electricityTariff = tariffs.electricityTariffInr || PRESIDENCY_CAMPUS_META.commercialTariffInrPerKwh;
  const waterTariff = tariffs.waterTariffInr || PRESIDENCY_CAMPUS_META.waterTariffInrPerKl;
  const wasteCost = tariffs.wasteCostInr || PRESIDENCY_CAMPUS_META.wasteDisposalCostInrPerKg;
  const gridCo2Factor = PRESIDENCY_CAMPUS_META.gridEmissionFactorKgCo2ePerKwh;

  const { electricityReadings = [], solarHourlyReadings = [], waterDailyReadings = [], wasteDailyReadings = [] } = telemetry;

  // 1. Solar Anomaly Detection
  // Group solar readings by day to identify sustained degradation
  const solarDayBuckets = {};
  solarHourlyReadings.forEach((r) => {
    if (!solarDayBuckets[r.dateFormatted]) solarDayBuckets[r.dateFormatted] = [];
    solarDayBuckets[r.dateFormatted].push(r);
  });

  Object.entries(solarDayBuckets).forEach(([dateStr, hours]) => {
    const totalActualKwh = Math.round(hours.reduce((s, h) => s + h.actualSolarKwh, 0));
    const totalExpectedKwh = Math.round(hours.reduce((s, h) => s + h.expectedSolarKwh, 0));
    const deltaKwh = totalExpectedKwh - totalActualKwh;
    const deltaPct = totalExpectedKwh > 0 ? Math.round((deltaKwh / totalExpectedKwh) * 100) : 0;

    // If generation is significantly below expected on a clear day (> 25% shortfall)
    if (deltaPct >= 25 && deltaKwh >= 150) {
      const lostInr = Math.round(deltaKwh * electricityTariff);
      const co2eLostKg = Math.round(deltaKwh * gridCo2Factor * 10) / 10;

      anomalies.push({
        id: `anom-solar-${dateStr.replace(/\//g, "-")}`,
        resourceType: "Solar",
        facilityId: "bldg-admin",
        facilityName: "Central Administration & Chancellery Building",
        meterId: "MTR-ADMIN-SOLAR-01",
        timestamp: `${dateStr} Peak Sun Window (10:00 - 16:00)`,
        dateFormatted: dateStr,
        observedValue: totalActualKwh,
        baselineValue: totalExpectedKwh,
        unit: "kWh/day",
        absoluteDeviation: -deltaKwh,
        percentageDeviation: -deltaPct,
        severity: deltaPct >= 35 ? "High" : "Medium",
        type: "SOLAR_SOILING_DEGRADATION",
        reason: `Rooftop 220 kWp solar PV output was ${totalActualKwh} kWh, falling ${deltaPct}% (-${deltaKwh} kWh) below expected clear-sky insolation model (${totalExpectedKwh} kWh). Likely attributable to surface dust/soiling accumulation or string fuse trip rather than intrinsic panel defect.`,
        recommendedActionKey: "REC-SOLAR-SOILING",
        potentialResourceSavings: deltaKwh,
        potentialInrSavings: lostInr,
        co2eAvoidedKg: co2eLostKg,
        disclaimer: "Flagged by weather-adjusted statistical deviation filter. Recommended for physical array inspection before concluding hardware failure."
      });
    }
  });

  // 2. Electricity Anomaly Detection (spikes, weekend AC, chiller short-cycling)
  const facilityMap = new Map(CAMPUS_FACILITIES.map(f => [f.id, f]));
  electricityReadings.forEach((r) => {
    const facility = facilityMap.get(r.facilityId);
    if (!facility) return;

    const observed = Number(r.kwh);
    const baseline = Number(r.baselineKwh);
    const deviationKwh = Math.round((observed - baseline) * 10) / 10;
    const deviationPct = baseline > 0 ? Math.round(((observed - baseline) / baseline) * 100) : 0;

    if (deviationKwh >= 12 && deviationPct >= 30) {
      const timestamp = new Date(r.timestamp);
      const isWeekend = timestamp.getDay() === 0 || timestamp.getDay() === 6;

      let type = null;
      let severity = "Low";
      let reason = "";
      let actionKey = "";

      if (!r.isOperatingHours && facility.id !== "bldg-hostels") {
        if (isWeekend && deviationPct >= 100) {
          type = "WEEKEND_AC_OVERRUN";
          severity = "High";
          reason = `Chancellery building is officially closed for the weekend, but power draw registered ${observed} kWh vs idle standby baseline of ${baseline} kWh (+${deviationPct}%). Indicates boardroom split-AC units or zonal AHU may have been left energized.`;
          actionKey = "REC-ADMIN-SETBACK";
        } else if (deviationPct >= 120) {
          type = "AFTER_HOURS_OVERCONSUMPTION";
          severity = deviationPct >= 200 ? "High" : "Medium";
          reason = `After-hours consumption of ${observed} kWh at ${r.hour}:00 exceeds closed baseline (${baseline} kWh) by +${deviationPct}%. Potential lighting or ventilation un-decommissioned overnight.`;
          actionKey = "REC-NIGHT-AUDIT";
        }
      } else if (r.isOperatingHours && deviationPct >= 40 && deviationKwh >= 40) {
        type = "CHILLER_PEAK_SPIKE";
        severity = "High";
        reason = `Demand peaked at ${observed} kWh during lab operations (+${deviationPct}% over baseline ${baseline} kWh). Indicates simultaneous chiller staging and heavy electrical machines overlapping during peak tariff hours.`;
        actionKey = "REC-CHILLER-STAGING";
      }

      if (type) {
        const potentialSavingsKwh = deviationKwh;
        const potentialInr = Math.round(potentialSavingsKwh * electricityTariff);
        const co2eKg = Math.round(potentialSavingsKwh * gridCo2Factor * 10) / 10;

        anomalies.push({
          id: `anom-el-${r.id}`,
          resourceType: "Electricity",
          facilityId: facility.id,
          facilityName: facility.name,
          meterId: r.meterId,
          timestamp: r.timestamp,
          dateFormatted: r.dateFormatted,
          observedValue: observed,
          baselineValue: baseline,
          unit: "kWh/hr",
          absoluteDeviation: deviationKwh,
          percentageDeviation: deviationPct,
          severity,
          type,
          reason,
          recommendedActionKey: actionKey,
          potentialResourceSavings: potentialSavingsKwh,
          potentialInrSavings: potentialInr,
          co2eAvoidedKg: co2eKg,
          disclaimer: "Statistical baseline deviation. Recommended for facility inspection before confirming equipment maintenance."
        });
      }
    }
  });

  // 3. Water Anomaly Detection (Irrigation pipe leakage & abnormal consumption)
  waterDailyReadings.forEach((r) => {
    // Flag if landscape irrigation draws more than 110% of treated wastewater volume or exceeds 330,000 L
    if (r.landscapeReuseLitres >= 330000 || r.landscapeReuseLitres > r.actualTreatedLitres * 1.15) {
      const excessLitres = r.landscapeReuseLitres - 270000;
      const excessKl = Math.round(excessLitres / 1000);
      const potentialInr = Math.round(excessKl * waterTariff);

      anomalies.push({
        id: `anom-wtr-${r.id}`,
        resourceType: "Water",
        facilityId: "bldg-stp",
        facilityName: "Campus Sewage Treatment Plant (STP) & Green Lawns",
        meterId: r.meterId,
        timestamp: `${r.dateFormatted} (24-hr Flow Integration)`,
        dateFormatted: r.dateFormatted,
        observedValue: r.landscapeReuseLitres,
        baselineValue: 270000,
        unit: "Litres/day",
        absoluteDeviation: excessLitres,
        percentageDeviation: Math.round(((r.landscapeReuseLitres - 270000) / 270000) * 100),
        severity: "High",
        type: "IRRIGATION_PIPE_LEAK",
        reason: `Landscape irrigation flow logged ${r.landscapeReuseLitres.toLocaleString()} Litres, exceeding the safe treated water allocation baseline (270,000 L) by +${Math.round(((r.landscapeReuseLitres - 270000) / 270000) * 100)}%. Indicates suspected subterranean pipe rupture or stuck solenoid valve on Central Green Lawns.`,
        recommendedActionKey: "REC-WATER-LEAK",
        potentialResourceSavings: excessLitres,
        potentialInrSavings: potentialInr,
        co2eAvoidedKg: Math.round(excessKl * 0.45), // Pumping energy emission factor
        disclaimer: "Flow transmitter rate surge. Requires physical isolation test on turf lateral valves."
      });
    }
  });

  // 4. Waste Anomaly Detection (Cafeteria food waste surge exceeding 150 kg reference)
  wasteDailyReadings.forEach((r) => {
    // Published reference range: 120 - 150 kg/day. Flag if > 170 kg
    if (r.actualFoodWasteKg >= 170) {
      const excessKg = r.actualFoodWasteKg - 135;
      const potentialInr = Math.round(excessKg * wasteCost);
      // Avoided methane emissions: ~1.9 kg CO2e per kg food waste in landfill
      const co2eKg = Math.round(excessKg * 1.9 * 10) / 10;

      anomalies.push({
        id: `anom-wst-${r.id}`,
        resourceType: "Waste",
        facilityId: "bldg-foodcourt",
        facilityName: "Central Food Court, Dining Commons & Cafeteria",
        meterId: r.meterId,
        timestamp: `${r.dateFormatted} Evening Collection Audit`,
        dateFormatted: r.dateFormatted,
        observedValue: r.actualFoodWasteKg,
        baselineValue: 135,
        unit: "kg/day",
        absoluteDeviation: excessKg,
        percentageDeviation: Math.round((excessKg / 135) * 100),
        severity: "High",
        type: "FOOD_WASTE_SURGE",
        reason: `Cafeteria food waste surged to ${r.actualFoodWasteKg} kg, exceeding the published campus reference benchmark (120-150 kg/day) by +${Math.round((excessKg / 135) * 100)}%. Exceeded the daily batch capacity of vermicomposting pits, risking municipal landfill dumping.`,
        recommendedActionKey: "REC-WASTE-AUDIT",
        potentialResourceSavings: excessKg,
        potentialInrSavings: potentialInr,
        co2eAvoidedKg: co2eKg,
        disclaimer: "Mass balance anomaly recorded at weighing station. Recommended for cafeteria production portion audit."
      });
    }
  });

  // Sort descending by severity then date
  const severityScore = { High: 3, Medium: 2, Low: 1 };
  return anomalies.sort((a, b) => {
    const sDiff = severityScore[b.severity] - severityScore[a.severity];
    if (sDiff !== 0) return sDiff;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}
