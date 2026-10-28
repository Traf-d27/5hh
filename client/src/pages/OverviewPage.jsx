import React, { useState } from "react";
import { 
  Sun, 
  Droplets, 
  Trash2, 
  Leaf, 
  IndianRupee, 
  AlertTriangle, 
  ArrowRight, 
  ShieldAlert, 
  Sparkles, 
  TrendingUp, 
  Building2,
  Clock,
  Layers,
  ChevronRight
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { useCampus } from "../context/CampusContext";
import { formatInr, formatKwh } from "../utils/formatters";
import { SeverityBadge } from "../components/Badge";
import { BlockImage } from "../components/BlockImage";
import { CreateActionModal } from "../components/CreateActionModal";
import { DiscrepancyModal } from "../components/DiscrepancyModal";

export function OverviewPage({ onNavigateTab, onSelectBlock }) {
  const { overviewData, settings, blocks } = useCampus();
  const [selectedAnomalyForAction, setSelectedAnomalyForAction] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isDiscrepancyModalOpen, setIsDiscrepancyModalOpen] = useState(false);

  if (!overviewData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Loading Presidency Campus Sustainability Matrix...</p>
        </div>
      </div>
    );
  }

  const { metrics, campusMeta, recentAnomalies, publishedReferences, topConsumingBlocks = [], blocksNeedingAttention = [] } = overviewData;
  const tariff = settings?.electricityTariffInr || 8.5;

  return (
    <div className="space-y-6">
      {/* Top Welcome Hero Banner with Campus Image Slot */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl border border-slate-800">
        <div className="absolute inset-0 opacity-25">
          <BlockImage
            imagePath="/blocks/CAMPUS_HERO.jpg"
            blockName="Presidency University Bengaluru Campus"
            category="Administrative"
            aspectRatio="aspect-auto"
            className="w-full h-full object-cover"
            imageCredit="Presidency University 64-Acre Yelahanka Campus"
            showCredit={false}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-slate-900/90 to-slate-950/95" />

        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                KlimaTwin Workflow Architecture
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Presidency University • 12 Disaggregated Campus Blocks
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Presidency Campus Sustainability Intelligence Matrix
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Unified intelligence across <strong>Solar PV Generation</strong> (~800 kWh/day), <strong>Sewage Treatment Water Recycling</strong> (300 kL/day), and <strong>Cafeteria Food Waste Vermicomposting</strong> (120-150 kg/day). Every resource stream is now tracked and simulated per building block.
            </p>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab("blocks-explorer")}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-between gap-3 transition-all"
            >
              <span>Explore 12 Blocks</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab("blocks-map")}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center justify-between gap-3 transition-all"
            >
              <span>Campus Site Map Heatmap</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Cross-Resource KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Solar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rooftop Solar</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sun className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{formatKwh(metrics.totalSolarGeneratedKwh)}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Admin 220 kWp Array • ₹{metrics.financialYieldInr.solar.toLocaleString()} yield</p>
          </div>
          <button
            onClick={() => onNavigateTab("solar")}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            <span>Solar Intelligence</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Electricity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campus Demand</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{formatKwh(metrics.totalElectricityDemandKwh)}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">12 Blocks Total • {metrics.solarSelfSufficiencyPct}% solar share</p>
          </div>
          <button
            onClick={() => onNavigateTab("blocks-explorer")}
            className="text-xs font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            <span>Block Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Water */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Water Recycled</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{(metrics.totalWaterReusedLitres / 1000).toLocaleString()} <span className="text-sm font-normal">kL</span></div>
            <p className="text-[11px] text-slate-500 mt-0.5">300 kL STP • 88% landscape reuse</p>
          </div>
          <button
            onClick={() => onNavigateTab("water")}
            className="text-xs font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            <span>Water Intelligence</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Waste */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Waste Diverted</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{metrics.totalVermicompostedKg?.toLocaleString()} <span className="text-sm font-normal">kg</span></div>
            <p className="text-[11px] text-slate-500 mt-0.5">Cafeteria organic waste vermicomposted</p>
          </div>
          <button
            onClick={() => onNavigateTab("waste")}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            <span>Waste Intelligence</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top Consuming Blocks & Blocks Needing Attention (NEW SECTION) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Consuming Blocks Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">Top Energy Consuming Campus Blocks</h3>
              <p className="text-xs text-slate-500 mt-0.5">Highest electricity draw today across the 12 facilities</p>
            </div>
            <button
              onClick={() => onNavigateTab("blocks-explorer")}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-0.5"
            >
              <span>View All 12</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topConsumingBlocks} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
                <Tooltip />
                <Bar dataKey="kwhToday" fill="#3b82f6" radius={[0, 6, 6, 0]} name="Daily Demand (kWh)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Blocks Needing Attention */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-black text-slate-900">Campus Blocks Needing Attention</h3>
              </div>
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                Active Inefficiencies
              </span>
            </div>

            <div className="space-y-2.5">
              {blocksNeedingAttention.slice(0, 4).map((b) => (
                <div
                  key={b.id}
                  onClick={() => {
                    if (onSelectBlock) onSelectBlock(b.id);
                    else onNavigateTab(`block-${b.id}`);
                  }}
                  className="p-3 rounded-xl border border-rose-100 bg-rose-50/40 hover:bg-rose-50 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{b.name}</h4>
                    <span className="text-[10px] text-slate-500 uppercase">{b.category} • Score: {b.sustainabilityScore}/100</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
                      {b.kpis.activeAlertsCount} Alert{b.kpis.activeAlertsCount > 1 ? "s" : ""}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("inefficiencies")}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Review All Campus Inefficiency Alerts</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cross-Resource Inefficiencies List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Active Detected Inefficiencies (Across Resources)</h2>
              <p className="text-xs text-slate-500">Non-accusatory baseline deviations flagged for facility investigation</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab("inefficiencies")}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
          >
            All Alerts ({overviewData.metrics.activeAnomaliesCount}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentAnomalies.map((anom) => (
            <div
              key={anom.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{anom.facilityName}</span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {anom.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200/70 text-slate-700">
                      {anom.resourceType}
                    </span>
                    <SeverityBadge severity={anom.severity} />
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {anom.reason}
                </p>

                <div className="flex items-center gap-3 text-xs font-semibold py-2 px-3 rounded-lg bg-white border border-slate-200 mb-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Observed</span>
                    <span className="text-rose-600 font-bold">{anom.observedValue} {anom.unit}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Baseline</span>
                    <span className="text-slate-700">{anom.baselineValue} {anom.unit}</span>
                  </div>
                  <div className="ml-auto text-right">
                    <span className="text-slate-400 block text-[10px]">Est. Waste</span>
                    <span className="text-emerald-700 font-extrabold">{formatInr(anom.potentialInrSavings)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                <span className="text-[11px] text-slate-400 italic">Statistical anomaly</span>
                <button
                  onClick={() => {
                    setSelectedAnomalyForAction(anom);
                    setIsActionModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                >
                  Create Action
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <CreateActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        initialData={selectedAnomalyForAction}
      />
      <DiscrepancyModal
        isOpen={isDiscrepancyModalOpen}
        onClose={() => setIsDiscrepancyModalOpen(false)}
      />
    </div>
  );
}
