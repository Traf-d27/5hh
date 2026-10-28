import React, { useState } from "react";
import { 
  Building2, 
  ChevronDown, 
  Sliders, 
  Download, 
  Bell, 
  Zap, 
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { useCampus } from "../context/CampusContext";
import { TariffModal } from "./TariffModal";
import { DiscrepancyModal } from "./DiscrepancyModal";

export function Navbar({ onNavigateTab }) {
  const { 
    blocks, 
    selectedBlockId, 
    setSelectedBlockId, 
    userRole, 
    setUserRole, 
    userBlockId, 
    setUserBlockId,
    settings, 
    resetToSeedData,
    showToast
  } = useCampus();

  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);
  const [isDiscrepancyModalOpen, setIsDiscrepancyModalOpen] = useState(false);
  const [isBlockDropdownOpen, setIsBlockDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const selectedBlock = blocks?.find(b => b.id === selectedBlockId);

  const handleExportReport = () => {
    showToast("Generating comprehensive IPMVP Option B Campus Sustainability M&V Report (PDF/CSV)...", "info");
    setTimeout(() => {
      showToast("Campus M&V Report downloaded successfully.", "success");
    }, 1200);
  };

  return (
    <>
      <header className="sticky top-0 z-30 ml-60 bg-white/95 backdrop-blur-md border-b border-slate-200/90 h-14 flex items-center justify-between px-6 select-none shadow-2xs">
        {/* Left Side: All Blocks Selector + Grid Net Load Status */}
        <div className="flex items-center gap-3">
          {/* All Blocks Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsBlockDropdownOpen(!isBlockDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold border border-slate-200/90 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{selectedBlockId ? `${selectedBlock?.name || selectedBlockId}` : "All Blocks"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {isBlockDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-50 animate-fade-in text-xs">
                <button
                  onClick={() => { setSelectedBlockId(""); setIsBlockDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2 font-bold hover:bg-slate-50 flex items-center justify-between ${!selectedBlockId ? "text-emerald-600 bg-emerald-50/50" : "text-slate-800"}`}
                >
                  <span>All Campus Blocks (Aggregated)</span>
                  {!selectedBlockId && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
                <div className="border-t border-slate-100 my-1" />
                <div className="max-h-60 overflow-y-auto">
                  {blocks?.map(b => (
                    <button
                      key={b.id}
                      onClick={() => { setSelectedBlockId(b.id); setIsBlockDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between ${selectedBlockId === b.id ? "text-emerald-600 bg-emerald-50/50 font-bold" : "text-slate-700"}`}
                    >
                      <span className="truncate">{b.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono ml-2 shrink-0">{b.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Grid Net Load Pill Status */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-medium text-slate-600">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Grid Net Load: <strong className="text-slate-900 font-bold">412 kW</strong></span>
          </div>
        </div>

        {/* Right Side: What-If Simulation + Export M&V + Notifications + Profile */}
        <div className="flex items-center gap-2.5">
          {/* What-If Simulator Quick Button */}
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab("simulator")}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>What-If Simulator</span>
            </button>
          )}

          {/* Export M&V Report Emerald Button */}
          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export M&V Report</span>
          </button>

          {/* Notifications Bell */}
          <button 
            onClick={() => onNavigateTab && onNavigateTab("inefficiencies")}
            className="relative w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 border border-slate-200/80 transition-colors"
            title="3 Active Inefficiency Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
          </button>

          {/* User Profile / Role Indicator */}
          <div className="relative">
            <button 
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full hover:bg-slate-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-800 to-slate-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                RS
              </div>
              <div className="hidden lg:block text-left leading-none">
                <div className="text-xs font-bold text-slate-900">Dr. R. Sharma</div>
                <div className="text-[10px] text-slate-400 font-medium">Sustainability Officer</div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute top-full right-0 mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-fade-in">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <div className="font-bold text-slate-900">Dr. R. Sharma</div>
                  <div className="text-[10px] text-slate-400">Head of Campus Sustainability</div>
                </div>
                <div className="px-3 py-2 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Switch Role (RBAC)</span>
                  <button
                    onClick={() => { setUserRole("SUSTAINABILITY_ADMIN"); setIsRoleDropdownOpen(false); }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between ${userRole === "SUSTAINABILITY_ADMIN" ? "bg-emerald-50 text-emerald-800 font-bold" : "hover:bg-slate-50 text-slate-700"}`}
                  >
                    <span>Campus Admin (Full)</span>
                    {userRole === "SUSTAINABILITY_ADMIN" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => { setUserRole("BLOCK_MANAGER"); setUserBlockId("CSE"); setIsRoleDropdownOpen(false); }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between ${userRole === "BLOCK_MANAGER" ? "bg-emerald-50 text-emerald-800 font-bold" : "hover:bg-slate-50 text-slate-700"}`}
                  >
                    <span>CSE Block Manager</span>
                    {userRole === "BLOCK_MANAGER" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      <TariffModal isOpen={isTariffModalOpen} onClose={() => setIsTariffModalOpen(false)} />
      <DiscrepancyModal isOpen={isDiscrepancyModalOpen} onClose={() => setIsDiscrepancyModalOpen(false)} />
    </>
  );
}
