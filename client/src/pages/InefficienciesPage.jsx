import React, { useState } from "react";
import { 
  AlertTriangle, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Search, 
  HelpCircle,
  Building2,
  TrendingUp,
  Info,
  SlidersHorizontal
} from "lucide-react";
import { useCampus } from "../context/CampusContext";
import { formatInr, formatKwh, formatPercent } from "../utils/formatters";
import { SeverityBadge } from "../components/Badge";
import { CreateActionModal } from "../components/CreateActionModal";

export function InefficienciesPage({ onNavigateTab }) {
  const { anomalies, buildings, selectedBuilding, setSelectedBuilding, settings } = useCampus();

  const [severityFilter, setSeverityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnomalyForAction, setSelectedAnomalyForAction] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const tariff = settings?.electricityTariffInr || 8.5;

  const handleCreateAction = (anom) => {
    setSelectedAnomalyForAction(anom);
    setIsActionModalOpen(true);
  };

  const filtered = (anomalies || []).filter((a) => {
    const bId = a.facilityId || a.buildingId;
    if (selectedBuilding !== "all" && bId !== selectedBuilding) return false;
    if (severityFilter !== "all" && a.severity?.toLowerCase() !== severityFilter.toLowerCase()) return false;
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = (a.facilityName || a.buildingName || "").toLowerCase();
      const reason = (a.reason || "").toLowerCase();
      const meter = (a.meterId || "").toLowerCase();
      return name.includes(q) || reason.includes(q) || meter.includes(q);
    }
    return true;
  });

  const totalExcessKwh = filtered.reduce((acc, a) => acc + (a.potentialKwhSavings || 0), 0);
  const totalCostWaste = filtered.reduce((acc, a) => acc + (a.potentialInrSavings || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                Anomaly Engine
              </span>
              <span className="text-xs text-slate-500">
                Statistical Baseline & Operating-Hours Correlation
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Inefficiency Detection Hub</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Identifies excess electrical consumption against calibrated baselines and flags after-hours usage. All anomalies are structured as investigative findings rather than unverified equipment failures.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Identified Inefficiencies</span>
              <span className="text-xl font-extrabold text-rose-600">{filtered.length} Flagged</span>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Est. Monthly Waste</span>
              <span className="text-xl font-extrabold text-emerald-700">{formatInr(totalCostWaste)}</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search building or reasoning..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>

          {/* Building Filter */}
          <div>
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all font-medium"
            >
              <option value="all">All Campus Buildings</option>
              {(buildings || []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all font-medium"
            >
              <option value="all">All Severities</option>
              <option value="high">High Severity (&gt;60% deviation)</option>
              <option value="medium">Medium Severity</option>
              <option value="low">Low Deviation</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all font-medium"
            >
              <option value="all">All Detection Rules</option>
              <option value="AFTER_HOURS_SPIKE">After-Hours Usage</option>
              <option value="PEAK_OVERCONSUMPTION">Operating Hours Peak Spike</option>
              <option value="WEEKEND_PERSISTENT_BASELINE">Weekend Persistent Baseline</option>
              <option value="STANDBY_CREEP">Standby / Phantom Creep</option>
            </select>
          </div>
        </div>
      </div>

      {/* Anomaly Results List */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/90 shadow-xs">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Inefficiencies Match Selected Filters</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Try adjusting your search criteria or resetting filters to display all detected baseline deviations.
          </p>
          <button
            onClick={() => {
              setSelectedBuilding("all");
              setSeverityFilter("all");
              setTypeFilter("all");
              setSearchQuery("");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((anom) => (
            <div
              key={anom.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-extrabold text-sm text-slate-900">{anom.buildingName}</span>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {anom.meterId}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {anom.dateFormatted} at {anom.hour}:00
                  </span>
                  <SeverityBadge severity={anom.severity} />
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                  {anom.reason}
                </p>

                <div className="text-[11px] text-slate-400 italic flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  {anom.disclaimer}
                </div>
              </div>

              {/* Stats & Action Box */}
              <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="grid grid-cols-3 md:grid-cols-1 gap-2 text-right">
                  <div className="text-xs">
                    <span className="text-[10px] text-slate-400 block uppercase">Observed vs Baseline</span>
                    <span className="font-extrabold text-slate-900">
                      <span className="text-rose-600">{anom.observedKwh}</span> / {anom.baselineKwh} kWh
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="text-[10px] text-slate-400 block uppercase">Deviation</span>
                    <span className="font-extrabold text-amber-600">
                      +{anom.deviationPct}% (+{anom.deviationKwh} kWh)
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="text-[10px] text-slate-400 block uppercase">Estimated Waste</span>
                    <span className="font-extrabold text-emerald-700">{formatInr(anom.potentialInrSavings)}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleCreateAction(anom)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all shrink-0"
                >
                  <span>Resolve with Action</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Creation Modal */}
      <CreateActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        initialData={selectedAnomalyForAction}
      />
    </div>
  );
}
