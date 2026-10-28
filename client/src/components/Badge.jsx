import React from "react";

export function SeverityBadge({ severity }) {
  if (severity === "High") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
        High Severity
      </span>
    );
  }
  if (severity === "Medium") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        Medium Severity
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
      Low Deviation
    </span>
  );
}

export function StatusBadge({ status }) {
  if (status === "Resolved") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
        Resolved & Verified
      </span>
    );
  }
  if (status === "In Progress") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-300">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping"></span>
        In Progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
      Open Action
    </span>
  );
}

export function DataSourceBadge({ isSynthetic, dataSource }) {
  if (isSynthetic) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200" title={dataSource}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        Calibrated Demo Model
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-800 border border-purple-200" title={dataSource}>
      <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
      Imported Meter CSV
    </span>
  );
}
