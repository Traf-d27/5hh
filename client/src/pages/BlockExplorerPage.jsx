import React, { useState, useMemo } from "react";
import { 
  Building2, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Sun, 
  Droplets, 
  Trash2, 
  AlertTriangle, 
  CheckSquare, 
  ChevronRight,
  MapPin,
  LayoutGrid,
  Map as MapIcon,
  ShieldCheck,
  Zap,
  Info
} from "lucide-react";
import { useCampus } from "../context/CampusContext";
import { BlockImage } from "../components/BlockImage";

export function BlockExplorerPage({ onSelectBlock, onNavigateTab }) {
  const { blocks = [], selectedBlockId, setSelectedBlockId } = useCampus();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("score"); // score | intensity | alerts | name

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set(blocks.map(b => b.category));
    return ["all", ...Array.from(set)];
  }, [blocks]);

  // Filtered & Sorted Blocks
  const filteredBlocks = useMemo(() => {
    return blocks
      .filter(b => {
        const matchesCat = selectedCategory === "all" || b.category === selectedCategory;
        const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "score") return b.sustainabilityScore - a.sustainabilityScore;
        if (sortBy === "intensity") return a.kpis.kwhPerSqm - b.kpis.kwhPerSqm; // lower is better
        if (sortBy === "alerts") return b.kpis.activeAlertsCount - a.kpis.activeAlertsCount;
        return a.name.localeCompare(b.name);
      });
  }, [blocks, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                12 Campus Facilities
              </span>
              <span className="text-xs text-slate-300">
                Calibrated to Presidency University published references
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Presidency Campus Block Explorer</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Explore electricity, solar, water, and waste intelligence disaggregated for every building block across the 64-acre Yelahanka campus.
            </p>
          </div>

          {/* Quick View Toggle */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/15">
            <button
              onClick={() => onNavigateTab && onNavigateTab("blocks-map")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Campus Site Map</span>
            </button>
            <button
              onClick={() => onNavigateTab && onNavigateTab("blocks-compare")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            >
              <span>Side-by-Side Compare</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search block by name or code..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 border-none pr-6 py-0 focus:ring-0 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All Categories" : c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 border-none pr-6 py-0 focus:ring-0 cursor-pointer"
            >
              <option value="score">Sort by: Sustainability Score</option>
              <option value="intensity">Sort by: Energy Intensity (Low to High)</option>
              <option value="alerts">Sort by: Active Alerts (High to Low)</option>
              <option value="name">Sort by: Name (A-Z)</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium ml-auto">
            Showing <strong>{filteredBlocks.length}</strong> of {blocks.length} blocks
          </div>
        </div>
      </div>

      {/* Responsive Block Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredBlocks.map((block) => {
          const score = block.sustainabilityScore;
          const scoreColor = score >= 80 ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
            score >= 65 ? "text-teal-600 bg-teal-50 border-teal-200" :
            score >= 50 ? "text-amber-600 bg-amber-50 border-amber-200" :
            "text-rose-600 bg-rose-50 border-rose-200";

          return (
            <div
              key={block.id}
              onClick={() => {
                if (onSelectBlock) onSelectBlock(block.id);
                else if (onNavigateTab) onNavigateTab(`block-${block.id}`);
              }}
              className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
            >
              {/* Photo Banner with Fallback */}
              <div className="relative">
                <BlockImage
                  imagePath={block.imagePath}
                  blockName={block.name}
                  category={block.category}
                  rooftopSolarKwp={block.rooftopSolarKwp}
                  imageCredit={block.imageCredit}
                  aspectRatio="aspect-[16/10]"
                  showCredit={false}
                />

                {/* Score Ring Badge Overlay */}
                <div className="absolute top-2.5 right-2.5">
                  <div className={`px-2.5 py-1 rounded-xl font-black text-xs border shadow-sm backdrop-blur-md ${scoreColor}`}>
                    Score {score}/100
                  </div>
                </div>

                {/* Inefficiency Badge Overlay */}
                {block.kpis.activeAlertsCount > 0 && (
                  <div className="absolute top-2.5 left-2.5">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-md animate-pulse">
                      <AlertTriangle className="w-3 h-3" />
                      {block.kpis.activeAlertsCount} Alert{block.kpis.activeAlertsCount > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>

              {/* Block Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {block.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {block.builtUpAreaSqm?.toLocaleString()} m² • {block.floors} Fl
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-emerald-700 transition-colors">
                    {block.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {block.description}
                  </p>
                </div>

                {/* Daily KPIs Strip */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                  <div className="p-1.5 rounded-lg bg-slate-50">
                    <div className="text-[10px] text-slate-400 font-medium">Electricity</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">{block.kpis.todayElectricityKwh} <span className="text-[9px] font-normal">kWh</span></div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50">
                    <div className="text-[10px] text-slate-400 font-medium">Intensity</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">{block.kpis.kwhPerSqm} <span className="text-[9px] font-normal">kWh/m²</span></div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50">
                    <div className="text-[10px] text-slate-400 font-medium">Water</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">{block.kpis.todayWaterLitres > 0 ? `${Math.round(block.kpis.todayWaterLitres / 1000)}k` : "—"} <span className="text-[9px] font-normal">L</span></div>
                  </div>
                </div>

                {/* Open Block CTA */}
                <div className="pt-2 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                  <span>Inspect Block Analysis</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
