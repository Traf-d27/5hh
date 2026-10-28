import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Sparkles, 
  Medal, 
  ChevronRight, 
  Building2, 
  ArrowUpDown, 
  Info 
} from "lucide-react";
import { useCampus } from "../context/CampusContext";
import { BlockImage } from "../components/BlockImage";

export function LeaderboardPage({ onSelectBlock }) {
  const [metric, setMetric] = useState("score"); // score | kwhPerSqm | kwhPerOccupant | co2
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/blocks/leaderboard?metric=${metric}`);
        const json = await res.json();
        if (json.success) setLeaderboard(json.data);
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLeaderboard();
  }, [metric]);

  const metricLabels = {
    score: "Sustainability Score (0-100)",
    kwhPerSqm: "Energy Intensity (Lowest kWh/m²)",
    kwhPerOccupant: "Consumption per Occupant (kWh/occ)",
    co2: "Carbon Footprint Today (kg CO₂e)"
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Campus Performance Ranking
              </span>
              <span className="text-xs text-slate-300">
                12 Presidency University Facilities
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Presidency Sustainability Leaderboard</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Objective rankings of campus facilities across transparent multi-resource performance indicators, recognizing efficiency leaders and highlighting facilities needing intervention.
            </p>
          </div>

          {/* Metric Selector Dropdown */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20">
            <ArrowUpDown className="w-4 h-4 text-amber-400" />
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="bg-transparent text-xs font-bold text-white border-none pr-8 py-0 focus:ring-0 cursor-pointer"
            >
              <option value="score" className="text-slate-900">Rank by: Sustainability Score</option>
              <option value="kwhPerSqm" className="text-slate-900">Rank by: Energy Intensity (kWh/m²)</option>
              <option value="kwhPerOccupant" className="text-slate-900">Rank by: Demand per Occupant</option>
              <option value="co2" className="text-slate-900">Rank by: Carbon Emission</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {leaderboard.slice(0, 3).map((b, i) => {
          const medals = [
            { label: "1st Place", color: "from-amber-400 to-yellow-600", textColor: "text-amber-300", badge: "Gold" },
            { label: "2nd Place", color: "from-slate-300 to-slate-500", textColor: "text-slate-200", badge: "Silver" },
            { label: "3rd Place", color: "from-amber-700 to-orange-800", textColor: "text-orange-300", badge: "Bronze" }
          ];
          const medal = medals[i];

          return (
            <div
              key={b.id}
              onClick={() => onSelectBlock && onSelectBlock(b.id)}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all p-5 flex flex-col justify-between space-y-4 cursor-pointer relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r ${medal.color} text-white shadow-xs`}>
                  {medal.label}
                </span>
                <span className="text-xs font-black text-emerald-700">
                  Score {b.sustainabilityScore}/100
                </span>
              </div>

              <div>
                <h3 className="font-black text-slate-900 text-lg leading-tight group-hover:text-emerald-700 transition-colors">
                  {b.name}
                </h3>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {b.category}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="bg-slate-50 p-2 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400">Intensity</div>
                  <div className="font-bold text-slate-800">{b.kpis.kwhPerSqm} kWh/m²</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400">Today's Demand</div>
                  <div className="font-bold text-slate-800">{b.kpis.todayElectricityKwh} kWh</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-black text-slate-900">Full Campus Sustainability Standings</h3>
          </div>
          <span className="text-xs text-slate-500">Sorted by: {metricLabels[metric]}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 w-12 text-center">Rank</th>
                <th className="py-3 px-4">Building Block</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Area (m²)</th>
                <th className="py-3 px-4">Energy Intensity</th>
                <th className="py-3 px-4">Daily Demand</th>
                <th className="py-3 px-4">Open Faults</th>
                <th className="py-3 px-4">Sustainability Score</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaderboard.map((b) => {
                const isTop3 = b.rank <= 3;
                return (
                  <tr
                    key={b.id}
                    onClick={() => onSelectBlock && onSelectBlock(b.id)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 text-center font-black">
                      <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs ${
                        b.rank === 1 ? "bg-amber-100 text-amber-900" :
                        b.rank === 2 ? "bg-slate-200 text-slate-800" :
                        b.rank === 3 ? "bg-orange-100 text-orange-900" :
                        "text-slate-500"
                      }`}>
                        {b.rank}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      <div className="flex items-center gap-2">
                        <span>{b.name}</span>
                        {b.isMostImproved && (
                          <span className="px-2 py-0.2 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Most Improved
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{b.category}</td>
                    <td className="py-3.5 px-4 text-slate-700">{b.builtUpAreaSqm?.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{b.kpis.kwhPerSqm} kWh/m²</td>
                    <td className="py-3.5 px-4 text-slate-800">{b.kpis.todayElectricityKwh} kWh</td>
                    <td className="py-3.5 px-4">
                      {b.kpis.activeAlertsCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                          {b.kpis.activeAlertsCount} active
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold text-[11px]">Clean</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-black">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {b.sustainabilityScore}/100
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-0.5">
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
