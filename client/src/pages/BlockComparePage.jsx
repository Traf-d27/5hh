import React, { useState, useEffect } from "react";
import { 
  Scale, 
  Building2, 
  BarChart2, 
  Layers, 
  Info, 
  Check, 
  TrendingUp, 
  ArrowRight 
} from "lucide-react";
import { 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { useCampus } from "../context/CampusContext";
import { BlockImage } from "../components/BlockImage";

const ACCENT_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"];

export function BlockComparePage({ onSelectBlock }) {
  const { blocks = [] } = useCampus();
  const [selectedIds, setSelectedIds] = useState(["ADMIN", "CSE", "ENGG"]);
  const [compareData, setCompareData] = useState(null);
  const [metric, setMetric] = useState("kwhPerSqm");

  const toggleBlock = (id) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 2) setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      if (selectedIds.length < 4) setSelectedIds([...selectedIds, id]);
    }
  };

  useEffect(() => {
    async function fetchComparison() {
      try {
        const res = await fetch(`/api/blocks/compare?ids=${selectedIds.join(",")}&metric=${metric}`);
        const json = await res.json();
        if (json.success) setCompareData(json.data);
      } catch (err) {
        console.error("Comparison fetch failed:", err);
      }
    }
    if (selectedIds.length >= 2) fetchComparison();
  }, [selectedIds, metric]);

  const selectedBlocks = blocks.filter(b => selectedIds.includes(b.id));

  // Bar chart data
  const barChartData = selectedBlocks.map(b => ({
    name: b.shortName,
    id: b.id,
    "Energy Intensity (kWh/m²)": b.kpis.kwhPerSqm,
    "Daily Demand (kWh/10)": Math.round(b.kpis.todayElectricityKwh / 10),
    "Sustainability Score": b.sustainabilityScore
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-400/20 text-teal-300 border border-teal-400/30">
            Multi-Facility Benchmarking
          </span>
          <span className="text-xs text-slate-300">
            Select 2 to 4 campus blocks to cross-compare
          </span>
        </div>
        <h1 className="text-2xl font-black tracking-tight">Presidency Campus Block Comparison Matrix</h1>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
          Side-by-side multi-dimensional benchmarking across energy intensity, rooftop solar integration, water conservation, and waste management.
        </p>
      </div>

      {/* Block Selector Chips */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Selected Blocks ({selectedIds.length} of 4 max):</span>
          <span className="text-slate-400 font-normal">Click a chip to toggle selection</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {blocks.map((b) => {
            const isSelected = selectedIds.includes(b.id);
            return (
              <button
                key={b.id}
                onClick={() => toggleBlock(b.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{b.shortName}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>
                  {b.sustainabilityScore}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Benchmarking: Radar & Grouped Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart (5 Axes) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-900">Multi-Dimensional Sustainability Radar</h3>
            <p className="text-xs text-slate-500 mt-0.5">Energy, Solar, Water, Waste & Fault Penalty normalized (0-100)</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={90} data={compareData?.radarCategories?.map(cat => {
                const row = { subject: cat.subject };
                (compareData?.radarData || []).forEach(d => {
                  row[d.name] = d[cat.subject];
                });
                return row;
              }) || []}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#475569" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                {selectedBlocks.map((b, idx) => (
                  <Radar
                    key={b.id}
                    name={b.shortName}
                    dataKey={b.shortName}
                    stroke={ACCENT_COLORS[idx % ACCENT_COLORS.length]}
                    fill={ACCENT_COLORS[idx % ACCENT_COLORS.length]}
                    fillOpacity={0.25}
                  />
                ))}
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grouped Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-900">Intensity & Overall Score Benchmark</h3>
            <p className="text-xs text-slate-500 mt-0.5">Energy Intensity (kWh/m²) vs Overall Sustainability Score (0-100)</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Energy Intensity (kWh/m²)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Sustainability Score" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Side-by-Side Tabular KPI Comparison */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900">Tabular KPI Breakdown</h3>
          <span className="text-xs text-slate-500">Cross-comparison metrics</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Metric / Parameter</th>
                {selectedBlocks.map(b => (
                  <th key={b.id} className="py-3 px-4 font-bold text-slate-900">{b.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-500">Category</td>
                {selectedBlocks.map(b => (
                  <td key={b.id} className="py-3 px-4 font-bold text-slate-800">{b.category}</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-500">Built-up Area</td>
                {selectedBlocks.map(b => (
                  <td key={b.id} className="py-3 px-4 text-slate-800">{b.builtUpAreaSqm?.toLocaleString()} m²</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-500">Design Occupancy</td>
                {selectedBlocks.map(b => (
                  <td key={b.id} className="py-3 px-4 text-slate-800">{b.occupancy?.toLocaleString()} persons</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-500">Daily Electricity Demand</td>
                {selectedBlocks.map(b => (
                  <td key={b.id} className="py-3 px-4 font-bold text-slate-900">{b.kpis.todayElectricityKwh} kWh</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-500">Annual Energy Intensity</td>
                {selectedBlocks.map(b => (
                  <td key={b.id} className="py-3 px-4 font-bold text-slate-900">{b.kpis.kwhPerSqm} kWh/m²</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-500">Rooftop Solar PV Array</td>
                {selectedBlocks.map(b => (
                  <td key={b.id} className="py-3 px-4 text-slate-800">
                    {b.rooftopSolarKwp > 0 ? `${b.rooftopSolarKwp} kWp (~800 kWh/day)` : "—"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-500">Active Inefficiencies</td>
                {selectedBlocks.map(b => (
                  <td key={b.id} className="py-3 px-4">
                    {b.kpis.activeAlertsCount > 0 ? (
                      <span className="font-bold text-rose-600">{b.kpis.activeAlertsCount} alerts</span>
                    ) : (
                      <span className="text-emerald-600 font-semibold">0 (Normal)</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr className="bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-800">Sustainability Score (0-100)</td>
                {selectedBlocks.map(b => (
                  <td key={b.id} className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-100 text-emerald-800">
                      {b.sustainabilityScore}/100
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
