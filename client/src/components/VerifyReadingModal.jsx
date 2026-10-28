import React, { useState } from "react";
import { X, Award, CheckCircle2, TrendingDown, IndianRupee, HelpCircle } from "lucide-react";
import { useCampus } from "../context/CampusContext";
import { formatInr, formatKwh } from "../utils/formatters";

export function VerifyReadingModal({ isOpen, onClose, action }) {
  const { updateAction, settings } = useCampus();
  const [status, setStatus] = useState(action?.status || "Resolved");
  const [verifiedKwhSavings, setVerifiedKwhSavings] = useState(
    action?.verifiedKwhSavings || action?.potentialKwhSavings || 1200
  );
  const [currentReading, setCurrentReading] = useState(
    action?.currentReading || "Sub-meter baseline down to expected level following intervention"
  );
  const [verificationNotes, setVerificationNotes] = useState(action?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !action) return null;

  const tariff = settings?.electricityTariffInr || 8.5;
  const verifiedInr = Math.round(Number(verifiedKwhSavings) * tariff);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const updates = {
      status,
      verifiedKwhSavings: Number(verifiedKwhSavings),
      verifiedInrSavings: verifiedInr,
      currentReading,
      notes: verificationNotes
    };

    const res = await updateAction(action.id, updates);
    setIsSubmitting(false);
    if (res) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-emerald-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Verify Action & Log Readings</h3>
              <p className="text-xs text-slate-500">{action.id} • {action.buildingName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Action Title</div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">{action.title}</div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Lifecycle Stage
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["Open", "In Progress", "Resolved"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    status === s
                      ? s === "Resolved"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                        : "bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Before-and-After Comparison */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Before & After Measurements (M&V)</span>
              <span className="text-[11px] font-normal text-slate-500">IPMVP Protocol</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 block">Baseline (Pre-Intervention):</span>
                <span className="font-semibold text-slate-800 block mt-0.5">{action.baselinePeriod || "Observed anomaly level"}</span>
                <span className="text-rose-600 font-bold block mt-1">Target: {formatKwh(action.potentialKwhSavings)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-700 block font-medium">Post-Intervention Result:</span>
                <span className="font-bold text-emerald-900 block mt-0.5">Verified Savings</span>
                <span className="text-emerald-700 font-bold block mt-1">{formatKwh(verifiedKwhSavings)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Post-Intervention Meter Log / Audit Proof
              </label>
              <input
                type="text"
                required
                value={currentReading}
                onChange={(e) => setCurrentReading(e.target.value)}
                placeholder="e.g. Sub-meter LIB-003 avg 14.2 kWh during weekend inspection"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Verified kWh Savings Input */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                Verified kWh Reduction Achieved
              </label>
              <span className="text-xs font-semibold text-emerald-700">₹{tariff.toFixed(2)}/kWh</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  step="10"
                  required
                  value={verifiedKwhSavings}
                  onChange={(e) => setVerifiedKwhSavings(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base font-bold rounded-xl border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
                <span className="absolute right-3 top-3 text-xs font-bold text-slate-400">kWh</span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-slate-500 block">Verified INR Value</span>
                <span className="text-lg font-extrabold text-emerald-700">{formatInr(verifiedInr)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Field Completion Notes
            </label>
            <textarea
              rows={2}
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              placeholder="Sign off by maintenance lead, contractor confirmation, etc."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? "Saving..." : "Confirm & Record Savings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
