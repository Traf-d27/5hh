import React, { useState } from "react";
import { 
  Lightbulb, 
  TrendingDown, 
  IndianRupee, 
  CheckCircle, 
  HelpCircle, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Layers,
  Leaf
} from "lucide-react";
import { useCampus } from "../context/CampusContext";
import { formatInr, formatKwh } from "../utils/formatters";
import { TariffModal } from "../components/TariffModal";
import { CreateActionModal } from "../components/CreateActionModal";

export function RecommendationsPage({ onNavigateTab }) {
  const { recommendations, settings } = useCampus();
  const [selectedRecForAction, setSelectedRecForAction] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);

  const tariff = settings?.electricityTariffInr || 8.5;
  const recList = recommendations || [];

  const totalMonthlyKwh = recList.reduce((sum, r) => sum + (r.estimatedMonthlyResourceSavings || r.estimatedMonthlyKwh || 0), 0);
  const totalMonthlyInr = recList.reduce((sum, r) => sum + (r.estimatedMonthlyInr || 0), 0);
  const totalAnnualInr = recList.reduce((sum, r) => sum + (r.estimatedAnnualInr || 0), 0);

  const handleLaunchPlan = (rec) => {
    setSelectedRecForAction(rec);
    setIsActionModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                KlimaTwin Sustainability Nudges
              </span>
              <span className="text-xs text-slate-300">
                IPMVP Option B Measurement & Verification Aligned
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Presidency Campus Efficiency Nudges & ROI Roadmap</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Targeted engineering actions designed to eliminate recurring solar soiling, off-hours HVAC waste, STP pipeline leaks, and food court surplus.
            </p>
          </div>

          {/* ROI Aggregation Card */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 shrink-0 space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-slate-300 font-medium">Campus Potential Savings</span>
              <button
                onClick={() => setIsTariffModalOpen(true)}
                className="text-[11px] font-bold text-emerald-300 hover:text-white underline"
              >
                Tariffs Active
              </button>
            </div>
            <div className="text-2xl font-black text-emerald-300">{formatInr(totalMonthlyInr)}/month</div>
            <div className="text-xs text-slate-200">
              <span className="font-bold text-white">{formatInr(totalAnnualInr)}/year</span> projected financial yield
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="space-y-6">
        {recList.map((rec) => (
          <div
            key={rec.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden"
          >
            {/* Title & Priority Header */}
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                    {rec.id}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded">
                    {rec.facilityName || rec.buildingName}
                  </span>
                  <span className="text-xs font-semibold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded">
                    {rec.category || rec.resourceType}
                  </span>
                  {rec.confidence && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {rec.confidence}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1">{rec.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                  {rec.recommendedIntervention || rec.summary}
                </p>
              </div>

              {/* Quantified Impact Badge */}
              <div className="flex md:flex-col items-end justify-between md:justify-center gap-2 shrink-0 bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200/80 text-right">
                <div className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Target: <span className="text-emerald-700 font-black text-sm">-{rec.suggestedReductionTargetPct || rec.targetReductionPct}%</span>
                </div>
                <div className="text-base font-extrabold text-emerald-800">
                  {formatInr(rec.estimatedMonthlyInr)} <span className="text-xs font-normal text-slate-500">/ mo</span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Payback: {rec.paybackPeriodMonths} mos • {rec.annualCo2eAvoidedTons || 2.5} T CO₂e/yr
                </div>
              </div>
            </div>

            {/* Detailed 3-Column Breakdown */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
              {/* Column 1: Corrective Actions */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Engineering Intervention Steps
                </h4>
                <ul className="space-y-2 text-slate-600">
                  {(rec.correctiveActions || []).map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2: Documented Assumptions */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                  Calculation Assumptions
                </h4>
                <ul className="space-y-2 text-slate-600">
                  {(rec.assumptions || []).map((asm, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-blue-500 font-bold shrink-0">•</span>
                      <span>{asm}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: M&V Verification Protocol & CTA */}
              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 mb-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    Measurement & Verification (M&V)
                  </h4>
                  <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/70 text-slate-700 leading-relaxed">
                    {rec.verificationMethod}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleLaunchPlan(rec)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all"
                  >
                    <span>Initiate Tracked Campus Action</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <CreateActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        initialData={selectedRecForAction}
      />
      <TariffModal
        isOpen={isTariffModalOpen}
        onClose={() => setIsTariffModalOpen(false)}
      />
    </div>
  );
}
