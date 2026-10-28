import React, { useState, useCallback } from "react";
import {
  Sliders, Play, BarChart2, Zap, Droplets, Trash2,
  AlertTriangle, CheckCircle, Info, RefreshCw, ArrowRight,
  TrendingDown, Leaf, IndianRupee, FlaskConical
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine
} from "recharts";
import { useCampus } from "../context/CampusContext";
import { formatInr } from "../utils/formatters";

// ─── Pre-defined measures matched to campus recommendations ──────────────────
const CAMPUS_MEASURES = [
  {
    id: "SIM-SOLAR-01",
    resourceType: "Solar",
    title: "Rooftop Solar De-Soiling & String Audit",
    category: "Renewable Generation Recovery",
    icon: "solar",
    sourceRec: "REC-SOLAR-01",
    defaultParams: {
      baselineKwhPerDay: 800,
      applicableFraction: 1.0,
      assumedReductionPct: 35,
      analysisDays: 30,
      electricityTariffInr: 8.5,
      co2Factor: 0.716
    },
    reductionSourceLabel: "Illustrative: based on published soiling derate recovery (0.62→0.96 PR)",
    paramLabels: {
      baselineKwhPerDay: "Baseline daily solar generation (kWh/day)",
      applicableFraction: "Fraction of generation affected by soiling",
      assumedReductionPct: "Estimated recovery after cleaning (%)",
      analysisDays: "Analysis period (days)"
    },
    publishedRef: "Published reference: ~800 kWh/day (Central Admin Rooftop, 220 kWp)",
    publishedRefSource: "https://presidencyuniversity.in/renewable--"
  },
  {
    id: "SIM-ELEC-02",
    resourceType: "Electricity",
    title: "Midday Solar Load-Shifting (STP & Labs)",
    category: "Peak Shaving & Self-Consumption",
    icon: "elec",
    sourceRec: "REC-SOLAR-02",
    defaultParams: {
      baselineKwhPerDay: 310,
      applicableFraction: 0.60,
      assumedReductionPct: 28,
      analysisDays: 30,
      electricityTariffInr: 8.5,
      co2Factor: 0.716
    },
    reductionSourceLabel: "Illustrative: estimated grid import reduction from solar load-shifting",
    paramLabels: {
      baselineKwhPerDay: "Engineering block baseline grid import (kWh/day)",
      applicableFraction: "Fraction of load that can be shifted to solar hours",
      assumedReductionPct: "Estimated grid import reduction (%)",
      analysisDays: "Analysis period (days)"
    },
    publishedRef: "No published figure for individual building consumption",
    publishedRefSource: null
  },
  {
    id: "SIM-WATER-03",
    resourceType: "Water",
    title: "Irrigation Leak Detection & Pipe Sealing",
    category: "Wastewater Reuse Conservation",
    icon: "water",
    sourceRec: "REC-WATER-03",
    defaultParams: {
      baselineLitresPerDay: 352000,
      applicableFraction: 1.0,
      assumedReductionPct: 25,
      analysisDays: 30,
      waterTariffInrPerKl: 45
    },
    reductionSourceLabel: "Illustrative: estimated by eliminating excess irrigation draw above 270,000 L/day baseline",
    paramLabels: {
      baselineLitresPerDay: "Observed daily irrigation draw (Litres/day)",
      applicableFraction: "Fraction of flow attributable to leak",
      assumedReductionPct: "Estimated reduction after pipe repair (%)",
      analysisDays: "Analysis period (days)"
    },
    publishedRef: "Published STP design capacity: 300,000 L/day; leaked irrigation: ~352,000 L/day observed",
    publishedRefSource: "https://presidencyuniversity.in/campus-sustainability-practices-"
  },
  {
    id: "SIM-WASTE-04",
    resourceType: "Waste",
    title: "Cafeteria Weigh-Back Audit & Compost Expansion",
    category: "Circular Resource & Methane Avoidance",
    icon: "waste",
    sourceRec: "REC-WASTE-04",
    defaultParams: {
      baselineKgPerDay: 135,
      applicableFraction: 1.0,
      assumedReductionPct: 40,
      analysisDays: 30,
      wasteCostInrPerKg: 4.5
    },
    reductionSourceLabel: "Illustrative: target return to 120–135 kg/day reference range",
    paramLabels: {
      baselineKgPerDay: "Baseline daily food waste (kg/day)",
      applicableFraction: "Fraction of waste covered by intervention",
      assumedReductionPct: "Estimated waste reduction (%)",
      analysisDays: "Analysis period (days)"
    },
    publishedRef: "Published reference: 120–150 kg/day food waste from campus cafeterias",
    publishedRefSource: "https://presidencyuniversity.in/circular--"
  }
];

function resourceIcon(type) {
  if (type === "Solar" || type === "Electricity") return <Zap className="w-5 h-5 text-amber-500" />;
  if (type === "Water") return <Droplets className="w-5 h-5 text-blue-500" />;
  return <Trash2 className="w-5 h-5 text-green-500" />;
}

function resourceColor(type) {
  if (type === "Solar" || type === "Electricity") return "amber";
  if (type === "Water") return "blue";
  return "green";
}

const colorClasses = {
  amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-800", bar: "#f59e0b" },
  blue:  { bg: "bg-blue-50",  border: "border-blue-200",  text: "text-blue-700",  badge: "bg-blue-100 text-blue-800",   bar: "#3b82f6" },
  green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", badge: "bg-green-100 text-green-800", bar: "#22c55e" }
};

function SimulatorResult({ result, measure }) {
  if (!result) return null;
  const c = colorClasses[resourceColor(measure.resourceType)];

  // Build chart data
  const isEnergy = result.resourceType === "Solar" || result.resourceType === "Electricity";
  const isWater = result.resourceType === "Water";
  const isWaste = result.resourceType === "Waste";

  let unit, baselineVal, projectedVal, reductionVal;
  if (isEnergy) {
    unit = "kWh";
    baselineVal = result.baseline?.periodKwh;
    projectedVal = result.proposed?.projectedPeriodKwh;
    reductionVal = result.proposed?.periodReductionKwh;
  } else if (isWater) {
    unit = "kL";
    baselineVal = Math.round((result.baseline?.periodLitres || 0) / 1000);
    projectedVal = Math.round(((result.baseline?.periodLitres || 0) - (result.proposed?.periodReductionLitres || 0)) / 1000);
    reductionVal = Math.round((result.proposed?.periodReductionLitres || 0) / 1000);
  } else {
    unit = "kg";
    baselineVal = result.baseline?.periodKg;
    projectedVal = result.baseline?.periodKg - (result.proposed?.periodReductionKg || 0);
    reductionVal = result.proposed?.periodReductionKg;
  }

  const chartData = [
    { scenario: "Baseline", value: baselineVal, fill: "#94a3b8" },
    { scenario: "Projected", value: projectedVal, fill: c.bar }
  ];

  const reductionPct = result.proposed?.assumedReductionPct || 0;
  const savingsInr = result.financialImpact?.estimatedSavingsInr;
  const co2Avoided = result.environmentalImpact?.co2AvoidedKg
    || result.environmentalImpact?.pumpingCo2AvoidedKg
    || result.environmentalImpact?.methaneAvoidedKgCo2e;

  return (
    <div className="space-y-5 mt-6">
      {/* Scenario label */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <p className="text-xs text-amber-800 font-medium">
          <strong>SCENARIO SIMULATION</strong> — This intervention has not been implemented.
          All outputs are projected estimates based on illustrative assumptions, not verified measurements.
        </p>
      </div>

      {/* Side-by-side cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Baseline */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Baseline Scenario</div>
          <div className="text-3xl font-black text-slate-800">
            {baselineVal?.toLocaleString("en-IN")} <span className="text-lg font-normal text-slate-500">{unit}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Over {result.baseline?.periodDays} days</p>
          <div className="mt-3 p-2.5 rounded-lg bg-slate-100 text-xs text-slate-600">
            <strong>Data source:</strong> {result.baseline?.dataSource}
          </div>
        </div>

        {/* Proposed */}
        <div className={`rounded-2xl border p-5 ${c.bg} ${c.border}`}>
          <div className={`text-xs font-bold uppercase tracking-widest mb-3 ${c.text}`}>Proposed Scenario</div>
          <div className={`text-3xl font-black ${c.text}`}>
            {projectedVal?.toLocaleString("en-IN")} <span className="text-lg font-normal opacity-70">{unit}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs text-emerald-700 font-bold">
              -{reductionPct}% • -{reductionVal?.toLocaleString("en-IN")} {unit} reduction
            </span>
          </div>
          <div className={`mt-3 p-2.5 rounded-lg bg-white/60 text-xs ${c.text} font-medium`}>
            {result.proposed?.reductionSourceLabel}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h4 className="text-sm font-bold text-slate-800 mb-4">Before vs After Comparison ({unit})</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barSize={60}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="scenario" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
            <Tooltip formatter={(v) => [`${v?.toLocaleString("en-IN")} ${unit}`, "Consumption"]} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, i) => (
                <rect key={i} fill={entry.fill} />
              ))}
            </Bar>
            <Bar dataKey="value" fill="#dummy" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-[10px] text-slate-400 text-center mt-1">
          Projected reduction: {reductionPct}% ({reductionVal?.toLocaleString("en-IN")} {unit} over {result.baseline?.periodDays} days)
        </p>
      </div>

      {/* Financial & Carbon impact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-emerald-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <IndianRupee className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Financial Impact</span>
          </div>
          {savingsInr != null ? (
            <>
              <div className="text-2xl font-black text-emerald-700">{formatInr(savingsInr)}</div>
              <p className="text-xs text-slate-500 mt-1">{result.financialImpact?.disclaimer || result.financialImpact?.note}</p>
            </>
          ) : (
            <p className="text-xs text-slate-500">{result.financialImpact?.note}</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-teal-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Carbon Avoided</span>
          </div>
          {co2Avoided != null ? (
            <>
              <div className="text-2xl font-black text-teal-700">
                {co2Avoided?.toLocaleString("en-IN")} <span className="text-sm font-normal">kg CO₂e</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Factor: {result.environmentalImpact?.co2FactorKgPerKwh
                  || result.environmentalImpact?.pumpingCo2FactorKgPerKl
                  || result.environmentalImpact?.methaneFactor} kg CO₂e/unit
                {result.environmentalImpact?.co2FactorSource && ` (${result.environmentalImpact.co2FactorSource})`}
                {result.environmentalImpact?.methaneFactorNote && ` — ${result.environmentalImpact.methaneFactorNote}`}
              </p>
            </>
          ) : (
            <p className="text-xs text-slate-500">CO₂ factor not available for this calculation.</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Confidence</span>
          </div>
          <div className="text-sm font-bold text-orange-600">{result.confidenceLevel}</div>
          <div className="mt-2 text-[10px] text-slate-500 space-y-1">
            {(result.assumptions || []).map((a, i) => (
              <p key={i}>• {a}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function InterventionSimulatorPage({ onNavigateTab }) {
  const { settings, recommendations } = useCampus();
  const [selectedMeasure, setSelectedMeasure] = useState(null);
  const [params, setParams] = useState({});
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mlStatus, setMlStatus] = useState(null);

  const handleSelectMeasure = (measure) => {
    setSelectedMeasure(measure);
    // Pre-fill defaults including active tariff from campus settings
    const defaults = { ...measure.defaultParams };
    if (settings?.electricityTariffInr) defaults.electricityTariffInr = settings.electricityTariffInr;
    if (settings?.waterTariffInr) defaults.waterTariffInrPerKl = settings.waterTariffInr;
    if (settings?.wasteCostInr) defaults.wasteCostInrPerKg = settings.wasteCostInr;
    setParams(defaults);
    setResult(null);
    setError(null);
  };

  const handleParamChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: Number(value) }));
  };

  const runSimulation = useCallback(async () => {
    if (!selectedMeasure) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/ml/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          measure: {
            id: selectedMeasure.id,
            resourceType: selectedMeasure.resourceType,
            title: selectedMeasure.title,
            reductionSourceLabel: selectedMeasure.reductionSourceLabel
          },
          params
        })
      });
      const json = await res.json();
      if (json.success) {
        setResult(json);
        setMlStatus("ok");
      } else {
        setError(json.error || "Simulation failed");
        setMlStatus("error");
      }
    } catch (e) {
      setError("Cannot reach ML service (port 5002). Start with: python ml_service/app.py");
      setMlStatus("offline");
    } finally {
      setIsLoading(false);
    }
  }, [selectedMeasure, params]);

  const c = selectedMeasure ? colorClasses[resourceColor(selectedMeasure.resourceType)] : colorClasses.amber;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-950 via-purple-900 to-slate-900 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-400/20 text-violet-300 border border-violet-400/30">
                AI-Powered Scenario Simulation
              </span>
              <span className="text-xs text-slate-300">Presidency University · Yelahanka, Bengaluru</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">What If We Implement This Measure?</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Select a sustainability intervention, adjust the parameters, and simulate the projected resource reduction.
              All outputs are <strong className="text-violet-300">scenario projections</strong> — not verified outcomes.
            </p>
          </div>
          <div className="shrink-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
            <FlaskConical className="w-8 h-8 text-violet-300 mx-auto mb-1" />
            <div className="text-xs text-slate-300 font-medium">Python ML Engine</div>
            <div className={`text-xs font-bold mt-0.5 ${mlStatus === "ok" ? "text-emerald-400" : mlStatus === "offline" ? "text-red-400" : "text-slate-400"}`}>
              {mlStatus === "ok" ? "● Online" : mlStatus === "offline" ? "● Offline" : "● Not tested"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Measure Selection */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider px-1">
            1 · Select a Measure
          </h2>
          {CAMPUS_MEASURES.map((measure) => {
            const mc = colorClasses[resourceColor(measure.resourceType)];
            const isSelected = selectedMeasure?.id === measure.id;
            return (
              <button
                key={measure.id}
                onClick={() => handleSelectMeasure(measure)}
                className={`w-full text-left rounded-2xl border p-4 transition-all ${
                  isSelected
                    ? `${mc.bg} ${mc.border} shadow-md ring-2 ring-offset-1 ring-${resourceColor(measure.resourceType)}-300`
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? mc.badge : "bg-slate-100"}`}>
                    {resourceIcon(measure.resourceType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${isSelected ? mc.badge : "bg-slate-100 text-slate-600"}`}>
                        {measure.resourceType}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">{measure.id}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 leading-snug">{measure.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{measure.category}</p>
                  </div>
                  {isSelected && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* RIGHT: Parameters + Results */}
        <div className="lg:col-span-2 space-y-5">
          {!selectedMeasure ? (
            <div className="flex flex-col items-center justify-center h-64 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 bg-slate-50">
              <Sliders className="w-10 h-10 mb-3 opacity-40" />
              <p className="font-medium">Select a measure on the left to configure and simulate</p>
              <p className="text-xs mt-1">Each measure has adjustable parameters for your scenario</p>
            </div>
          ) : (
            <>
              {/* Parameter Controls */}
              <div className={`rounded-2xl border p-5 ${c.bg} ${c.border}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    2 · Adjust Parameters
                  </h2>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.badge}`}>
                    {selectedMeasure.resourceType}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(params).map(([key, value]) => {
                    const label = selectedMeasure.paramLabels?.[key] || key;
                    const isPercent = key.toLowerCase().includes("pct") || key.toLowerCase().includes("fraction");
                    const isInr = key.toLowerCase().includes("inr") || key.toLowerCase().includes("tariff") || key.toLowerCase().includes("cost");
                    const isPct = key.toLowerCase().includes("pct");
                    const step = isPct ? 1 : isInr ? 0.5 : key.includes("Litres") || key.includes("Kwh") ? 1000 : 1;
                    const min = isPct ? 1 : key.toLowerCase().includes("fraction") ? 0.1 : 0;
                    const max = isPct ? 100 : key.toLowerCase().includes("fraction") ? 1.0 : undefined;

                    return (
                      <div key={key} className="space-y-1">
                        <label className="text-xs font-medium text-slate-700 leading-tight block">{label}</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={value}
                            min={min}
                            max={max}
                            step={step}
                            onChange={(e) => handleParamChange(key, e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                          />
                          {isPct && <span className="text-xs text-slate-500 w-4">%</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Published reference note */}
                <div className="mt-4 p-3 rounded-lg bg-white/70 border border-white/50 text-xs text-slate-600">
                  <strong className="text-slate-700">Published reference:</strong> {selectedMeasure.publishedRef}
                  {selectedMeasure.publishedRefSource && (
                    <a href={selectedMeasure.publishedRefSource} target="_blank" rel="noopener noreferrer"
                      className="ml-1 text-violet-600 hover:underline">[source ↗]</a>
                  )}
                </div>

                <button
                  onClick={runSimulation}
                  disabled={isLoading}
                  className="mt-5 w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:opacity-60 text-white font-bold text-sm shadow-lg shadow-violet-600/25 transition-all"
                >
                  {isLoading ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Running Python ML Model…</>
                  ) : (
                    <><Play className="w-4 h-4" /> 3 · Run Simulation</>
                  )}
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-700">Simulation Error</p>
                    <p className="text-xs text-red-600 mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {/* Results */}
              {result && <SimulatorResult result={result} measure={selectedMeasure} />}
            </>
          )}
        </div>
      </div>

      {/* Workflow reminder */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-4">End-to-End Workflow</h3>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          {["SENSE", "ANALYSE", "DETECT", "RECOMMEND", "SIMULATE ← You are here", "IMPLEMENT", "VERIFY", "LEARN"].map((step, i, arr) => (
            <React.Fragment key={step}>
              <span className={`px-2.5 py-1.5 rounded-lg font-bold ${step.includes("here") ? "bg-violet-100 text-violet-700 border border-violet-300" : "bg-slate-100 text-slate-600"}`}>
                {step}
              </span>
              {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />}
            </React.Fragment>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3">
          After simulating, go to <strong>Action Tracker</strong> to record implementation and <strong>Impact Verification</strong> to compare actual vs projected outcomes.
        </p>
      </div>
    </div>
  );
}
