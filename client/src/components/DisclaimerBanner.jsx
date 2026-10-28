import React, { useState } from "react";
import { ShieldCheck, Info, X, Sparkles } from "lucide-react";
import { useCampus } from "../context/CampusContext";

export function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { settings } = useCampus();

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white px-4 py-2.5 text-xs font-medium border-b border-emerald-700/50 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-semibold tracking-wide uppercase">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          Hackathon Prototype Mode
        </span>
        <span className="text-slate-200">
          <strong>Transparency Notice:</strong> All baseline profiles and telemetry readings shown originate from a physics-calibrated synthetic campus simulation model. No unverified live metering claims are made without authorized hardware tap.
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-2">
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          title="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
