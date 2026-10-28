import React, { useState } from "react";
import { 
  Zap, 
  IndianRupee, 
  RotateCcw, 
  Building2, 
  ShieldAlert, 
  Sun, 
  Leaf, 
  MapPin, 
  UserCheck,
  Shield,
  ChevronDown 
} from "lucide-react";
import { useCampus } from "../context/CampusContext";
import { TariffModal } from "./TariffModal";
import { DiscrepancyModal } from "./DiscrepancyModal";

export function Navbar() {
  const { 
    blocks, 
    selectedBlockId, 
    setSelectedBlockId, 
    userRole, 
    setUserRole, 
    userBlockId, 
    setUserBlockId,
    settings, 
    resetToSeedData 
  } = useCampus();

  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);
  const [isDiscrepancyModalOpen, setIsDiscrepancyModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (window.confirm("Restore Presidency University calibrated benchmark dataset (800 kWh/day solar, 300 kL STP, 120-150 kg waste across all 12 blocks)?")) {
      setIsResetting(true);
      await resetToSeedData();
      setIsResetting(false);
    }
  };

  const tariff = settings?.electricityTariffInr || 8.5;
  const co2Factor = settings?.gridCo2Factor || 0.716;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Brand & Campus Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 via-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-700/20 font-black text-xl">
              <Leaf className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 text-lg tracking-tight">ECHOTECH</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Presidency University
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                Bengaluru Campus Sustainability Platform (Yelahanka)
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Audit Flag Badge */}
            {settings?.solarDiscrepancyAuditFlag && (
              <button
                onClick={() => setIsDiscrepancyModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition-all shadow-xs"
                title="Click to inspect the published 800 kWh/day solar generation vs savings discrepancy audit"
              >
                <ShieldAlert className="w-4 h-4 text-amber-600 animate-pulse" />
                <span className="hidden sm:inline">Audit Flag:</span> 800 kWh/day Discrepancy
              </button>
            )}

            {/* Global Block Scope Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100/90 rounded-xl p-1 border border-slate-200">
              <div className="flex items-center pl-2 text-slate-500">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <select
                value={selectedBlockId}
                onChange={(e) => setSelectedBlockId(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-slate-800 pr-7 py-1 focus:ring-0 cursor-pointer"
              >
                <option value="all">All Campus (12 Blocks Aggregate)</option>
                {blocks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.shortName || b.name} ({b.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Demo Role Switcher */}
            <div className="flex items-center gap-1 bg-slate-100/90 rounded-xl p-1 border border-slate-200">
              <Shield className="w-3.5 h-3.5 ml-1.5 text-indigo-600" />
              <select
                value={userRole}
                onChange={(e) => {
                  const newRole = e.target.value;
                  setUserRole(newRole);
                  if (newRole === "BLOCK_MANAGER" && selectedBlockId === "all") {
                    setSelectedBlockId(userBlockId || "CSE");
                  }
                }}
                className="bg-transparent border-none text-xs font-semibold text-indigo-900 pr-6 py-1 focus:ring-0 cursor-pointer"
                title="Toggle between Sustainability Admin (all blocks) and Block Manager (own block)"
              >
                <option value="SUSTAINABILITY_ADMIN">Role: Sustainability Admin</option>
                <option value="BLOCK_MANAGER">Role: Block Manager (CSE)</option>
              </select>
            </div>

            {/* Configurable Tariff & Carbon Factor */}
            <button
              onClick={() => setIsTariffModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold text-emerald-800 transition-all shadow-xs"
              title="Configure BESCOM electricity tariff, water cost and CEA grid emission factor"
            >
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              <span>₹{tariff.toFixed(2)}/kWh</span>
              <span className="text-[10px] text-emerald-600 font-normal hidden md:inline">• {co2Factor} kg CO2e</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-200/60 rounded text-emerald-900 font-bold">Edit</span>
            </button>

            {/* Reset Demo Telemetry */}
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-medium text-slate-700 transition-all disabled:opacity-50"
              title="Reset Presidency University benchmark telemetry"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${isResetting ? "animate-spin" : ""}`} />
              <span className="hidden lg:inline">Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Modals */}
      <TariffModal isOpen={isTariffModalOpen} onClose={() => setIsTariffModalOpen(false)} />
      <DiscrepancyModal isOpen={isDiscrepancyModalOpen} onClose={() => setIsDiscrepancyModalOpen(false)} />
    </>
  );
}
