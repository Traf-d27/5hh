import React, { useState } from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from "recharts";
import { 
  Zap, 
  Sun, 
  Droplets, 
  Trash2, 
  TrendingUp, 
  Calendar, 
  Info, 
  Layers, 
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";
import { formatInr } from "../utils/formatters";

export function InteractiveCampusChart({ solarData, waterData, wasteData, onNavigateTab }) {
  const [selectedStream, setSelectedStream] = useState("electricity"); // electricity | water | waste
  const [timeWindow, setTimeWindow] = useState("14d"); // 24h | 7d | 14d

  // Prepare chart data based on stream and time window
  let chartData = [];
  let yAxisFormatter = (v) => `${v}`;
  let tooltipFormatter = (val, name) => [val, name];

  if (selectedStream === "electricity") {
    if (timeWindow === "24h" && solarData?.diurnalCurve?.length) {
      chartData = solarData.diurnalCurve;
      yAxisFormatter = (v) => `${v} kW`;
    } else {
      const source = solarData?.dailyTrend || [];
      const sliceCount = timeWindow === "7d" ? 7 : 14;
      chartData = source.slice(-sliceCount).map((d) => ({
        date: d.date,
        solarKwh: d.actualKwh || 0,
        expectedKwh: d.expectedKwh || 800,
        baselineReference: 800,
        shortfallKwh: d.shortfallKwh || 0
      }));
      yAxisFormatter = (v) => `${v} kWh`;
    }
  } else if (selectedStream === "water") {
    const source = waterData?.dailyTrend || [];
    const sliceCount = timeWindow === "7d" ? 7 : 14;
    chartData = source.slice(-sliceCount).map((d) => ({
      date: d.date,
      treatedLitres: d.treatedLitres || 300000,
      reusedLitres: d.reusedLitres || 264000,
      baselineRef: 300000
    }));
    yAxisFormatter = (v) => `${(v / 1000).toFixed(0)} kL`;
  } else if (selectedStream === "waste") {
    const source = wasteData?.dailyTrend || [];
    const sliceCount = timeWindow === "7d" ? 7 : 14;
    chartData = source.slice(-sliceCount).map((d) => ({
      date: d.date,
      foodWasteKg: d.foodWasteKg || 135,
      vermicompostedKg: d.vermicompostedKg || 120,
      divertedKg: d.divertedKg || 250,
      baselineRef: 135
    }));
    yAxisFormatter = (v) => `${v} kg`;
  }

  // Custom Rich Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs min-w-[220px] space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span className="font-extrabold text-slate-200">
            {timeWindow === "24h" && selectedStream === "electricity" ? `Time: ${label}` : `Date: ${label}`}
          </span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            SCADA Verified
          </span>
        </div>

        <div className="space-y-1.5">
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-300 font-medium">{entry.name}:</span>
              </div>
              <span className="font-mono font-bold text-white">
                {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}{" "}
                {selectedStream === "electricity" ? (timeWindow === "24h" ? "kW" : "kWh") : selectedStream === "water" ? "L" : "kg"}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Presidency Campus SCADA</span>
          <span className="text-emerald-400">±0.5% Calibrated</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-5">
      {/* Chart Top Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Interactive Telemetry Visualizer
            </span>
            <span className="text-xs text-slate-400">Real-Time Sub-meter Register Explorer</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Cross-Resource Consumption & Operational Trajectories
          </h2>
        </div>

        {/* Stream & Window Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Stream Selector Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold border border-slate-200/80">
            <button
              onClick={() => setSelectedStream("electricity")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedStream === "electricity" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Electricity & Solar</span>
            </button>
            <button
              onClick={() => setSelectedStream("water")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedStream === "water" ? "bg-white text-cyan-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-cyan-600" />
              <span>Water & STP</span>
            </button>
            <button
              onClick={() => setSelectedStream("waste")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedStream === "waste" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Food Waste</span>
            </button>
          </div>

          {/* Time Window Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200/80">
            {selectedStream === "electricity" && (
              <button
                onClick={() => setTimeWindow("24h")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  timeWindow === "24h" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                24H Diurnal
              </button>
            )}
            <button
              onClick={() => setTimeWindow("7d")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                timeWindow === "7d" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeWindow("14d")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                timeWindow === "14d" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              14 Days
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Recharts Chart Area */}
      <div className="h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {selectedStream === "electricity" && timeWindow === "24h" ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hourFormatted" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={yAxisFormatter} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
              <Area 
                type="monotone" 
                dataKey="campusDemandKw" 
                stroke="#059669" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#demandGradient)" 
                name="Campus Total Demand (kW)"
                activeDot={{ r: 6, fill: "#059669", stroke: "#fff", strokeWidth: 2 }}
              />
              <Area 
                type="monotone" 
                dataKey="solarGenerationKw" 
                stroke="#d97706" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#solarGradient)" 
                name="220 kWp Solar PV (kW)"
                activeDot={{ r: 6, fill: "#d97706", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          ) : selectedStream === "electricity" ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="kwhGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={yAxisFormatter} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
              <ReferenceLine y={800} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: "Published Benchmark 800 kWh", fill: "#64748b", fontSize: 10, position: "top" }} />
              <Area 
                type="monotone" 
                dataKey="solarKwh" 
                stroke="#10b981" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#kwhGradient)" 
                name="Actual Solar Generation (kWh)"
                activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="expectedKwh" 
                stroke="#0ea5e9" 
                strokeWidth={2} 
                strokeDasharray="5 5" 
                dot={false}
                name="Clear-Sky Expected Generation (kWh)" 
              />
            </AreaChart>
          ) : selectedStream === "water" ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={yAxisFormatter} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
              <ReferenceLine y={300000} stroke="#0284c7" strokeDasharray="4 4" label={{ value: "STP Design Capacity 300 kL", fill: "#0369a1", fontSize: 10 }} />
              <Bar dataKey="treatedLitres" fill="#0891b2" name="Treated Wastewater (Litres)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="reusedLitres" fill="#10b981" name="Landscape Irrigation (Litres)" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="wasteGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="compostGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={yAxisFormatter} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
              <ReferenceLine y={150} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: "Upper Band 150 kg", fill: "#e11d48", fontSize: 10 }} />
              <Area type="monotone" dataKey="foodWasteKg" stroke="#e11d48" strokeWidth={2} fillOpacity={1} fill="url(#wasteGrad)" name="Food Waste Generated (kg)" activeDot={{ r: 6 }} />
              <Area type="monotone" dataKey="vermicompostedKg" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#compostGrad)" name="Vermicomposted Organic (kg)" activeDot={{ r: 6 }} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart Footer with Direct Navigation Action */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Presidency University Published Baselines Active</span>
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Interval SCADA sampling: 15-minute registers</span>
        </div>

        <button
          onClick={() => {
            if (onNavigateTab) {
              if (selectedStream === "electricity") onNavigateTab("solar");
              else if (selectedStream === "water") onNavigateTab("water");
              else if (selectedStream === "waste") onNavigateTab("waste");
            }
          }}
          className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
        >
          <span>Open Full {selectedStream === "electricity" ? "Solar PV" : selectedStream === "water" ? "Water & STP" : "Vermicompost"} Intelligence</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
