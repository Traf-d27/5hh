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
import { MvReportModal } from "./MvReportModal";
import { generateMvReportCsv } from "../utils/mvReportGenerator";

export function Navbar({ onNavigateTab }) {
  const { 
    overviewData,
    actions,
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
  const [isMvModalOpen, setIsMvModalOpen] = useState(false);

  const selectedBlock = blocks?.find(b => b.id === selectedBlockId);

  const handleExportReport = () => {
    try {
      generateMvReportCsv({ overviewData, blocks, actions, settings });
      setIsMvModalOpen(true);
      showToast("Generated & downloaded IPMVP Option B M&V Audit CSV Report.", "success");
    } catch (err) {
      console.error(err);
      setIsMvModalOpen(true);
      showToast("Opening M&V Audit Report preview...", "info");
    }
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

          {/* Authority / Operational Role Selector */}
          <div className="relative">
            <button 
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-full hover:bg-slate-100/80 border border-slate-200/90 transition-all cursor-pointer shadow-2xs"
            >
              <div className={`w-7 h-7 rounded-full ${userRole === "SUSTAINABILITY_ADMIN" ? "bg-slate-900 text-emerald-400" : "bg-teal-800 text-white"} flex items-center justify-center font-bold text-xs shadow-2xs`}>
                {userRole === "SUSTAINABILITY_ADMIN" ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Building2 className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="hidden lg:block text-left leading-none">
                <div className="text-xs font-black text-slate-900">
                  {userRole === "SUSTAINABILITY_ADMIN" ? "Sustainability Authority" : `${userBlockId || "CSE"} Facility Authority`}
                </div>
                <div className="text-[10px] text-emerald-700 font-bold tracking-tight">
                  {userRole === "SUSTAINABILITY_ADMIN" ? "Institutional Executive" : "Zonal Block Manager"}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute top-full right-0 mt-1.5 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 text-xs animate-fade-in">
                <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/80 rounded-t-2xl">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Operational Authority</div>
                  <div className="text-xs font-black text-slate-900 mt-0.5 flex items-center justify-between">
                    <span>{userRole === "SUSTAINABILITY_ADMIN" ? "Sustainability Administrator" : `${userBlockId || "CSE"} Block Manager`}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {userRole === "SUSTAINABILITY_ADMIN" ? "Full Institution" : "Building Scope"}
                    </span>
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 block">Switch Operational Authority</span>

                  <button
                    onClick={() => {
                      setUserRole("SUSTAINABILITY_ADMIN");
                      setSelectedBlockId("");
                      setIsRoleDropdownOpen(false);
                      showToast("Active authority switched: Campus Sustainability Administrator (Full Institution Access)", "success");
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-start justify-between transition-all cursor-pointer ${
                      userRole === "SUSTAINABILITY_ADMIN" 
                        ? "bg-emerald-50/90 border border-emerald-200 text-emerald-950 font-bold" 
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Sustainability Administrator</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                        Full Institutional Authority • All 9 Blocks & SCADA
                      </div>
                    </div>
                    {userRole === "SUSTAINABILITY_ADMIN" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setUserRole("BLOCK_MANAGER");
                      setUserBlockId("CSE");
                      setSelectedBlockId("CSE");
                      setIsRoleDropdownOpen(false);
                      showToast("Active authority switched: CSE Block Facility Manager", "success");
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-start justify-between transition-all cursor-pointer ${
                      userRole === "BLOCK_MANAGER" && userBlockId === "CSE"
                        ? "bg-emerald-50/90 border border-emerald-200 text-emerald-950 font-bold" 
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>CSE Block Facility Manager</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                        Zonal Authority • Computer Science & IT Block Telemetry
                      </div>
                    </div>
                    {userRole === "BLOCK_MANAGER" && userBlockId === "CSE" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setUserRole("BLOCK_MANAGER");
                      setUserBlockId("ADMIN");
                      setSelectedBlockId("ADMIN");
                      setIsRoleDropdownOpen(false);
                      showToast("Active authority switched: Administration Block Facility Manager", "success");
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-start justify-between transition-all cursor-pointer ${
                      userRole === "BLOCK_MANAGER" && userBlockId === "ADMIN"
                        ? "bg-emerald-50/90 border border-emerald-200 text-emerald-950 font-bold" 
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Admin Block Facility Manager</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                        Zonal Authority • Central Administration Gateway Scope
                      </div>
                    </div>
                    {userRole === "BLOCK_MANAGER" && userBlockId === "ADMIN" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
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
      <MvReportModal isOpen={isMvModalOpen} onClose={() => setIsMvModalOpen(false)} />
    </>
  );
}
