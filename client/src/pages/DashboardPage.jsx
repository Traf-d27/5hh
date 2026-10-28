import React, { useState } from "react";
import { 
  Zap, 
  IndianRupee, 
  AlertTriangle, 
  TrendingUp, 
  Award, 
  Building2, 
  ArrowUpRight, 
  CheckCircle2, 
  Calendar,
  Sparkles,
  Info,
  Clock
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Legend 
} from "recharts";
import { useCampus } from "../context/CampusContext";
import { formatInr, formatKwh, formatPercent } from "../utils/formatters";
import { SeverityBadge } from "../components/Badge";
import { CreateActionModal } from "../components/CreateActionModal";

export function DashboardPage({ onNavigateTab }) {
  const { dashboardData, selectedBuilding, buildings, settings } = useCampus();
  const [selectedAnomalyForAction, setSelectedAnomalyForAction] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Loading Campus Energy Analytics...</p>
        </div>
      </div>
    );
  }

  const { metrics, trendData, buildingComparison, recentAnomalies, actionsSummary } = dashboardData;
  const tariff = settings?.electricityTariffInr || 8.5;

  const handleOpenActionModal = (anomaly) => {
    setSelectedAnomalyForAction(anomaly);
    setIsActionModalOpen(true);
  };

  const selectedBuildingObj = buildings.find(b => b.id === selectedBuilding);

  return (
    <div className="space-y-6">
      {/* Top Banner / Filter Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              Live Campus Monitor
            </span>
            <span className="text-xs text-slate-300">
              {selectedBuilding === "all" ? "Whole Campus (6 Facilities)" : selectedBuildingObj?.name}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Electricity Consumption & Inefficiency Dashboard</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Real-time telemetry tracking against historical baseline models. Quantifying wastage in kWh and INR (₹{tariff.toFixed(2)}/kWh).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigateTab("inefficiencies")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all backdrop-blur-sm"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>View {metrics.inefficiencyCount} Inefficiencies</span>
          </button>
          <button
            onClick={() => onNavigateTab("recommendations")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Savings Roadmap</span>
          </button>
        </div>
      </div>

      {/* 6 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Consumption */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Consumption</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Zap className="w-4 h-4 fill-emerald-600" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">{formatKwh(metrics.totalKwh)}</div>
            <div className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1.5">
              <span>Baseline: {formatKwh(metrics.baselineKwh)}</span>
              {metrics.excessKwh > 0 && (
                <span className="text-rose-600 font-bold text-[11px]">
                  (+{formatKwh(metrics.excessKwh)} excess)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Metric 2: Estimated Cost in INR */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Estimated Energy Cost</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">{formatInr(metrics.totalCostInr)}</div>
            <div className="text-xs font-medium text-slate-500 mt-1">
              At ₹{tariff.toFixed(2)}/kWh • {selectedBuilding === "all" ? "14-day window" : "Facility total"}
            </div>
          </div>
        </div>

        {/* Metric 3: Potential Monthly Savings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Potential Monthly Savings</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-emerald-700">{formatInr(metrics.potentialMonthlyInr)}</div>
            <div className="text-xs font-semibold text-emerald-800 mt-1">
              {formatKwh(metrics.potentialMonthlyKwh)}/month identified
            </div>
          </div>
        </div>

        {/* Metric 4: Verified Savings Realized */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Verified Savings Achieved</span>
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-teal-800">{formatInr(metrics.verifiedInr)}</div>
            <div className="text-xs font-medium text-teal-700 mt-1">
              {formatKwh(metrics.verifiedKwh)} verified by M&V
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Campus Electricity Consumption Trend</h2>
              <p className="text-xs text-slate-500">Actual daily consumption (kWh) compared against calibrated baseline</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
                <span>Actual Usage</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-slate-300"></span>
                <span>Expected Baseline</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-slate-900 text-white rounded-xl text-xs shadow-xl space-y-1">
                          <p className="font-bold text-slate-200">{label}</p>
                          <p className="text-emerald-400 font-semibold">Actual: {formatKwh(data.actualKwh)}</p>
                          <p className="text-slate-400">Baseline: {formatKwh(data.baselineKwh)}</p>
                          {data.excessKwh > 0 && (
                            <p className="text-rose-400 font-bold">Excess: +{formatKwh(data.excessKwh)}</p>
                          )}
                          <p className="text-teal-300 font-semibold pt-1 border-t border-slate-800">
                            Est. Cost: {formatInr(data.costInr)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="actualKwh" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#actualGradient)" name="Actual Usage" />
                <Area type="monotone" dataKey="baselineKwh" stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#baselineGradient)" name="Baseline" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Building Comparison Breakdown (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Facility Breakdown</h2>
              <p className="text-xs text-slate-500">Consumption & Inefficiency Hotspots</p>
            </div>
            <button
              onClick={() => onNavigateTab("buildings")}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
            >
              All Buildings <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5 flex-1 overflow-y-auto max-h-72 pr-1">
            {buildingComparison.map((bldg) => {
              const maxVal = buildingComparison[0]?.consumptionKwh || 1;
              const pctOfMax = Math.round((bldg.consumptionKwh / maxVal) * 100);

              return (
                <div key={bldg.buildingId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate max-w-[150px]">{bldg.name}</span>
                    <div className="flex items-center gap-2">
                      {bldg.anomaliesCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                          {bldg.anomaliesCount} alert{bldg.anomaliesCount > 1 ? "s" : ""}
                        </span>
                      )}
                      <span className="font-bold text-slate-900">{formatKwh(bldg.consumptionKwh)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        bldg.anomaliesCount > 0 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${pctOfMax}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{bldg.intensityKwhPerSqM} kWh/m²</span>
                    <span>{formatInr(bldg.costInr)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actionable Alerts Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Priority Inefficiency Alerts Requiring Action</h2>
              <p className="text-xs text-slate-500">
                Baseline deviations flagged across campus. Convert an alert into an action to track verifiable savings.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab("inefficiencies")}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
          >
            Detector Hub <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentAnomalies.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">All facilities currently operating within baseline parameters.</p>
            <p className="text-xs text-slate-500 mt-1">No anomalous electricity consumption detected in the active window.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentAnomalies.map((anom) => (
              <div
                key={anom.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{anom.buildingName}</span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {anom.dateFormatted} at {anom.hour}:00
                      </span>
                    </div>
                    <SeverityBadge severity={anom.severity} />
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {anom.reason}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-semibold py-2 px-3 rounded-lg bg-white border border-slate-200 mb-3">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Observed</span>
                      <span className="text-rose-600 font-bold">{formatKwh(anom.observedKwh)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Baseline</span>
                      <span className="text-slate-700">{formatKwh(anom.baselineKwh)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Deviation</span>
                      <span className="text-amber-600 font-bold">+{anom.deviationPct}%</span>
                    </div>
                    <div className="ml-auto text-right">
                      <span className="text-slate-400 block text-[10px]">Potential Waste</span>
                      <span className="text-emerald-700 font-extrabold">{formatInr(anom.potentialInrSavings)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                  <span className="text-[11px] text-slate-400 italic">Non-accusatory statistical flag</span>
                  <button
                    onClick={() => handleOpenActionModal(anom)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Create Action
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Creation Modal */}
      <CreateActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        initialData={selectedAnomalyForAction}
      />
    </div>
  );
}
