import React, { useState, useEffect } from "react";
import { X, CheckCircle, Calendar, User, Zap, AlertTriangle, ArrowRight } from "lucide-react";
import { useCampus } from "../context/CampusContext";
import { formatInr, formatKwh } from "../utils/formatters";

export function CreateActionModal({ isOpen, onClose, initialData = null }) {
  const { buildings, createAction, settings } = useCampus();

  const [title, setTitle] = useState("");
  const [buildingId, setBuildingId] = useState("");
  const [priority, setPriority] = useState("High");
  const [assignedTo, setAssignedTo] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [potentialKwhSavings, setPotentialKwhSavings] = useState(0);
  const [baselinePeriod, setBaselinePeriod] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const list = buildings || [];
    if (initialData) {
      setTitle(initialData.title || `Resolve: ${initialData.type || "Inefficiency Anomaly"}`);
      setBuildingId(initialData.facilityId || initialData.buildingId || (list[0]?.id || "bldg-admin"));
      setPriority(initialData.severity || "High");
      setPotentialKwhSavings(initialData.potentialResourceSavings || initialData.potentialKwhSavings || initialData.estimatedMonthlyResourceSavings || 1200);
      setBaselinePeriod(initialData.timestamp || initialData.dateFormatted ? `Anomaly recorded on ${initialData.timestamp || initialData.dateFormatted}` : "Current operational baseline");
      setNotes(initialData.reason || initialData.summary || "");
    } else {
      setTitle("");
      setBuildingId(list[0]?.id || "bldg-admin");
      setPriority("Medium");
      setPotentialKwhSavings(1000);
      setBaselinePeriod("Pre-intervention baseline");
      setNotes("");
    }
    // Set default target date 7 days ahead
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setTargetDate(d.toISOString().split("T")[0]);
    setAssignedTo("Campus Sustainability Officer");
  }, [initialData, buildings, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !buildingId) return;

    setIsSubmitting(true);
    const list = buildings || [];
    const selectedBldg = list.find(b => b.id === buildingId);

    const payload = {
      title,
      buildingId,
      buildingName: selectedBldg?.name || buildingId,
      recommendationId: initialData?.id?.startsWith("REC") ? initialData.id : null,
      priority,
      assignedTo,
      targetDate,
      notes,
      potentialKwhSavings: Number(potentialKwhSavings),
      baselinePeriod,
      status: "Open"
    };

    const res = await createAction(payload);
    setIsSubmitting(false);
    if (res) onClose();
  };

  const tariff = settings?.electricityTariffInr || 8.5;
  const potentialInr = Math.round(potentialKwhSavings * tariff);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-emerald-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Create Corrective Action</h3>
              <p className="text-xs text-slate-500">Convert detected inefficiency into a verifiable initiative</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Action Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Install timer relay on Admin HVAC split-units"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Building & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Facility *
              </label>
              <select
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all"
              >
                {(buildings || []).map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all"
              >
                <option value="High">High (Immediate ROI)</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Assignee & Target Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Assigned Engineer / Team
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="e.g. Electrical Maintenance"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Resolution Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Savings Projection Card */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                Target Potential Savings
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold text-emerald-800">{formatKwh(potentialKwhSavings)}</span>
                <span className="text-slate-400">•</span>
                <span className="text-lg font-bold text-emerald-700">{formatInr(potentialInr)}</span>
              </div>
              <div className="text-[11px] text-emerald-700 mt-0.5">
                Based on active tariff ₹{tariff.toFixed(2)}/kWh
              </div>
            </div>
            <div className="w-32">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target kWh</label>
              <input
                type="number"
                min="0"
                step="50"
                value={potentialKwhSavings}
                onChange={(e) => setPotentialKwhSavings(e.target.value)}
                className="w-full px-2.5 py-1 text-sm font-semibold rounded-lg border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Baseline Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Pre-Intervention Baseline Reference
            </label>
            <input
              type="text"
              value={baselinePeriod}
              onChange={(e) => setBaselinePeriod(e.target.value)}
              placeholder="e.g. Continuous 48 kWh/hr observed draw during weekend shutdown"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all"
            />
          </div>

          {/* Action Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Engineering Notes / Scope of Work
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detail corrective actions, equipment models, or vendor instructions..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              {isSubmitting ? "Creating..." : "Save Action Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
