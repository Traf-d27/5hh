import React, { useState } from "react";
import { 
  Trash2, 
  Leaf, 
  IndianRupee, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Scale, 
  Recycle, 
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
  Legend 
} from "recharts";
import { useCampus } from "../context/CampusContext";
import { formatInr } from "../utils/formatters";
import { SeverityBadge } from "../components/Badge";
import { CreateActionModal } from "../components/CreateActionModal";

export function WasteIntelligencePage({ onNavigateTab }) {
  const { wasteData, settings } = useCampus();
  const [selectedAnomalyForAction, setSelectedAnomalyForAction] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  if (!wasteData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Loading Waste & Vermicomposting Intelligence...</p>
        </div>
      </div>
    );
  }

  const { metrics, dailyTrend, anomalies, publishedReference } = wasteData;
  const wasteCost = settings?.wasteCostInr || 4.5;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" />
                Circular Waste & Composting Module
              </span>
              <span className="text-xs text-emerald-200">
                Presidency Campus Food Courts, Mess & Student Cafeterias
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Food Waste Vermicomposting & Diversion Intelligence</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Monitoring cafeteria food waste within the published <strong>120–150 kg/day</strong> reference window, tracking organic vermicomposting conversion with dry leaves, and preventing landfill methane emissions.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Daily Average Food Waste</span>
          <div className="text-2xl font-black text-slate-900 mt-2">{metrics.avgDailyFoodWasteKg} kg / day</div>
          <div className="text-xs text-slate-500 mt-1">
            Reference Range: <span className="font-bold text-slate-800">120 - 150 kg/day</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Vermicomposted Yield</span>
          <div className="text-2xl font-black text-emerald-700 mt-2">{metrics.totalVermicompostedKg.toLocaleString()} kg</div>
          <div className="text-xs text-slate-500 mt-1">
            Applied to: <span className="font-bold text-slate-800">Presidency Organic Gardens</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Landfill Diversion Rate</span>
          <div className="text-2xl font-black text-teal-800 mt-2">{metrics.diversionRatePct}% Diverted</div>
          <div className="text-xs text-slate-500 mt-1">
            Total Diverted: <span className="font-bold text-slate-800">{metrics.totalDivertedFromLandfillKg.toLocaleString()} kg</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Avoided Methane</span>
          <div className="text-2xl font-black text-emerald-800 mt-2">
            {(metrics.avoidedMethaneCo2eKg / 1000).toFixed(1)} Tons CO₂e
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Methane Factor: <span className="font-bold text-slate-800">1.9 kg CO2e / kg waste</span>
          </div>
        </div>
      </div>

      {/* Main Chart: Food Waste vs Vermicomposted vs Reference Range */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Historical Cafeteria Food Waste vs Vermicomposting Conversion</h2>
            <p className="text-xs text-slate-500">
              14-Day weight telemetry (kg) compared against the published 120-150 kg reference band
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
            Published Reference: 120 - 150 kg/day
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="wasteGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="compostGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `${v}kg`} />
              <Tooltip formatter={(val, name) => [`${val} kg`, name]} />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
              <Area type="monotone" dataKey="foodWasteKg" stroke="#e11d48" strokeWidth={2} fillOpacity={1} fill="url(#wasteGradient)" name="Total Food Waste (kg)" />
              <Area type="monotone" dataKey="vermicompostedKg" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#compostGradient)" name="Vermicomposted Organic (kg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Waste Anomalies Section */}
      {anomalies && anomalies.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Detected Waste Spikes Requiring Kitchen Portion Audit</h3>
              <p className="text-xs text-slate-500">Unmonitored buffet over-preparation exceeding vermicomposting pit capacity</p>
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
                    <span className="text-[10px] text-slate-400 block uppercase">Surge Exceedance</span>
                    <span className="text-sm font-extrabold text-rose-600">
                      +{anom.absoluteDeviation} kg (+{anom.percentageDeviation}%)
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
