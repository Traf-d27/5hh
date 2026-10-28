import React, { useState } from "react";
import { 
  Building2, 
  Clock, 
  MapPin, 
  Zap, 
  IndianRupee, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders,
  Maximize2
} from "lucide-react";
import { useCampus } from "../context/CampusContext";
import { formatInr, formatKwh } from "../utils/formatters";

export function BuildingsPage({ onNavigateTab }) {
  const { buildings, selectedBuilding, setSelectedBuilding, settings } = useCampus();
  const [filterCategory, setFilterCategory] = useState("all");

  const tariff = settings?.electricityTariffInr || 8.5;

  const categories = ["all", "Academic & Heavy Labs", "Wet Labs & Clean Rooms", "Library & IT Commons", "Administrative & Executive", "Residential Hostels", "Events & Athletics"];

  const filtered = buildings.filter((b) => {
    if (filterCategory !== "all" && b.category !== filterCategory) return false;
    if (selectedBuilding !== "all" && b.id !== selectedBuilding) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              Campus Facilities & Sub-meters
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Buildings & Operating Profiles</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed energy intensity (kWh/m²), baseline parameters, sub-meter telemetry, and operational schedules.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          {selectedBuilding !== "all" && (
            <button
              onClick={() => setSelectedBuilding("all")}
              className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              Reset Building Filter
            </button>
          )}
        </div>
      </div>

      {/* Buildings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((b) => {
          const isSelected = selectedBuilding === b.id;

          return (
            <div
              key={b.id}
              className={`rounded-2xl border transition-all duration-300 bg-white overflow-hidden shadow-xs hover:shadow-md flex flex-col ${
                isSelected ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-200"
              }`}
            >
              {/* Image banner */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                <img
                  src={b.image}
                  alt={b.name}
                  className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-slate-900/80 text-white backdrop-blur-md border border-white/20">
                    {b.code}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-extrabold text-sm leading-snug drop-shadow-sm">{b.name}</h3>
                  <p className="text-[11px] text-slate-300 font-medium">{b.category}</p>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {b.description}
                </p>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Electricity</span>
                    <span className="text-sm font-extrabold text-slate-900">{formatKwh(b.totalConsumptionKwh)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Energy Cost</span>
                    <span className="text-sm font-extrabold text-emerald-700">{formatInr(b.totalCostInr)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Energy Intensity</span>
                    <span className="text-xs font-bold text-slate-700">{b.energyIntensityKwhPerSqM} kWh/m²</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Floor Area</span>
                    <span className="text-xs font-bold text-slate-700">{b.areaSqMeters.toLocaleString()} m²</span>
                  </div>
                </div>

                {/* Sub-meter & Schedule Details */}
                <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Operating Hours:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {b.operatingHours.open} - {b.operatingHours.close}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Meter Location:
                    </span>
                    <span className="font-semibold text-slate-800 truncate max-w-[170px]" title={b.meterLocation}>
                      {b.meterLocation}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Zap className="w-3.5 h-3.5 text-slate-400" />
                      Active Meter ID:
                    </span>
                    <span className="font-mono text-[11px] font-bold text-emerald-700">
                      {b.meterId}
                    </span>
                  </div>
                </div>

                {/* Inefficiency Count & Action */}
                <div className="pt-2 flex items-center justify-between">
                  {b.activeAnomaliesCount > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      {b.activeAnomaliesCount} Active Anomaly
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Normal Profile
                    </span>
                  )}

                  <button
                    onClick={() => {
                      setSelectedBuilding(b.id);
                      onNavigateTab("inefficiencies");
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    View Anomaly Analysis →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
