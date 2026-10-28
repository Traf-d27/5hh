import React from "react";
import { 
  LayoutDashboard, 
  Sun, 
  Droplets, 
  Trash2, 
  AlertTriangle, 
  Lightbulb, 
  CheckSquare, 
  Award, 
  FileSpreadsheet,
  Leaf,
  Sliders,
  Brain,
  Building2,
  MapPin,
  Scale,
  Trophy,
  Database,
  CloudSun
} from "lucide-react";
import { useCampus } from "../context/CampusContext";

export function Sidebar({ currentTab, onSelectTab }) {
  const { anomalies, actions } = useCampus();

  const unresolvedCount = anomalies?.filter(a => !a.resolved)?.length || 3;

  const navItems = [
    {
      id: "overview",
      label: "Campus Overview",
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: "solar",
      label: "Solar PV & Energy",
      icon: Sun,
      badge: null
    },
    {
      id: "water",
      label: "Water & STP Recycling",
      icon: Droplets,
      badge: null
    },
    {
      id: "waste",
      label: "Waste & Vermicompost",
      icon: Trash2,
      badge: null
    },
    {
      id: "inefficiencies",
      label: "Inefficiencies & Anomalies",
      icon: AlertTriangle,
      badge: unresolvedCount > 0 ? unresolvedCount : null,
      badgeColor: "bg-rose-500 text-white"
    },
    {
      id: "simulator",
      label: "What-If Simulator",
      icon: Sliders,
      badge: null
    },
    {
      id: "ml",
      label: "ML Intelligence Center",
      icon: Brain,
      badge: null
    },
    {
      id: "actions",
      label: "Action Tracking & M&V",
      icon: CheckSquare,
      badge: null
    },
    {
      id: "data",
      label: "Transparency & Data",
      icon: FileSpreadsheet,
      badge: null
    },
    {
      id: "blocks-explorer",
      label: "Block Explorer",
      icon: Building2,
      badge: "12 Blocks",
      badgeColor: "bg-slate-100 text-slate-600 border border-slate-200"
    },
    {
      id: "datasets",
      label: "External Datasets",
      icon: Database,
      badge: "5 Sources",
      badgeColor: "bg-cyan-50 text-cyan-700 border border-cyan-200"
    }
  ];

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-60 bg-white text-slate-700 flex flex-col shrink-0 border-r border-slate-200/90 z-40 select-none shadow-xs">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-900 to-emerald-600 text-white flex items-center justify-center font-black shadow-xs">
            <Leaf className="w-4 h-4 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-black text-slate-900 text-base tracking-tight">ECHOTECH</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight mt-0.5">
              Sustainability Platform
            </p>
          </div>
        </div>
      </div>

      {/* Campus Identity Badge Card */}
      <div className="p-3">
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-800 tracking-tight">Presidency University</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            Yelahanka, BLR • 64-Acre Campus
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100/80 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Live Telemetry
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-cyan-50 text-cyan-800 border border-cyan-200">
              STP: 88%
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links with Smooth Scrolling */}
      <div className="px-3 py-1 flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent hover:scrollbar-thumb-slate-300">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-slate-100 text-slate-900 font-bold border border-slate-200/90 shadow-2xs"
                  : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== null && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${item.badgeColor || "bg-slate-200 text-slate-700"}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Weather & Location Widget at Bottom */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/60 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Yelahanka Weather
            </div>
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <span>28°C · Clear Sky</span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
            <CloudSun className="w-4 h-4" />
          </div>
        </div>
      </div>
    </aside>
  );
}
