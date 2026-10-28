import React, { useState } from "react";
import { 
  Map as MapIcon, 
  Layers, 
  Info, 
  Sun, 
  Droplets, 
  Zap, 
  AlertTriangle, 
  ArrowRight,
  Maximize2
} from "lucide-react";
import { useCampus } from "../context/CampusContext";
import { BlockImage } from "../components/BlockImage";

export function CampusMapPage({ onSelectBlock }) {
  const { blocks = [] } = useCampus();
  const [activeMetric, setActiveMetric] = useState("score"); // score | kwhPerSqm | alerts | electricity
  const [hoveredBlock, setHoveredBlock] = useState(null);

  // Color mapper based on metric
  const getBlockColor = (block) => {
    if (activeMetric === "score") {
      const s = block.sustainabilityScore;
      if (s >= 80) return "#10b981"; // emerald-500
      if (s >= 65) return "#14b8a6"; // teal-500
      if (s >= 50) return "#f59e0b"; // amber-500
      return "#ef4444"; // red-500
    }
    if (activeMetric === "alerts") {
      const a = block.kpis.activeAlertsCount;
      if (a === 0) return "#10b981";
      if (a === 1) return "#f59e0b";
      return "#ef4444";
    }
    if (activeMetric === "kwhPerSqm") {
      const intensity = block.kpis.kwhPerSqm;
      if (intensity <= 30) return "#10b981";
      if (intensity <= 50) return "#3b82f6";
      if (intensity <= 65) return "#f59e0b";
      return "#ef4444";
    }
    // Default: electricity
    const kwh = block.kpis.todayElectricityKwh;
    if (kwh > 1500) return "#6366f1";
    if (kwh > 800) return "#3b82f6";
    return "#06b6d4";
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-400/20 text-blue-300 border border-blue-400/30">
                Interactive Site Map
              </span>
              <span className="text-xs text-slate-300">
                64-Acre Campus Grid • Yelahanka, Bengaluru
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Presidency Campus Spatial Heatmap</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Real-time geospatial layout of all 12 academic blocks, residential towers, central food court, and utility plants. Click any block to view its deep-dive intelligence.
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/15">
            {[
              { id: "score", label: "Sustainability Score" },
              { id: "kwhPerSqm", label: "Energy Intensity" },
              { id: "alerts", label: "Active Faults" },
              { id: "electricity", label: "Daily Demand" }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveMetric(m.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeMetric === m.id
                    ? "bg-white text-slate-900 shadow-md"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map Canvas & Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SVG Site Map Canvas (3 Cols) */}
        <div className="lg:col-span-3 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[520px]">
          {/* Subtle Campus Grid & Background Accents */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          {/* Legend Strip */}
          <div className="relative z-10 flex items-center justify-between gap-4 mb-4 text-xs font-semibold text-slate-400 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-200">Active Metric:</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 uppercase tracking-wider text-[10px] font-bold">
                {activeMetric}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Exemplary (80+)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Moderate (50-79)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Action Required (&lt;50)
              </span>
            </div>
          </div>

          {/* Interactive SVG Site Map */}
          <div className="relative z-10 w-full flex-1 flex items-center justify-center">
            <svg
              viewBox="0 0 820 500"
              className="w-full h-full max-h-[460px] drop-shadow-2xl"
              style={{ overflow: "visible" }}
            >
              {/* Campus Boundary & Roads */}
              <rect x="40" y="40" width="740" height="420" rx="30" fill="#090d16" stroke="#1e293b" strokeWidth="2" strokeDasharray="6 4" />
              
              {/* Internal Ring Road Outline */}
              <rect x="70" y="70" width="680" height="360" rx="20" fill="none" stroke="#1e293b" strokeWidth="16" />
              <rect x="70" y="70" width="680" height="360" rx="20" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="8 6" />

              {/* Central Green Courtyard */}
              <circle cx="380" cy="230" r="45" fill="#064e3b" fillOpacity="0.4" stroke="#059669" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="380" y="234" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold" letterSpacing="1">
                CENTRAL LAWN
              </text>

              {/* Render Every Block */}
              {blocks.map((block) => {
                const pos = block.mapPosition || { x: 100, y: 100, width: 90, height: 70 };
                const color = getBlockColor(block);
                const isHovered = hoveredBlock?.id === block.id;

                return (
                  <g
                    key={block.id}
                    onClick={() => onSelectBlock && onSelectBlock(block.id)}
                    onMouseEnter={() => setHoveredBlock(block)}
                    className="cursor-pointer transition-transform duration-200"
                  >
                    {/* Shadow / Glow on Hover */}
                    {isHovered && (
                      <rect
                        x={pos.x - 4}
                        y={pos.y - 4}
                        width={pos.width + 8}
                        height={pos.height + 8}
                        rx="14"
                        fill={color}
                        fillOpacity="0.25"
                      />
                    )}

                    {/* Block Footprint Rectangle */}
                    <rect
                      x={pos.x}
                      y={pos.y}
                      width={pos.width}
                      height={pos.height}
                      rx="10"
                      fill="#0f172a"
                      stroke={isHovered ? "#ffffff" : color}
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      className="transition-all"
                    />

                    {/* Block Top Header Accent */}
                    <rect
                      x={pos.x}
                      y={pos.y}
                      width={pos.width}
                      height="6"
                      rx="3"
                      fill={color}
                    />

                    {/* Solar PV Indicator on ADMIN */}
                    {block.rooftopSolarKwp > 0 && (
                      <circle cx={pos.x + pos.width - 12} cy={pos.y + 14} r="5" fill="#f59e0b" />
                    )}

                    {/* Block Short Code Text */}
                    <text
                      x={pos.x + pos.width / 2}
                      y={pos.y + pos.height / 2 - 2}
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="12"
                      fontWeight="900"
                      letterSpacing="0.5"
                    >
                      {block.id}
                    </text>

                    {/* Block Subtitle / Metric Text */}
                    <text
                      x={pos.x + pos.width / 2}
                      y={pos.y + pos.height / 2 + 14}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="9"
                      fontWeight="600"
                    >
                      {activeMetric === "score" ? `Score ${block.sustainabilityScore}` :
                        activeMetric === "alerts" ? `${block.kpis.activeAlertsCount} alerts` :
                        `${block.kpis.todayElectricityKwh} kWh`}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="relative z-10 text-[10px] text-slate-500 mt-2 text-center">
            Click any block to inspect 10-tab analytical deep dive • Hover to reveal instant live telemetry
          </div>
        </div>

        {/* Selected / Hovered Block Inspector Panel (1 Col) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Facility Focus
            </div>

            {hoveredBlock ? (
              <div className="space-y-4">
                <BlockImage
                  imagePath={hoveredBlock.imagePath}
                  blockName={hoveredBlock.name}
                  category={hoveredBlock.category}
                  rooftopSolarKwp={hoveredBlock.rooftopSolarKwp}
                  aspectRatio="aspect-[16/10]"
                  className="rounded-xl shadow-xs"
                />

                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {hoveredBlock.category}
                    </span>
                    <span className="text-xs font-black text-emerald-600">
                      Score {hoveredBlock.sustainabilityScore}/100
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1.5 leading-tight">
                    {hoveredBlock.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {hoveredBlock.description}
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Built-up Area:</span>
                    <span className="font-bold text-slate-800">{hoveredBlock.builtUpAreaSqm?.toLocaleString()} m²</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Design Occupancy:</span>
                    <span className="font-bold text-slate-800">{hoveredBlock.occupancy?.toLocaleString()} persons</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Electricity Demand Today:</span>
                    <span className="font-bold text-slate-800">{hoveredBlock.kpis.todayElectricityKwh} kWh</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Energy Intensity:</span>
                    <span className="font-bold text-slate-800">{hoveredBlock.kpis.kwhPerSqm} kWh/m²</span>
                  </div>
                  {hoveredBlock.kpis.activeAlertsCount > 0 && (
                    <div className="flex justify-between py-1 text-rose-600 font-bold">
                      <span>Open Inefficiencies:</span>
                      <span>{hoveredBlock.kpis.activeAlertsCount} alerts</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onSelectBlock && onSelectBlock(hoveredBlock.id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
                >
                  <span>Open Full Block Intelligence</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                <MapIcon className="w-10 h-10 text-slate-300 stroke-1" />
                <p className="text-xs font-semibold text-slate-600">Hover or Click Any Block</p>
                <p className="text-[11px] text-slate-400">
                  Select a building block on the map canvas to inspect its energy profile and sustainability rating.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
