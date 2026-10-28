import React, { useState } from "react";
import { 
  Sun, 
  Zap, 
  IndianRupee, 
  Leaf, 
  TrendingUp, 
  ShieldAlert, 
  CloudSun, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Compass, 
  CheckCircle2, 
  ArrowRight,
  Info
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart, 
  Line, 
  Legend 
} from "recharts";
import { useCampus } from "../context/CampusContext";
import { formatInr, formatKwh } from "../utils/formatters";
import { SeverityBadge } from "../components/Badge";
import { DiscrepancyModal } from "../components/DiscrepancyModal";
import { CreateActionModal } from "../components/CreateActionModal";

export function SolarIntelligencePage({ onNavigateTab }) {
  const { solarData, settings } = useCampus();
  const [isDiscrepancyOpen, setIsDiscrepancyOpen] = useState(false);
  const [selectedAnomalyForAction, setSelectedAnomalyForAction] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  if (!solarData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Loading Solar Intelligence Engine...</p>
        </div>
      </div>
    );
  }

  const { metrics = {}, dailyTrend = [], diurnalCurve = [], dayAheadForecast, anomalies = [], publishedReference } = solarData;
  const tariff = settings?.electricityTariffInr || 8.5;
  const co2Factor = settings?.gridCo2Factor || 0.716;

  // Robust calculations handling either backend property naming convention
  const daysCount = Math.max(1, dailyTrend.length || 14);
  const totalSolarKwh = metrics.totalSolarGeneratedKwh || (dailyTrend.length > 0 ? dailyTrend.reduce((s, r) => s + (r.solarGeneratedKwh || 0), 0) : 11788);
  const dailyAvgSolar = metrics.dailyAverageKwh ?? Math.round(totalSolarKwh / daysCount);
  const totalCostAvoided = metrics.totalCostAvoidedInr ?? metrics.costAvoidedInr ?? Math.round(totalSolarKwh * tariff);
  const co2Avoided = metrics.co2eAvoidedTons ?? metrics.co2AvoidedTons ?? (Math.round(((totalSolarKwh * co2Factor) / 1000) * 10) / 10);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-900 via-amber-800 to-slate-900 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                <Sun className="w-3.5 h-3.5" />
                Flagship Analytics Module
              </span>
              <span className="text-xs text-amber-200">
                Presidency University Central Administration Rooftop (220 kWp Array)
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Rooftop Solar Generation & Yield Intelligence</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Monitoring diurnal insolation, weather-adjusted conversion yields, grid import substitution, and empirical dust/soiling derate factors.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsDiscrepancyOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-400/20 transition-all"
            >
              <ShieldAlert className="w-4 h-4 text-slate-950" />
              <span>Audit: 800 kWh/day Discrepancy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Discrepancy Alert Notification Banner */}
      <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <span className="font-extrabold text-sm block">Data Integrity & Audit Protocol Active:</span>
            <p className="leading-relaxed">
              Presidency University's official renewable portal reports <strong>~800 units (kWh) daily</strong> generated on the Central Administration Building rooftop, but states a monthly savings figure that fails mathematical reconciliation. ECHOTECH uses the 800 kWh/day physical baseline multiplied by BESCOM's commercial tariff (₹{tariff.toFixed(2)}/kWh) to prevent unverified financial reporting.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsDiscrepancyOpen(true)}
          className="text-xs font-bold text-amber-900 underline shrink-0 hover:text-amber-950"
        >
          View Full Audit
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Daily Average Solar</span>
          <div className="text-2xl font-black text-slate-900 mt-2">{formatKwh(dailyAvgSolar)}</div>
          <div className="text-xs text-slate-500 mt-1">
            Campus Reference: <span className="font-bold text-slate-800">800 kWh/day</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Avoided Energy Cost</span>
          <div className="text-2xl font-black text-emerald-700 mt-2">{formatInr(totalCostAvoided)}</div>
          <div className="text-xs text-slate-500 mt-1">
            BESCOM Tariff: <span className="font-bold text-slate-800">₹{tariff.toFixed(2)}/kWh</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Grid Carbon Avoided</span>
          <div className="text-2xl font-black text-teal-800 mt-2">{co2Avoided} Tons CO₂e</div>
          <div className="text-xs text-slate-500 mt-1">
            CEA Baseline: <span className="font-bold text-slate-800">{co2Factor} kg/kWh</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Day-Ahead Projected</span>
          <div className="text-2xl font-black text-amber-600 mt-2">{formatKwh(dayAheadForecast?.projectedDailyKwh || 1000)}</div>
          <div className="text-xs text-slate-500 mt-1">
            Variance: <span className="font-bold text-amber-700">+{dayAheadForecast?.varianceFromPublishedRefPct || 25}% vs Ref</span>
          </div>
        </div>
      </div>

      {/* Chart 1: Diurnal Generation Curve vs Campus Electricity Demand */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">24-Hour Diurnal Solar Profile vs Campus Demand</h2>
            <p className="text-xs text-slate-500">
              Direct Solar Self-Consumption vs Grid Import Requirements across hour of the day
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-500"></span>
              <span>Solar Output (kW)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-slate-400"></span>
              <span>Campus Demand (kW)</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={diurnalCurve} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hourFormatted" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `${v} kW`} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="p-3 bg-slate-900 text-white rounded-xl text-xs shadow-xl space-y-1">
                        <p className="font-bold text-amber-300">{label}</p>
                        <p className="text-amber-400 font-semibold">Solar Generation: {d.solarGenerationKw} kW</p>
                        <p className="text-slate-300">Campus Demand: {d.campusDemandKw} kW</p>
                        <p className="text-emerald-400 font-bold">Direct Solar Self-Consumed: {d.directSolarSelfConsumed} kW</p>
                        <p className="text-rose-300 font-medium">Grid Import Needed: {d.gridImportRequired} kW</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="solarGenerationKw" stroke="#d97706" strokeWidth={2.5} fillOpacity={1} fill="url(#solarGradient)" name="Solar (kW)" />
              <Area type="monotone" dataKey="campusDemandKw" stroke="#475569" strokeWidth={1.5} strokeDasharray="3 3" fillOpacity={1} fill="url(#demandGradient)" name="Demand (kW)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Daily Generation Trends (Actual vs Clear-Sky Expected vs 800 kWh Reference) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Historical Daily Solar Generation (14 Days)</h2>
              <p className="text-xs text-slate-500">Actual daily output compared against expected clear-sky baseline & 800 kWh reference</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Line type="monotone" dataKey="actualKwh" stroke="#d97706" strokeWidth={2.5} name="Actual Solar (kWh)" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="expectedKwh" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" name="Expected Clear-Sky (kWh)" />
                <Line type="monotone" dataKey="publishedReferenceKwh" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="2 2" name="Published Ref (800 kWh)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Day-Ahead Forecast Panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Next-Day Forecast
              </span>
              <span className="text-xs text-slate-400 font-mono">Date: {dayAheadForecast?.forecastDate}</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Day-Ahead Solar Yield Estimate</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {dayAheadForecast?.forecastMethod}: Blended 7-day rolling empirical average combined with solar geometry clear-sky model.
            </p>

            <div className="mt-4 p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-center">
              <span className="text-xs text-amber-800 font-medium block">Projected Generation</span>
              <span className="text-3xl font-black text-amber-950 mt-1 block">
                {dayAheadForecast?.projectedDailyKwh} kWh
              </span>
              <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
                Estimated Savings: {formatInr(dayAheadForecast?.projectedDailyKwh * tariff)}
              </span>
            </div>

            <div className="mt-3 text-[11px] text-slate-500 space-y-1">
              <div>• Peak sun hours expected: <strong>11:00 to 14:00 (155 kW max)</strong></div>
              <div>• Weather condition: <strong>Clear / Mild Haze (Bengaluru)</strong></div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 italic flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{dayAheadForecast?.limitations}</span>
          </div>
        </div>
      </div>

      {/* Solar Anomaly Section */}
      {anomalies && anomalies.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Detected Solar Inefficiencies Requiring Action</h3>
                <p className="text-xs text-slate-500">Soiling degradation and inverter string anomalies flagged by baseline filter</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {anomalies.map((anom) => (
              <div key={anom.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{anom.facilityName}</span>
                    <SeverityBadge severity={anom.severity} />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{anom.reason}</p>
                  <span className="text-[11px] text-slate-400 italic block">{anom.disclaimer}</span>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Generation Shortfall</span>
                    <span className="text-sm font-extrabold text-rose-600">
                      {anom.observedValue} vs {anom.baselineValue} kWh ({anom.percentageDeviation}%)
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedAnomalyForAction(anom);
                      setIsActionModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                  >
                    <span>Create Action</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <DiscrepancyModal isOpen={isDiscrepancyOpen} onClose={() => setIsDiscrepancyOpen(false)} />
      <CreateActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        initialData={selectedAnomalyForAction}
      />
    </div>
  );
}
