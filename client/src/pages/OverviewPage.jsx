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
  Clock
} from "lucide-react";
import { useCampus } from "../context/CampusContext";
import { formatInr, formatKwh } from "../utils/formatters";
import { SeverityBadge } from "../components/Badge";
import { CreateActionModal } from "../components/CreateActionModal";
import { DiscrepancyModal } from "../components/DiscrepancyModal";

export function OverviewPage({ onNavigateTab }) {
  const { overviewData, settings } = useCampus();
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

  const { metrics, campusMeta, recentAnomalies, publishedReferences } = overviewData;
  const tariff = settings?.electricityTariffInr || 8.5;

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                KlimaTwin Workflow Architecture
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Presidency University • Bengaluru, Karnataka
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Presidency Campus Sustainability Matrix</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Unified intelligence across <strong>Solar PV Generation</strong>, <strong>Sewage Treatment Water Recycling</strong>, and <strong>Cafeteria Food Waste Vermicomposting</strong>. Calibrated against official university publications with CEA carbon accounting.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab("solar")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all"
            >
              <Sun className="w-4 h-4" />
              <span>Flagship Solar View</span>
            </button>
            <button
              onClick={() => setIsDiscrepancyModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Audit Flag</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Multi-Resource Pillar Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: Solar Generation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-amber-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Solar PV Yield</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sun className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{formatKwh(metrics.totalSolarGeneratedKwh)}</div>
            <div className="text-xs font-medium text-slate-500 mt-1">
              Ref: <span className="font-bold text-slate-700">800 kWh/day</span> (Central Admin)
            </div>
            <div className="text-[11px] text-emerald-700 font-bold mt-1">
              Yield: {formatInr(metrics.financialYieldInr.solar)} saved
            </div>
          </div>
        </div>

        {/* Pillar 2: Water STP Recycling */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-cyan-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">Wastewater Recycled</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              {(metrics.totalWaterReusedLitres / 100000).toFixed(1)} Lakh Litres
            </div>
            <div className="text-xs font-medium text-slate-500 mt-1">
              Ref: <span className="font-bold text-slate-700">300,000 L/day</span> STP Design
            </div>
            <div className="text-[11px] text-cyan-700 font-bold mt-1">
              {metrics.waterReuseRatioPct}% recycled to campus lawns
            </div>
          </div>
        </div>

        {/* Pillar 3: Waste Vermicomposting */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Food Waste Diverted</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              {metrics.totalVermicompostedKg.toLocaleString()} kg
            </div>
            <div className="text-xs font-medium text-slate-500 mt-1">
              Ref: <span className="font-bold text-slate-700">120 - 150 kg/day</span> (Cafeterias)
            </div>
            <div className="text-[11px] text-emerald-700 font-bold mt-1">
              {metrics.wasteCompostDiversionPct}% into organic vermicompost
            </div>
          </div>
        </div>

        {/* Pillar 4: CEA Net Carbon Avoidance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Avoided Emissions</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-teal-800">
              {metrics.totalCarbonAvoidedTons} Tons CO₂e
            </div>
            <div className="text-xs font-medium text-slate-500 mt-1">
              CEA India Factor: <span className="font-bold text-slate-700">{settings?.gridCo2Factor} kg/kWh</span>
            </div>
            <div className="text-[11px] text-teal-700 font-bold mt-1">
              Solar + Pumping + Methane avoided
            </div>
          </div>
        </div>
      </div>

      {/* Official Published References Transparency Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Official Presidency University Sustainability Baselines</h2>
            <p className="text-xs text-slate-500">Source: presidencyuniversity.in (Preserved with strict provenance and audit notices)</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
            Published Reference Data
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Ref 1: Solar */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                Rooftop Solar PV
              </span>
              <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                ~800 kWh/day
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              <strong>Location:</strong> {publishedReferences.solar.location}. Published figure used as empirical generation baseline.
            </p>
            <div className="pt-1 border-t border-amber-200/60">
              <button
                onClick={() => setIsDiscrepancyModalOpen(true)}
                className="text-[11px] font-bold text-amber-800 hover:text-amber-950 inline-flex items-center gap-1"
              >
                Inspect Savings Discrepancy Audit →
              </button>
            </div>
          </div>

          {/* Ref 2: Water */}
          <div className="p-4 rounded-xl border border-cyan-200 bg-cyan-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-950 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                Sewage Treatment Plant
              </span>
              <span className="font-bold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded text-[10px]">
                ~300,000 L/day
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              <strong>Facility:</strong> {publishedReferences.water.facility}. SBR treated effluent recycled for campus landscape turf irrigation.
            </p>
            <div className="pt-1 border-t border-cyan-200/60 text-[11px] text-cyan-800 font-semibold">
              Recycling 88% of daily campus wastewater
            </div>
          </div>

          {/* Ref 3: Waste */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-emerald-600" />
                Cafeteria Food Waste
              </span>
              <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                120 - 150 kg/day
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              <strong>Process:</strong> Organic cafeteria food waste layered with dry leaves for on-campus vermicomposting gardens.
            </p>
            <div className="pt-1 border-t border-emerald-200/60 text-[11px] text-emerald-800 font-semibold">
              Avoids municipal landfill methane emission
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Resource Inefficiencies Requiring Action */}
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
