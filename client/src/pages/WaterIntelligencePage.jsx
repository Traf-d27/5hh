import React, { useState } from "react";
import { 
  Droplets, 
  IndianRupee, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  Info 
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { useCampus } from "../context/CampusContext";
import { formatInr } from "../utils/formatters";
import { SeverityBadge } from "../components/Badge";
import { CreateActionModal } from "../components/CreateActionModal";

export function WaterIntelligencePage({ onNavigateTab }) {
  const { waterData, settings } = useCampus();
  const [selectedAnomalyForAction, setSelectedAnomalyForAction] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  if (!waterData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Loading Water & STP Intelligence...</p>
        </div>
      </div>
    );
  }

  const metrics = waterData.metrics || {};
  const dailyTrend = waterData.dailyTrend || (waterData.dailyReadings || []).map(r => ({
    date: r.dateFormatted || r.date,
    treatedLitres: r.actualTreatedLitres || r.treatedLitres || 0,
    reusedLitres: r.landscapeReuseLitres || r.reusedLitres || 0
  }));
  const anomalies = waterData.anomalies || [];
  const publishedReference = waterData.publishedReference || {};
  const tariff = settings?.waterTariffInr || 45;

  const avgTreated = metrics.avgDailyTreatedLitres ?? (metrics.totalTreatedLitres ? Math.round(metrics.totalTreatedLitres / 14) : 300000);
  const avgReused = metrics.avgDailyReusedLitres ?? (metrics.totalReusedLitres ? Math.round(metrics.totalReusedLitres / 14) : 264000);
  const reuseRatio = metrics.averageReuseRatioPct ?? metrics.reuseEfficiencyPct ?? 88;
  const costSavings = metrics.estimatedCostSavingsInr ?? metrics.financialYieldInr ?? Math.round((avgReused * 14 / 1000) * tariff);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950 via-teal-900 to-slate-900 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5" />
                Water & Wastewater Module
              </span>
              <span className="text-xs text-cyan-200">
                Presidency Campus Sewage Treatment Plant (STP) & Green Lawns
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Sewage Treatment & Landscape Reuse Intelligence</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Monitoring daily SBR wastewater treatment capacity against the published <strong>~300,000 Litres/day</strong> reference, tracking landscape irrigation recycling, and detecting subterranean pipe leakages.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Daily Average Treated</span>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {(avgTreated / 1000).toFixed(0)} kL / day
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Design Reference: <span className="font-bold text-slate-800">300 kL/day</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Landscape Reuse Rate</span>
          <div className="text-2xl font-black text-cyan-700 mt-2">
            {reuseRatio}% Recycled
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Avg: <span className="font-bold text-slate-800">{(avgReused / 1000).toFixed(0)} kL/day</span> to lawns
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Fresh Water Pumping Avoided</span>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            {formatInr(costSavings)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Tariff: <span className="font-bold text-slate-800">₹{tariff}/kL</span> (Pumping/Fresh supply)
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Active Water Anomalies</span>
          <div className="text-2xl font-black text-rose-600 mt-2">{anomalies?.length || 0} Flagged</div>
          <div className="text-xs text-slate-500 mt-1">
            Includes suspected turf line leaks
          </div>
        </div>
      </div>

      {/* Main Chart: Treated Effluent vs Landscape Turf Reuse */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Historical STP Wastewater Treatment vs Landscape Reuse</h2>
            <p className="text-xs text-slate-500">
              14-Day flow telemetry (Litres) tracking treated effluent vs water pumped to campus turf
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
            Published Reference: ~300,000 Litres/day
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `${v / 1000}kL`} />
              <Tooltip
                formatter={(val, name) => [`${(val / 1000).toFixed(1)} kL (${val.toLocaleString()} L)`, name]}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
              <Bar dataKey="treatedLitres" fill="#0891b2" name="Treated Wastewater (Litres)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="reusedLitres" fill="#10b981" name="Landscape Irrigation (Litres)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Water Anomalies Section */}
      {anomalies && anomalies.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Detected Water Anomalies Requiring Inspection</h3>
              <p className="text-xs text-slate-500">Hydraulic pressure drop & abnormal distribution surges</p>
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
                    <span className="text-[10px] text-slate-400 block uppercase">Surge Volume</span>
                    <span className="text-sm font-extrabold text-rose-600">
                      +{((anom.observedValue - anom.baselineValue) / 1000).toFixed(0)} kL ({anom.percentageDeviation}%)
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

      {/* Action Modal */}
      <CreateActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        initialData={selectedAnomalyForAction}
      />
    </div>
  );
}
