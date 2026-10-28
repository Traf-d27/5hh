import React, { useState } from "react";
import { 
  CheckSquare, 
  Plus, 
  TrendingDown, 
  Award, 
  Clock, 
  User, 
  Calendar, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  HelpCircle,
  Filter,
  BarChart3,
  Layers
} from "lucide-react";
import { useCampus } from "../context/CampusContext";
import { formatInr, formatKwh, formatDateOnly } from "../utils/formatters";
import { StatusBadge } from "../components/Badge";
import { CreateActionModal } from "../components/CreateActionModal";
import { VerifyReadingModal } from "../components/VerifyReadingModal";

export function ActionTrackerPage() {
  const { actions, deleteAction, updateAction, settings } = useCampus();

  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [verifyModalAction, setVerifyModalAction] = useState(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const tariff = settings?.electricityTariffInr || 8.5;

  const actionList = actions || [];
  const totalPotentialKwh = actionList.reduce((sum, a) => sum + (Number(a.potentialResourceSavings || a.potentialKwhSavings) || 0), 0);
  const totalPotentialInr = actionList.reduce((sum, a) => sum + (Number(a.potentialInrSavings) || 0), 0);

  const resolvedActions = actionList.filter(a => a.status === "Resolved");
  const totalVerifiedKwh = resolvedActions.reduce((sum, a) => sum + (Number(a.verifiedResourceSavings || a.verifiedKwhSavings) || 0), 0);
  const totalVerifiedInr = resolvedActions.reduce((sum, a) => sum + (Number(a.verifiedInrSavings) || 0), 0);

  const handleOpenVerifyModal = (action) => {
    setVerifyModalAction(action);
    setIsVerifyModalOpen(true);
  };

  const handleQuickStatusChange = async (action, newStatus) => {
    if (newStatus === "Resolved") {
      handleOpenVerifyModal(action);
    } else {
      await updateAction(action.id, { status: newStatus });
    }
  };

  const filteredActions = actionList.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                Action & Savings Verification
              </span>
              <span className="text-xs text-slate-500">
                Lifecycle: Open → In Progress → Resolved & Verified
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Campus Sustainability Action Tracker</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Track corrective initiatives from anomaly detection through resolution. Record post-intervention meter readings to prove real ROI and distinguish potential savings from verified savings.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Initiative</span>
          </button>
        </div>

        {/* Realized ROI vs Projected ROI Summary */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Initiatives</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{actions.length} Tracked</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {resolvedActions.length} Resolved • {actions.length - resolvedActions.length} Active
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Identified Potential Savings</span>
            <div className="text-2xl font-extrabold text-amber-900 mt-1">{formatInr(totalPotentialInr)}</div>
            <div className="text-[11px] text-amber-700 font-medium mt-0.5">
              {formatKwh(totalPotentialKwh)} projected target
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Verified Realized Savings</span>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">{formatInr(totalVerifiedInr)}</div>
            <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">
              {formatKwh(totalVerifiedKwh)} empirically validated
            </div>
          </div>

          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">Verification Rate</span>
            <div className="text-2xl font-extrabold text-teal-800 mt-1">
              {totalPotentialKwh > 0 ? Math.round((totalVerifiedKwh / totalPotentialKwh) * 100) : 0}%
            </div>
            <div className="text-[11px] text-teal-700 font-medium mt-0.5">
              Realized ROI efficiency
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-5 flex items-center gap-2">
          {["all", "Open", "In Progress", "Resolved"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === tab
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab === "all" ? "All Actions" : tab} ({
                tab === "all" ? actions.length : actions.filter(a => a.status === tab).length
              })
            </button>
          ))}
        </div>
      </div>

      {/* Action Cards List */}
      {filteredActions.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Initiatives In This Filter</h3>
          <p className="text-xs text-slate-500 mt-1">Select another lifecycle status or create a new corrective action.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredActions.map((action) => (
            <div
              key={action.id}
              className={`bg-white rounded-2xl border p-5 transition-all shadow-xs hover:shadow-md flex flex-col justify-between ${
                action.status === "Resolved"
                  ? "border-emerald-200 bg-emerald-50/15"
                  : "border-slate-200"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {action.id}
                    </span>
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {action.facilityName || action.buildingName}
                    </span>
                    <StatusBadge status={action.status} />
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      action.priority === "High" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {action.priority} Priority
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">{action.title}</h3>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {action.notes || "No additional notes provided."}
                  </p>

                  {/* Metadata: Assignee, Target Date */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
                    <span className="flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {action.assignedTo || "Unassigned"}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Target: {action.targetDate ? formatDateOnly(action.targetDate) : "-"}
                    </span>
                    {action.baselinePeriod && (
                      <span className="text-[11px] text-slate-400">
                        Baseline: {action.baselinePeriod}
                      </span>
                    )}
                  </div>
                </div>

                {/* Savings & Readings Column */}
                <div className="flex md:flex-col items-end justify-between gap-3 shrink-0 bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-[220px]">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Potential Savings</span>
                    <span className="text-sm font-bold text-slate-800">
                      {formatKwh(action.potentialKwhSavings)} ({formatInr(action.potentialInrSavings)})
                    </span>
                  </div>

                  <div className="text-right pt-2 border-t border-slate-200/80 w-full">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block flex items-center justify-end gap-1">
                      <Award className="w-3 h-3" />
                      Verified Realized Savings
                    </span>
                    <span className="text-base font-extrabold text-emerald-700">
                      {action.verifiedKwhSavings > 0
                        ? `${formatKwh(action.verifiedKwhSavings)} (${formatInr(action.verifiedInrSavings)})`
                        : "Pending Verification"}
                    </span>
                  </div>

                  {action.currentReading && (
                    <div className="text-[11px] text-slate-500 font-medium text-right max-w-[200px] truncate" title={action.currentReading}>
                      Log: {action.currentReading}
                    </div>
                  )}
                </div>
              </div>

              {/* Lifecycle Stage Switcher & Verification Logger */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-semibold mr-1">Move Status:</span>
                  {["Open", "In Progress", "Resolved"].map((s) => (
                    <button
                      key={s}
                      disabled={action.status === s}
                      onClick={() => handleQuickStatusChange(action, s)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                        action.status === s
                          ? "bg-slate-200 text-slate-400 cursor-default"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleOpenVerifyModal(action)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Log Readings & Verify</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete action "${action.title}"?`)) {
                        deleteAction(action.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg"
                    title="Delete action"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateActionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <VerifyReadingModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        action={verifyModalAction}
      />
    </div>
  );
}
