import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { useCampus } from "../context/CampusContext";

export function ToastContainer() {
  const { toasts, removeToast } = useCampus();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        let bg = "bg-slate-900 text-white border-slate-700";
        let icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;

        if (toast.type === "success") {
          bg = "bg-emerald-950/95 text-emerald-100 border-emerald-500/40 shadow-emerald-900/20";
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
        } else if (toast.type === "error") {
          bg = "bg-rose-950/95 text-rose-100 border-rose-500/40 shadow-rose-900/20";
          icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
        } else if (toast.type === "warning") {
          bg = "bg-amber-950/95 text-amber-100 border-amber-500/40 shadow-amber-900/20";
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${bg}`}
          >
            {icon}
            <div className="flex-1 text-sm font-medium leading-snug">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-0.5 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
