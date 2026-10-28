import React, { useState } from "react";
import { X, PlusCircle, Check, Database, HelpCircle } from "lucide-react";
import { useCampus } from "../context/CampusContext";

export function ManualEntryModal({ isOpen, onClose }) {
  const { facilities, addManualEntry } = useCampus();

  const [resourceType, setResourceType] = useState("Solar");
  const [facilityId, setFacilityId] = useState(facilities[0]?.id || "bldg-admin");
  const [value, setValue] = useState("");
  const [meterId, setMeterId] = useState("MTR-MANUAL-LOG");
  const [operatorName, setOperatorName] = useState("Campus Technician");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!value || isNaN(Number(value))) return;

    setIsSubmitting(true);
    const selectedBldg = facilities.find(f => f.id === facilityId);

    const payload = {
      resourceType,
      facilityId,
      facilityName: selectedBldg?.name || facilityId,
      value: Number(value),
      meterId,
      operatorName,
      notes: notes || `Manual log for ${resourceType} telemetry`,
      timestamp: new Date().toISOString()
    };

    const res = await addManualEntry(payload);
    setIsSubmitting(false);
    if (res) onClose();
  };

  const getUnit = () => {
    if (resourceType === "Water") return "Litres (L)";
    if (resourceType === "Waste") return "Kilograms (kg)";
    return "Kilowatt-Hours (kWh)";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-emerald-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Manual Telemetry Ingestion</h3>
              <p className="text-xs text-slate-500">Classification: IMPORTED_MEASUREMENT</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Resource Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Resource Type *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {["Solar", "Electricity", "Water", "Waste"].map((res) => (
                <button
                  key={res}
                  type="button"
                  onClick={() => setResourceType(res)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all text-center ${
                    resourceType === res
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          {/* Facility */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Campus Facility *
            </label>
            <select
              value={facilityId}
              onChange={(e) => setFacilityId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 font-medium"
            >
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Value */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Observed Measurement Value ({getUnit()}) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. 740"
                className="w-full px-3.5 py-2.5 text-sm font-bold rounded-xl border border-slate-200 focus:border-emerald-500 bg-slate-50 focus:bg-white"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">
                {getUnit()}
              </span>
            </div>
          </div>

          {/* Meter & Operator */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Meter ID Tag
              </label>
              <input
                type="text"
                value={meterId}
                onChange={(e) => setMeterId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Logged By
              </label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Operational Field Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Verified via digital flow meter or rooftop pyranometer"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? "Ingesting..." : "Ingest Reading"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
