import React, { useState, useEffect, useCallback } from "react";
import { 
  Building2, 
  ArrowLeft, 
  Zap, 
  Sun, 
  Droplets, 
  Trash2, 
  AlertTriangle, 
  Lightbulb, 
  Sliders, 
  CheckSquare, 
  Award, 
  FileSpreadsheet, 
  TrendingUp, 
  TrendingDown, 
  Info, 
  IndianRupee, 
  Leaf, 
  CheckCircle2, 
  ArrowRight,
  Upload,
  Calendar,
  ShieldCheck
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";
import { useCampus } from "../context/CampusContext";
import { BlockImage } from "../components/BlockImage";
import { formatInr, formatKwh } from "../utils/formatters";

export function BlockDetailPage({ blockId = "CSE", onBack, onNavigateTab }) {
  const { blocks, getAuthHeaders, showToast, createAction } = useCampus();
  const [activeTab, setActiveTab] = useState("overview");
  const [blockData, setBlockData] = useState(null);
  const [timeSeries, setTimeSeries] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recs, setRecs] = useState([]);
  const [actions, setActions] = useState([]);
  const [impact, setImpact] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulation State
  const [simReductionPct, setSimReductionPct] = useState(30);
  const [simDays, setSimDays] = useState(30);
  const [simResult, setSimResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // CSV Upload State
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadResource, setUploadResource] = useState("Electricity");
  const [isUploading, setIsUploading] = useState(false);

  const block = blocks.find(b => b.id.toUpperCase() === blockId.toUpperCase()) || blocks[0];

  // Fetch block-specific data
  const loadBlockData = useCallback(async () => {
    if (!blockId) return;
    setIsLoading(true);
    try {
      const [blockRes, alertsRes, recsRes, actionsRes, impactRes] = await Promise.all([
        fetch(`/api/blocks/${blockId}`),
        fetch(`/api/blocks/${blockId}/alerts`),
        fetch(`/api/blocks/${blockId}/recommendations`),
        fetch(`/api/blocks/${blockId}/actions`),
        fetch(`/api/blocks/${blockId}/impact`)
      ]);

      const [bJson, aJson, rJson, actJson, impJson] = await Promise.all([
        blockRes.json(),
        alertsRes.json(),
        recsRes.json(),
        actionsRes.json(),
        impactRes.json()
      ]);

      if (bJson.success) setBlockData(bJson.data);
      if (aJson.success) setAlerts(aJson.data);
      if (rJson.success) setRecs(rJson.data);
      if (actJson.success) setActions(actJson.data);
      if (impJson.success) setImpact(impJson.data);

      // Load electricity time series by default
      const tsRes = await fetch(`/api/blocks/${blockId}/resources/electricity`);
      const tsJson = await tsRes.json();
      if (tsJson.success) setTimeSeries(tsJson.data.slice(0, 48).reverse());
    } catch (err) {
      console.error("Error fetching block detail:", err);
    } finally {
      setIsLoading(false);
    }
  }, [blockId]);

  useEffect(() => {
    loadBlockData();
  }, [loadBlockData]);

  // Run What-If Simulation
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const baseDaily = block?.kpis?.todayElectricityKwh || 1800;
      const res = await fetch("/ml/blocks/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockId: block.id,
          resourceType: "Electricity",
          baselineDaily: baseDaily,
          applicableFraction: 0.85,
          assumedReductionPct: simReductionPct,
          analysisDays: simDays,
          tariffInr: 8.5,
          co2Factor: 0.716,
          capexInr: 12000
        })
      });
      const json = await res.json();
      if (json.success) setSimResult(json);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Convert Recommendation / Simulation to Action
  const handleCreateActionFromRec = async (rec) => {
    const actionPayload = {
      blockId: block.id,
      title: rec.title,
      resourceType: rec.resourceType || "Electricity",
      recommendationId: rec.id,
      priority: rec.priority || "High",
      potentialResourceSavings: rec.estimatedMonthlyResourceSavings || 3000,
      interventionDetails: rec.recommendedIntervention || rec.title,
      baselinePeriod: rec.identifiedInefficiency || "Telemetry observed baseline",
      status: "In Progress"
    };
    const created = await createAction(actionPayload);
    if (created) {
      loadBlockData();
      setActiveTab("actions");
    }
  };

  // CSV Upload
  const handleCsvSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      showToast("Please choose a CSV file to upload.", "error");
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("resourceType", uploadResource);

      const res = await fetch(`/api/blocks/${block.id}/upload`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message, "success");
        setUploadFile(null);
        loadBlockData();
      } else {
        showToast(json.message || "CSV upload failed", "error");
      }
    } catch (err) {
      showToast("Network failure during CSV upload", "error");
    } finally {
      setIsUploading(false);
    }
  };

  if (!block) return null;

  const score = block.sustainabilityScore;
  const scoreColor = score >= 80 ? "text-emerald-400 bg-emerald-500/20 border-emerald-400/30" :
    score >= 65 ? "text-teal-400 bg-teal-500/20 border-teal-400/30" :
    score >= 50 ? "text-amber-400 bg-amber-500/20 border-amber-400/30" :
    "text-rose-400 bg-rose-500/20 border-rose-400/30";

  const tabs = [
    { id: "overview", label: "Overview", icon: Building2 },
    { id: "electricity", label: "Electricity", icon: Zap },
    { id: "solar", label: "Solar", icon: Sun },
    { id: "water", label: "Water", icon: Droplets },
    { id: "waste", label: "Waste", icon: Trash2 },
    { id: "alerts", label: `Alerts (${alerts.length})`, icon: AlertTriangle, badge: alerts.length > 0 },
    { id: "recommendations", label: `Nudges (${recs.length})`, icon: Lightbulb },
    { id: "simulator", label: "What-If Simulator", icon: Sliders },
    { id: "actions", label: `Actions (${actions.length})`, icon: CheckSquare },
    { id: "impact", label: "M&V Impact", icon: Award },
    { id: "data", label: "CSV Ingest", icon: FileSpreadsheet }
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Blocks</span>
      </button>

      {/* Hero Banner with Block Photo / Gradient Fallback */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-xl border border-slate-800 text-white">
        <div className="absolute inset-0 opacity-40">
          <BlockImage
            imagePath={block.imagePath}
            blockName={block.name}
            category={block.category}
            rooftopSolarKwp={block.rooftopSolarKwp}
            aspectRatio="aspect-auto"
            className="w-full h-full object-cover"
            showCredit={false}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />

        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/20 text-white">
                {block.category}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800/80 border border-slate-700 text-slate-300">
                {block.builtUpAreaSqm?.toLocaleString()} m² Built-Up
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800/80 border border-slate-700 text-slate-300">
                {block.occupancy?.toLocaleString()} Design Occupants
              </span>
              {block.rooftopSolarKwp > 0 && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400 text-amber-950 flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 fill-amber-950" />
                  {block.rooftopSolarKwp} kWp Rooftop Solar
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              {block.name}
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              {block.description}
            </p>
          </div>

          {/* Sustainability Score Badge */}
          <div className="bg-slate-950/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800/90 shrink-0 text-center space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Sustainability Rating
            </div>
            <div className="text-3xl font-black text-emerald-400">
              {score}<span className="text-sm text-slate-400">/100</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-300">
              {block.sustainabilityRating}
            </div>
          </div>
        </div>

        {/* 10 Sub-Tabs Navigation Bar */}
        <div className="relative z-10 px-6 bg-slate-950/90 border-t border-slate-800/80 flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? "border-emerald-500 text-emerald-400 bg-white/5"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── TAB CONTENT ──────────────────────────────────────────────────────── */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key KPI Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Daily Demand</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{block.kpis.todayElectricityKwh} <span className="text-xs font-normal">kWh</span></div>
              <span className="text-[10px] text-slate-500">Substation calibrated load</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Energy Intensity</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{block.kpis.kwhPerSqm} <span className="text-xs font-normal">kWh/m²</span></div>
              <span className="text-[10px] text-emerald-600 font-medium">Target: {block.scoreBreakdown?.categoryBenchmarkKwhPerSqm || 40} kWh/m²</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Carbon Footprint</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{block.kpis.carbonKgToday} <span className="text-xs font-normal">kg CO₂e</span></div>
              <span className="text-[10px] text-slate-500">CEA Factor: 0.716 kg/kWh</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Per Occupant</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{block.kpis.kwhPerOccupant} <span className="text-xs font-normal">kWh/yr</span></div>
              <span className="text-[10px] text-slate-500">{block.occupancy} occupants</span>
            </div>
          </div>

          {/* Diurnal Demand Curve */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900">24-Hour Diurnal Demand Curve</h3>
                <p className="text-xs text-slate-500 mt-0.5">Actual metered demand vs archetype category baseline</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600">
                1-Hour Telemetry Resolution
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={blockData?.hourlyProfile || timeSeries}>
                  <defs>
                    <linearGradient id="elecGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hourFormatted" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="actualKwh" stroke="#3b82f6" fillOpacity={1} fill="url(#elecGrad)" name="Actual Load (kWh)" />
                  <Line type="monotone" dataKey="baselineKwh" stroke="#94a3b8" strokeDasharray="4 4" name="Baseline (kWh)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transparent Score Breakdown Card */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-black">Transparent Sustainability Score Formula</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {block.scoreFormula || "Score (0-100) = [Energy Intensity * 35%] + [Solar/Clean Power * 20%] + [Water Efficiency * 20%] + [Waste Diversion * 15%] - [Open Alert Penalty up to 20 pts]."}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="text-[10px] text-slate-400">Energy (35%)</div>
                <div className="text-lg font-black text-emerald-400 mt-1">{block.scoreBreakdown?.energyIntensityScore || 70}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="text-[10px] text-slate-400">Solar (20%)</div>
                <div className="text-lg font-black text-amber-400 mt-1">{block.scoreBreakdown?.solarCleanEnergyScore || 50}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="text-[10px] text-slate-400">Water (20%)</div>
                <div className="text-lg font-black text-cyan-400 mt-1">{block.scoreBreakdown?.waterEfficiencyScore || 78}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="text-[10px] text-slate-400">Waste (15%)</div>
                <div className="text-lg font-black text-teal-400 mt-1">{block.scoreBreakdown?.wasteDiversionScore || 80}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="text-[10px] text-slate-400">Penalty (-10%)</div>
                <div className="text-lg font-black text-rose-400 mt-1">-{block.scoreBreakdown?.openAlertPenalty || 0}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ALERTS TAB */}
      {activeTab === "alerts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900">Active Inefficiency Anomalies ({alerts.length})</h3>
            <span className="text-xs text-slate-500">Detected via statistical baseline deviation</span>
          </div>

          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <div key={alert.id} className="p-5 rounded-2xl bg-white border border-rose-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500 text-white">
                      {alert.severity} Priority
                    </span>
                    <span className="text-xs font-bold text-slate-700">{alert.resourceType} Anomaly</span>
                    <span className="text-[11px] text-slate-400">• {alert.timestamp}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-rose-600">₹{alert.potentialInrSavings?.toLocaleString()} lost</div>
                    <div className="text-[10px] text-slate-400">{alert.co2eAvoidedKg} kg CO₂e impact</div>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {alert.reason}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 italic text-[11px]">{alert.disclaimer}</span>
                  <button
                    onClick={() => setActiveTab("recommendations")}
                    className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <span>View Recommended Fix</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-800">Zero Active Inefficiencies</p>
              <p className="text-slate-400 mt-1">{block.name} is currently operating within expected baseline thresholds.</p>
            </div>
          )}
        </div>
      )}

      {/* 3. RECOMMENDATIONS TAB */}
      {activeTab === "recommendations" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900">Tailored Sustainability Nudges for {block.shortName}</h3>
            <span className="text-xs text-slate-500">Aligned with IPMVP Option B</span>
          </div>

          {recs.map((rec) => (
            <div key={rec.id} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {rec.category}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{rec.confidence}</span>
                  </div>
                  <h4 className="text-base font-black text-slate-900">{rec.title}</h4>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200 shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-black text-emerald-700">₹{rec.estimatedMonthlyInr?.toLocaleString()}/mo</div>
                    <div className="text-[10px] text-slate-500">Payback: {rec.paybackMonths} mos</div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {rec.recommendedIntervention}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-700">Corrective Actions:</div>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                    {(rec.correctiveActions || []).map((ca, idx) => (
                      <li key={idx}>{ca}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-700">Measurement & Verification (M&V):</div>
                  <p className="text-slate-600 leading-relaxed">{rec.verificationMethod}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setActiveTab("simulator");
                  }}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md shadow-violet-600/20 flex items-center gap-1.5 transition-all"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Simulate & Predict Impact (What-If)</span>
                </button>
                <button
                  onClick={() => handleCreateActionFromRec(rec)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Convert to Tracked Action</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. WHAT-IF SIMULATOR TAB */}
      {activeTab === "simulator" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900">What-If Intervention Simulator — {block.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Pre-calculate projected energy, financial ROI, and 5-year NPV before capital commitment.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 flex justify-between">
                  <span>Assumed Reduction Target (%):</span>
                  <span className="text-emerald-700">{simReductionPct}%</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="1"
                  value={simReductionPct}
                  onChange={(e) => setSimReductionPct(Number(e.target.value))}
                  className="w-full mt-2 accent-emerald-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 flex justify-between">
                  <span>Analysis Period (Days):</span>
                  <span>{simDays} days</span>
                </label>
                <input
                  type="range"
                  min="7"
                  max="90"
                  step="1"
                  value={simDays}
                  onChange={(e) => setSimDays(Number(e.target.value))}
                  className="w-full mt-2 accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="text-slate-500">Calibrated Baseline:</div>
                <div className="font-bold text-slate-800">{block.kpis.todayElectricityKwh} kWh/day</div>
                <div className="text-slate-500 text-[10px]">Commercial Tariff: ₹8.50/kWh • Grid Factor: 0.716 kg/kWh</div>
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Sliders className="w-4 h-4" />
                <span>{isSimulating ? "Running ML Model..." : "Run What-If Simulation"}</span>
              </button>
            </div>

            {/* Simulation Results Display */}
            <div className="md:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              {simResult ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                      Simulation Projections
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      {simResult.protocol}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-400">Period Savings</div>
                      <div className="text-base font-black text-slate-900 mt-1">{simResult.projected.periodReduction} kWh</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-400">Monthly Savings</div>
                      <div className="text-base font-black text-emerald-600 mt-1">₹{simResult.financial.monthlySavingsInr?.toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-400">Simple Payback</div>
                      <div className="text-base font-black text-slate-900 mt-1">{simResult.financial.paybackMonths} mos</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-400">5-Year NPV</div>
                      <div className="text-base font-black text-indigo-600 mt-1">₹{simResult.financial.fiveYearNpvInr?.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex justify-between">
                    <span className="text-slate-500">Avoided Carbon Emissions:</span>
                    <span className="font-bold text-slate-800">{simResult.environmental.co2AvoidedTons} Tons CO₂e</span>
                  </div>

                  <button
                    onClick={() => handleCreateActionFromRec({
                      title: `What-If ${simReductionPct}% Load Reduction Measure - ${block.shortName}`,
                      resourceType: "Electricity",
                      estimatedMonthlyResourceSavings: simResult.projected.dailyReduction * 30,
                      recommendedIntervention: `Automate energy management to realize projected ${simReductionPct}% reduction (${simResult.projected.dailyReduction} kWh/day).`
                    })}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>Commit Simulation to Tracked Action</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
                  <Sliders className="w-8 h-8 text-slate-300 stroke-1" />
                  <p className="text-xs font-bold text-slate-600">Simulator Ready</p>
                  <p className="text-[11px] text-slate-400">Adjust the target reduction slider and click Run to calculate projected yields.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. ACTIONS TAB */}
      {activeTab === "actions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900">Tracked Campus Actions for {block.shortName}</h3>
            <span className="text-xs text-slate-500">M&V Audit Trail</span>
          </div>

          {actions.length > 0 ? (
            actions.map((act) => (
              <div key={act.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      act.status === "Resolved" || act.status === "Completed" ? "bg-emerald-100 text-emerald-800" :
                      act.status === "In Progress" ? "bg-amber-100 text-amber-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>
                      {act.status}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">{act.title}</h4>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">₹{act.potentialInrSavings?.toLocaleString()} potential</div>
                    <div className="text-[11px] text-emerald-600 font-bold">₹{act.verifiedInrSavings?.toLocaleString() || 0} verified</div>
                  </div>
                </div>

                <p className="text-xs text-slate-600">{act.interventionDetails}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Assigned to: <strong>{act.assignedTo}</strong></span>
                  <span>Target Date: {act.targetDate}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No actions currently registered for this block. Convert a recommendation to track implementation.
            </div>
          )}
        </div>
      )}

      {/* 6. M&V IMPACT TAB */}
      {activeTab === "impact" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Measurement & Verification (M&V) — {block.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{impact?.protocol || "IPMVP Option B (Retrofit Isolation)"}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-emerald-600">{impact?.summary?.realizationRatePct || 0}%</div>
              <div className="text-[10px] text-slate-400">Realization Rate</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Total Tracked</div>
              <div className="text-xl font-black text-slate-900 mt-1">{impact?.summary?.totalActions || 0}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Completed Actions</div>
              <div className="text-xl font-black text-emerald-600 mt-1">{impact?.summary?.completedActions || 0}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Verified Savings</div>
              <div className="text-xl font-black text-slate-900 mt-1">₹{impact?.summary?.verifiedSavingsInr?.toLocaleString() || 0}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Avoided Carbon</div>
              <div className="text-xl font-black text-emerald-600 mt-1">{impact?.summary?.verifiedCo2AvoidedTons || 0} t</div>
            </div>
          </div>
        </div>
      )}

      {/* 7. CSV DATA INGEST TAB */}
      {activeTab === "data" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900">Scoped CSV Data Ingestion for {block.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Upload sub-metered historical energy or water loggers bound to this building block.</p>
          </div>

          <form onSubmit={handleCsvSubmit} className="max-w-xl space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700">Resource Stream:</label>
              <select
                value={uploadResource}
                onChange={(e) => setUploadResource(e.target.value)}
                className="w-full mt-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="Electricity">Electricity Sub-Meter (kWh)</option>
                <option value="Solar">Solar PV Generation (kWh)</option>
                <option value="Water">Water Flow Transmitter (Litres)</option>
                <option value="Waste">Food Waste Scale Log (kg)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Choose CSV File:</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setUploadFile(e.target.files[0])}
                className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-xs text-slate-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 mt-1">Expected columns: timestamp, value (and optional: meterId, notes).</p>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? "Validating & Ingesting..." : `Upload & Ingest to ${block.shortName}`}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
