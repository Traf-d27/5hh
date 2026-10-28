import { PRESIDENCY_CAMPUS_META } from "../data/presidencyCampus.js";

/**
 * Actionable Recommendation Engine inspired by KlimaTwin's sustainability nudge workflow
 * Covers Solar, Electricity, Water and Waste with IPMVP M&V Protocols and CEA Carbon Accounting
 */
export function generatePresidencyRecommendations(anomalies = [], tariffs = {}) {
  const electricityTariff = tariffs.electricityTariffInr || PRESIDENCY_CAMPUS_META.commercialTariffInrPerKwh;
  const waterTariff = tariffs.waterTariffInr || PRESIDENCY_CAMPUS_META.waterTariffInrPerKl;
  const wasteCost = tariffs.wasteCostInr || PRESIDENCY_CAMPUS_META.wasteDisposalCostInrPerKg;
  const gridCo2Factor = PRESIDENCY_CAMPUS_META.gridEmissionFactorKgCo2ePerKwh;

  const baseRecommendations = [
    {
      id: "REC-SOLAR-01",
      resourceType: "Solar",
      facilityId: "bldg-admin",
      facilityName: "Central Administration & Chancellery Building",
      title: "Rooftop Solar PV Bi-Weekly De-Soiling & String Health Audit",
      category: "Renewable Generation Optimization",
      priority: "High",
      confidence: "Empirical Sensor-Backed (94% Confidence)",
      identifiedInefficiency: "Observed 38% generation drop on 220 kWp Central Admin rooftop array during peak sun hours (falling from expected 800 kWh/day down to ~490 kWh/day).",
      supportingEvidence: "Pyranometer solar insolation was >780 W/m² while inverter DC/AC conversion efficiency dropped to 61% with uniform string voltage suppression.",
      recommendedIntervention: "Execute specialized demineralized water spray cleaning on the 220 kWp module array; inspect DC isolators and combiner box string fuses for localized tripping before concluding cell degradation.",
      suggestedReductionTargetPct: 35, // Recover 35% lost generation
      estimatedMonthlyResourceSavings: 4800, // +4,800 kWh/month recovered
      resourceUnit: "kWh",
      capexInr: 12000, // Cleaning kit and safety rig
      assumptions: [
        "220 kWp array rated for ~800 kWh/day generation in clear Bengaluru conditions.",
        "Soiling derate factor recovers from 0.62 to 0.96 post-cleaning.",
        `Commercial HT electricity tariff calculated at ₹${electricityTariff.toFixed(2)}/kWh.`,
        `Avoided grid power emission factor: ${gridCo2Factor} kg CO2e/kWh (CEA India Baseline Database).`
      ],
      correctiveActions: [
        "Schedule early morning (06:00 - 07:30) cleaning cycle to avoid thermal shock micro-cracks on hot solar glass.",
        "Perform thermal imaging inspection on string inverter MPPT trackers 1 and 2.",
        "Verify junction box surge protection devices (SPDs) and earth continuity."
      ],
      verificationMethod: "IPMVP Option B: Compare weather-normalized daily kWh yield 7 days post-cleaning against the pre-cleaning baseline. Target: daily generation >= 750 kWh on days with insolation > 4.5 kWh/m²."
    },
    {
      id: "REC-SOLAR-02",
      resourceType: "Solar",
      facilityId: "bldg-admin",
      facilityName: "Central Administration & School of Engineering",
      title: "Midday Solar Load-Shifting: Heavy Lab & STP Pump Interlock",
      category: "Solar Self-Consumption & Peak Shaving",
      priority: "High",
      confidence: "Demand-Supply Correlation (91% Confidence)",
      identifiedInefficiency: "Central Admin solar array produces peak surplus (11:00-14:00) while Engineering heavy labs and STP batch pumping run late afternoon (16:00-18:00) on expensive grid power.",
      supportingEvidence: "Telemetry demonstrates 65 kW of midday solar exported/curtailed while grid draw at 16:30 peaks at 310 kW during peak tariff window.",
      recommendedIntervention: "Evaluate shifting flexible campus electrical loads (STP treated water transfer pumps, mechanical lab CNC batch cuts, and chilled water pre-cooling) into the 11:30 - 13:30 solar generation crest.",
      suggestedReductionTargetPct: 28,
      estimatedMonthlyResourceSavings: 3600,
      resourceUnit: "kWh",
      capexInr: 15000, // Smart relay timers & SOP training
      assumptions: [
        "STP transfer pumps draw ~28 kW and can be flexibly scheduled during solar peak.",
        "Increases solar self-consumption ratio from 68% to 92%.",
        `Avoided peak grid power tariff at ₹${electricityTariff.toFixed(2)}/kWh.`
      ],
      correctiveActions: [
        "Automate STP treated water pumping cycle start at 11:30 AM via SCADA timer.",
        "Stagger Engineering workshop practical sessions to utilize solar surplus hours.",
        "Pre-cool main auditorium and library reading halls between 12:00 and 13:30."
      ],
      verificationMethod: "Meter panel correlation: Measure solar self-consumption ratio. Target: >= 90% direct solar absorption with zero grid export curtailment."
    },
    {
      id: "REC-WATER-03",
      resourceType: "Water",
      facilityId: "bldg-stp",
      facilityName: "Campus Sewage Treatment Plant (STP) & Green Lawns",
      title: "Central Lawn Irrigation Lateral Pressure Isolation & Leak Sealing",
      category: "Wastewater Reuse Conservation",
      priority: "High",
      confidence: "Mass Balance & Hydraulic Flow Telemetry (96% Confidence)",
      identifiedInefficiency: "Landscape irrigation flow surged to 352,000 Litres/day (+30% above 270,000 L baseline), indicating a cracked underground PVC distribution line.",
      supportingEvidence: "Pressure transmitter PT-03 dropped from 3.8 bar to 1.9 bar with continuous flow sustained even when sprinkler zones were cycled off.",
      recommendedIntervention: "Conduct acoustic underground pipe leak detection along the Central Green Lawn sector; excavate and replace fractured 90mm schedule-40 PVC irrigation manifold and fit motorized isolation zone valves.",
      suggestedReductionTargetPct: 82, // Eliminate 82,000 Litres/day wastage
      estimatedMonthlyResourceSavings: 1850000, // 1,850 kL / month
      resourceUnit: "Litres",
      capexInr: 22000, // Pipe replacement & trenching
      assumptions: [
        "Eliminates 75,000 to 85,000 Litres/day of subterranean leakage.",
        "Preserves campus STP treated water reservoir for full 64-acre landscape coverage.",
        `Avoided auxiliary borewell pumping cost calculated at ₹${waterTariff.toFixed(2)}/kL.`
      ],
      correctiveActions: [
        "Isolate Turf Zone C manifold valve immediately to prevent subsoil saturation.",
        "Replace cracked 90mm PVC joint with high-density polyethylene (HDPE) flexible coupler.",
        "Install digital pulsed water flow meter with automatic low-pressure cutoff."
      ],
      verificationMethod: "IPMVP Option B: Static pressure hold test at 3.5 bar for 60 minutes with zero flow on FLOW-IRRIGATION-03 when sprinkler nozzles are closed."
    },
    {
      id: "REC-WASTE-04",
      resourceType: "Waste",
      facilityId: "bldg-foodcourt",
      facilityName: "Central Food Court, Dining Commons & Cafeteria",
      title: "Cafeteria Food Waste Production Weigh-Back Audit & Compost Expansion",
      category: "Circular Resource & Methane Avoidance",
      priority: "Medium",
      confidence: "Weigh-Scale Records (89% Confidence)",
      identifiedInefficiency: "Cafeteria food waste surged to 238 kg/day, exceeding the published campus reference benchmark (120-150 kg/day) and overwhelming on-site vermicomposting pits.",
      supportingEvidence: "Kitchen plate-waste log recorded 98 kg of post-consumer buffet rice/curry discard following uncoordinated cultural fest dinner catering.",
      recommendedIntervention: "Implement a digital weigh-back waste audit station at tray returns; transition from fixed-portion dishing to demand-based serving; expand vermicomposting pit capacity by 2 additional concrete bins with dry foliage layering.",
      suggestedReductionTargetPct: 40,
      estimatedMonthlyResourceSavings: 2400, // 2,400 kg/month waste avoided
      resourceUnit: "kg",
      capexInr: 18000, // 2x Vermicompost pit masonry + digital scale
      assumptions: [
        "Reduces average daily food waste from 210 kg back into the 120-135 kg reference window.",
        "Avoids landfill tipping and hauling expenses at ₹4.50/kg.",
        "Diverted organic waste yields ~600 kg/month of high-grade vermicompost fertilizer for Presidency campus horticulture, offsetting commercial chemical fertilizer purchases.",
        "Methane avoidance factor: 1.9 kg CO2e per kg food waste diverted from anaerobic landfill decomposition."
      ],
      correctiveActions: [
        "Deploy daily digital scale logging with separate bins for preparation waste vs customer plate leftovers.",
        "Introduce student awareness nudges ('Clean Plate Initiative') with real-time daily waste scoreboards at dining exits.",
        "Mix shredded campus dry foliage with kitchen wet scraps at 1:1 carbon-to-nitrogen ratio in vermiculture beds."
      ],
      verificationMethod: "Daily scale logs across 14 consecutive dining days. Success criteria: 7-day rolling average food waste stabilizes strictly below 140 kg/day with 100% organic diversion to vermicomposting."
    }
  ];

  // Dynamically calculate financial returns and carbon savings based on active tariffs
  return baseRecommendations.map((rec) => {
    let monthlyInrSavings = 0;
    let monthlyCo2eAvoidedKg = 0;

    if (rec.resourceType === "Solar" || rec.resourceType === "Electricity") {
      monthlyInrSavings = Math.round(rec.estimatedMonthlyResourceSavings * electricityTariff);
      monthlyCo2eAvoidedKg = Math.round(rec.estimatedMonthlyResourceSavings * gridCo2Factor * 10) / 10;
    } else if (rec.resourceType === "Water") {
      const kLSaved = rec.estimatedMonthlyResourceSavings / 1000;
      monthlyInrSavings = Math.round(kLSaved * waterTariff);
      monthlyCo2eAvoidedKg = Math.round(kLSaved * 0.45); // Pumping electricity reduction
    } else if (rec.resourceType === "Waste") {
      monthlyInrSavings = Math.round(rec.estimatedMonthlyResourceSavings * wasteCost);
      monthlyCo2eAvoidedKg = Math.round(rec.estimatedMonthlyResourceSavings * 1.9 * 10) / 10;
    }

    const annualInrSavings = monthlyInrSavings * 12;
    const paybackPeriodMonths = Math.round((rec.capexInr / (monthlyInrSavings || 1)) * 10) / 10;

    return {
      ...rec,
      tariffUsedInr: electricityTariff,
      waterTariffUsedInr: waterTariff,
      wasteCostUsedInr: wasteCost,
      estimatedMonthlyInr: monthlyInrSavings,
      estimatedAnnualInr: annualInrSavings,
      monthlyCo2eAvoidedKg,
      annualCo2eAvoidedTons: Math.round((monthlyCo2eAvoidedKg * 12 / 1000) * 10) / 10,
      paybackPeriodMonths
    };
  });
}
