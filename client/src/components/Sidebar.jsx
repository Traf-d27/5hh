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
  Layers,
  Sliders,
  Brain,
  Building2,
  MapPin,
  Scale,
  Trophy,
  Database
} from "lucide-react";
import { useCampus } from "../context/CampusContext";

export function Sidebar({ currentTab, onSelectTab }) {
  const { anomalies, actions, blocks } = useCampus();

  const unresolvedCount = anomalies?.length || 0;
  const activeActionsCount = actions?.filter(a => a.status !== "Resolved" && a.status !== "Completed" && a.status !== "Verified").length || 0;
  const blockCount = blocks?.length || 12;

  const navSections = [
    {
      title: "Block Intelligence",
      items: [
        {
          id: "blocks-explorer",
          label: "Block Explorer",
          icon: Building2,
          badge: `${blockCount} Blocks`,
          badgeColor: "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
        },
        {
          id: "blocks-map",
          label: "Campus Site Map",
          icon: MapPin,
          badge: "Heatmap",
          badgeColor: "bg-blue-500/20 text-blue-300 border border-blue-400/30"
        },
        {
          id: "blocks-compare",
          label: "Block Compare",
          icon: Scale,
          badge: "Radar",
          badgeColor: "bg-teal-500/20 text-teal-300 border border-teal-400/30"
        },
        {
          id: "blocks-leaderboard",
          label: "Sustainability Rank",
          icon: Trophy,
          badge: "Score Ring",
          badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-400/30"
        }
      ]
    },
    {
      title: "Campus Resource Intelligence",
      items: [
        {
          id: "overview",
          label: "Campus Overview",
          icon: LayoutDashboard,
          badge: null
        },
        {
          id: "solar",
          label: "Solar Intelligence",
          icon: Sun,
          badge: "Flagship",
          badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-400/30"
        },
        {
          id: "water",
          label: "Water Intelligence",
          icon: Droplets,
          badge: "300 kL STP",
          badgeColor: "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
        },
        {
          id: "waste",
          label: "Waste Intelligence",
          icon: Trash2,
          badge: "Compost",
          badgeColor: "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
        }
      ]
    },
    {
      title: "AI & Intervention Intelligence",
      items: [
        {
          id: "inefficiencies",
          label: "Inefficiency Alerts",
          icon: AlertTriangle,
          badge: unresolvedCount > 0 ? unresolvedCount : null,
          badgeColor: "bg-rose-500 text-white"
        },
        {
          id: "recommendations",
          label: "Recommendations",
          icon: Lightbulb,
          badge: "KlimaTwin",
          badgeColor: "bg-teal-500/20 text-teal-300"
        },
        {
          id: "simulator",
          label: "Intervention Simulator",
          icon: Sliders,
          badge: "What-If ML",
          badgeColor: "bg-violet-500/20 text-violet-300 border border-violet-400/30"
        },
        {
          id: "ml",
          label: "ML Model Center",
          icon: Brain,
          badge: "Scikit-Learn",
          badgeColor: "bg-purple-500/20 text-purple-300 border border-purple-400/30"
        }
      ]
    },
    {
      title: "Tracking & Governance",
      items: [
        {
          id: "actions",
          label: "Action Tracking",
          icon: CheckSquare,
          badge: activeActionsCount > 0 ? activeActionsCount : null,
          badgeColor: "bg-emerald-600 text-white"
        },
        {
          id: "impact",
          label: "Impact Verification",
          icon: Award,
          badge: "IPMVP",
          badgeColor: "bg-indigo-500/20 text-indigo-300"
        },
        {
          id: "data",
          label: "Data Management",
          icon: FileSpreadsheet,
          badge: null
        },
        {
          id: "datasets",
          label: "External Datasets",
          icon: Database,
          badge: "5 Sources",
          badgeColor: "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
        }
      ]
    }
  ];

  return (
    <aside className="fixed top-[65px] left-0 bottom-0 w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 z-30 shadow-xl select-none">
      {/* Navigation with Independent Smooth Scrolling */}
      <div className="p-4 flex-1 space-y-5 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-700/80 scrollbar-track-transparent hover:scrollbar-thumb-slate-600 transition-colors">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                      : "hover:bg-slate-800 text-slate-300 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${item.badgeColor || "bg-slate-700 text-slate-300"}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sustainable Campus Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 shrink-0">
        <div className="flex items-center gap-2 mb-1.5">
          <Leaf className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-300">Presidency Green Target</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          KlimaTwin Loop: SENSE → ANALYSE → DETECT → RECOMMEND → SIMULATE → IMPLEMENT → VERIFY → LEARN.
        </p>
      </div>
    </aside>
  );
}
