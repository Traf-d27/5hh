import React, { useState } from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Search, 
  Building2,
  TrendingUp,
  Info,
  SlidersHorizontal,
  Droplets,
  Zap,
  Trash2,
  ShieldCheck
} from "lucide-react";
import { useCampus } from "../context/CampusContext";
import { formatInr } from "../utils/formatters";
import { SeverityBadge } from "../components/Badge";
import { CreateActionModal } from "../components/CreateActionModal";

export function InefficienciesPage({ onNavigateTab }) {
  const { anomalies = [], blocks = [], facilities = [], selectedBlockId, setSelectedBlockId, settings } = useCampus();

  const [selectedBlock, setSelectedBlock] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");
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
    const bId = a.blockId || a.facilityId || a.buildingId;
    if (selectedBlock !== "all" && bId !== selectedBlock) return false;
    if (resourceFilter !== "all" && a.resourceType?.toLowerCase() !== resourceFilter.toLowerCase()) return false;
    if (severityFilter !== "all" && a.severity?.toLowerCase() !== severityFilter.toLowerCase()) return false;
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = (a.facilityName || a.buildingName || a.blockId || "").toLowerCase();
      const reason = (a.reason || "").toLowerCase();
      const meter = (a.meterId || "").toLowerCase();
      const type = (a.type || "").toLowerCase();
      const resource = (a.resourceType || "").toLowerCase();
      return name.includes(q) || reason.includes(q) || meter.includes(q) || type.includes(q) || resource.includes(q);
    }
    return true;
  });

  const totalCostWaste = filtered.reduce((acc, a) => acc + (a.potentialInrSavings || 0), 0);

  // Group blocks for dropdown
  const blockOptions = blocks.length > 0 ? blocks : [
    { id: "ADMIN", name: "Administrative Block" },
    { id: "CSE", name: "Computer Science & IT Block" },
    { id: "ENGG", name: "Engineering Labs Complex" },
    { id: "STP", name: "Sewage Treatment Plant & Utilities" },
    { id: "FOOD", name: "Central Food Court & Mess" },
    { id: "HOSTEL_G", name: "Girls Hostels Campus" },
    { id: "HOSTEL_B", name: "Boys Hostels Campus" }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Cross-Campus Inefficiency Hub
              </span>
              <span className="text-xs text-slate-500">
                Presidency University Telemetry Baseline & Operating Schedule Correlation
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Inefficiency & Anomaly Detection</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Real-time statistical baselining across electrical sub-meters, STP landscape recycling, and cafeteria food waste. All deviations are structured as prioritized investigative findings with actionable resolutions.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Identified Inefficiencies</span>
              <span className="text-xl font-extrabold text-rose-600">{filtered.length} Flagged</span>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Est. Financial Waste</span>
              <span className="text-xl font-extrabold text-emerald-700">{formatInr(totalCostWaste)}</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search building, meter or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all font-medium"
            />
          </div>

          {/* Block Filter */}
          <div>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all font-medium text-slate-700"
            >
              <option value="all">All Campus Blocks ({(anomalies || []).length})</option>
              {blockOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.id})
                </option>
              ))}
            </select>
          </div>

          {/* Resource Filter */}
          <div>
            <select
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all font-medium text-slate-700"
            >
              <option value="all">All Resource Streams</option>
              <option value="electricity">⚡ Electricity</option>
              <option value="water">💧 Water & STP</option>
              <option value="waste">🌱 Waste & Vermicomposting</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all font-medium text-slate-700"
            >
              <option value="all">All Severities</option>
              <option value="high">High Severity</option>
              <option value="medium">Medium Severity</option>
              <option value="low">Low Deviation</option>
            </select>
          </div>

          {/* Type / Rule Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all font-medium text-slate-700 truncate"
            >
              <option value="all">All Anomaly Rules</option>
              <option value="AFTER_HOURS_OVERCONSUMPTION">After-Hours Lab Overconsumption</option>
              <option value="WEEKEND_AC_OVERRUN">Weekend Split AC Overrun</option>
              <option value="CHILLER_PEAK_SPIKE">Chiller Compressor Peak Spike</option>
              <option value="IRRIGATION_LINE_LEAKAGE">STP Recycled Irrigation Leak</option>
              <option value="DOMESTIC_WATER_LEAK">Overnight Domestic Supply Leak</option>
              <option value="FOOD_WASTE_SURPLUS_SPIKE">Cafeteria Food Waste Spike</option>
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
              setSelectedBlock("all");
              setResourceFilter("all");
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
          {filtered.map((anom) => {
            const observed = anom.observedValue ?? anom.observedKwh ?? 0;
            const baseline = anom.baselineValue ?? anom.baselineKwh ?? 0;
            const unit = anom.unit || (anom.resourceType?.toLowerCase() === "water" ? "Litres" : anom.resourceType?.toLowerCase() === "waste" ? "kg" : "kWh");
            const absDev = anom.absoluteDeviation ?? anom.deviationKwh ?? 0;
            const pctDev = anom.percentageDeviation ?? anom.deviationPct ?? 0;
            const title = anom.facilityName || anom.buildingName || anom.blockId || "Campus Facility";

            return (
              <div
                key={anom.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-extrabold text-sm text-slate-900">{title}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {anom.meterId || anom.blockId}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {anom.timestamp || `${anom.dateFormatted || ''}${anom.hour !== undefined ? ` at ${anom.hour}:00` : ''}`}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {anom.resourceType || "Electricity"}
                    </span>
                    <SeverityBadge severity={anom.severity} />
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    {anom.reason}
                  </p>

                  <div className="text-[11px] text-slate-400 italic flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{anom.disclaimer || "Statistical flow and load divergence analysis."}</span>
                  </div>
                </div>

                {/* Stats & Action Box */}
                <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="grid grid-cols-3 md:grid-cols-1 gap-2 text-right">
                    <div className="text-xs">
                      <span className="text-[10px] text-slate-400 block uppercase">Observed vs Baseline</span>
                      <span className="font-extrabold text-slate-900">
                        <span className="text-rose-600">{typeof observed === "number" ? observed.toLocaleString() : observed}</span> / {typeof baseline === "number" ? baseline.toLocaleString() : baseline} {unit}
                      </span>
                    </div>
                    <div className="text-xs">
                      <span className="text-[10px] text-slate-400 block uppercase">Deviation</span>
                      <span className="font-extrabold text-amber-600">
                        +{pctDev}% (+{typeof absDev === "number" ? absDev.toLocaleString() : absDev} {unit})
                      </span>
                    </div>
                    <div className="text-xs">
                      <span className="text-[10px] text-slate-400 block uppercase">Estimated Waste</span>
                      <span className="font-extrabold text-emerald-700">{formatInr(anom.potentialInrSavings || 0)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCreateAction(anom)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all shrink-0 cursor-pointer"
                  >
                    <span>Resolve with Action</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
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
