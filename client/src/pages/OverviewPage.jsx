import React, { useState } from "react";
import { 
  Sun, 
  Droplets, 
  Trash2, 
  Leaf, 
  IndianRupee, 
  AlertTriangle, 
  ArrowRight, 
  ShieldAlert, 
  Sparkles, 
  TrendingUp, 
  Building2,
  Clock,
  Layers,
  ChevronRight,
  Sliders,
  FileSpreadsheet,
  Activity,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  PlusCircle,
  Zap,
  Radio,
  FileText
} from "lucide-react";
import { useCampus } from "../context/CampusContext";
import { formatInr, formatKwh } from "../utils/formatters";
import { BlockImage } from "../components/BlockImage";

export function OverviewPage({ onNavigateTab, onSelectBlock }) {
  const { overviewData, blocks, showToast } = useCampus();
  const [activeFilter, setActiveFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    showToast("Polling campus SCADA streams and sub-meter registers...", "info");
    setTimeout(() => {
      setIsRefreshing(false);
      showToast("Telemetry stream refreshed: 1,682 sensors synchronized.", "success");
    }, 800);
  };

  const filterOptions = [
    { id: "all", label: "All Blocks (9)" },
    { id: "admin", label: "Admin & Academic Courtyard" },
    { id: "lib", label: "Central Library & Knowledge Hub" },
    { id: "food", label: "Student Mess & Dining Pavilion" }
  ];

  // Map blocks to the 3 featured card clusters from the reference screenshot
  const featuredCards = [
    {
      id: "CSE",
      tag: "220 kWp Solar PV",
      statusTag: "Anomaly Active",
      statusColor: "bg-rose-500 text-white",
      zone: "Block 1 • Academic Zone",
      title: "Presidency University — Academic Courtyard & Innovation Wing",
      image: "/blocks/CSE.jpg",
      stats: [
        { label: "Generation Today", val: "842 kWh", sub: "PR: 0.74 (Nominal 0.80)" },
        { label: "Daily Energy Draw", val: "1,420 kWh", sub: "11kV BESCOM Grid" }
      ],
      badges: [
        { label: "Peak Load: 285 kW", color: "text-slate-700 bg-slate-100" },
        { label: "Self-Gen: 59.3%", color: "text-emerald-700 bg-emerald-50 border border-emerald-200" }
      ]
    },
    {
      id: "LIB",
      tag: "Central Library Hub",
      statusTag: "Sensors: 99.8%",
      statusColor: "bg-cyan-500 text-white",
      zone: "Block 2 • Knowledge Campus",
      title: "Central University Library & Digital Learning Center",
      image: "/blocks/LIB.jpg",
      stats: [
        { label: "Daily Energy Draw", val: "195 kWh", sub: "Smart Lighting Auto" },
        { label: "HVAC & Air Quality", val: "24.0°C", sub: "CO2: 460 ppm (Optimal)" }
      ],
      badges: [
        { label: "Occupancy: 480 Seats", color: "text-slate-700 bg-slate-100" },
        { label: "100% LED Daylight Dim", color: "text-emerald-700 bg-emerald-50 border border-emerald-200" }
      ]
    },
    {
      id: "FOOD",
      tag: "Aerobic Digester 01",
      statusTag: "94% Conversion",
      statusColor: "bg-emerald-600 text-white",
      zone: "Block 4 • Food Services",
      title: "Student Mess & Dining Pavilion",
      image: "/blocks/FOOD.jpg",
      stats: [
        { label: "Food Waste Diverted", val: "118 kg/d", sub: "86% to Compost" },
        { label: "Offset Footprint", val: "224.2 kg", sub: "CO2e Offset Today" }
      ],
      badges: [
        { label: "Capacity: 2,800 Meals/d", color: "text-slate-700 bg-slate-100" },
        { label: "Zero-Landfill Path", color: "text-emerald-700 bg-emerald-50 border border-emerald-200" }
      ]
    }
  ];

  // Benchmarking table rows from reference screenshot
  const tableRows = [
    {
      id: "ADMIN",
      avatarLetter: "A",
      avatarBg: "bg-emerald-100 text-emerald-800 border-emerald-300",
      name: "Central Administration & Campus Gateway",
      subCode: "PU-ADM-01 • HT Substation #1",
      area: "18,450 m²",
      solarKwp: "220 kWp",
      solarHighlight: true,
      dailyEnergy: "1,420 kWh",
      waterReuse: "145 kL / d",
      wasteDiverted: "42 kg / d",
      peakLoad: "285 kW",
      ratingLabel: "A+",
      ratingScore: 92,
      ratingBadge: "bg-emerald-100 text-emerald-800 border-emerald-300"
    },
    {
      id: "CSE",
      avatarLetter: "E",
      avatarBg: "bg-blue-100 text-blue-800 border-blue-300",
      name: "Academic Courtyard & School of Engineering",
      subCode: "PU-ENG-01 • Academic Quad Intertie",
      area: "32,800 m²",
      solarKwp: "140 kWp",
      dailyEnergy: "2,850 kWh",
      waterReuse: "210 kL / d",
      wasteDiverted: "85 kg / d",
      peakLoad: "540 kW",
      peakAlert: true,
      ratingLabel: "A",
      ratingScore: 88,
      ratingBadge: "bg-blue-100 text-blue-800 border-blue-300"
    },
    {
      id: "LIB",
      avatarLetter: "L",
      avatarBg: "bg-teal-100 text-teal-800 border-teal-300",
      name: "Central Library & Knowledge Hub",
      subCode: "PU-LIB-01 • Smart Lighting Automation",
      area: "8,600 m²",
      solarKwp: "30 kWp",
      dailyEnergy: "195 kWh",
      waterReuse: "60 kL / d",
      wasteDiverted: "8 kg / d",
      peakLoad: "42 kW",
      ratingLabel: "A+",
      ratingScore: 95,
      ratingBadge: "bg-emerald-100 text-emerald-800 border-emerald-300"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ─── 1. BREADCRUMBS & SECTION TITLE ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1 flex items-center gap-1.5">
            <span>GOVERNANCE & ANALYTICS</span>
            <span>/</span>
            <span>CAMPUS INFRASTRUCTURE</span>
            <span>/</span>
            <span className="text-emerald-700 font-extrabold">BLOCK-WISE TELEMETRY</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Presidency University — Campus Infrastructure Intelligence
          </h1>
        </div>

        {/* Polling & Refresh Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            SCADA Sync: Active
          </span>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
            <span>1,682 Sensors Polling</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400">Latency: 12ms</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-600" : "text-slate-500"}`} />
            <span>Refresh Stream</span>
          </button>
        </div>
      </div>

      {/* Filter Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filterOptions.map((f) => {
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/90"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* ─── 2. MAIN CAMPUS HERO CARD (CENTRAL GATEWAY) ────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white shadow-lg border border-slate-800/80">
        {/* Background Image with Dark Teal Gradient Overlay */}
        <div className="absolute inset-0">
          <BlockImage
            imagePath="/blocks/CAMPUS_HERO.jpg"
            blockName="Presidency University Bengaluru Central Campus"
            category="Administrative"
            aspectRatio="aspect-auto"
            className="w-full h-full object-cover opacity-35"
            showCredit={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-teal-950/70" />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 p-6 md:p-8 space-y-6">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                FLAGSHIP INFRASTRUCTURE
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-slate-300 border border-white/15">
                BLOCK ID: PU-ADM-01
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-800 text-[11px] font-medium text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Live: <strong>801 kW</strong> Invertion</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 font-bold">Grid Synced: OK</span>
            </div>
          </div>

          {/* Title & Description & CTA */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 max-w-4xl">
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" />
                CENTRAL CAMPUS MICROGRID SUBSTATION
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Presidency University — Central Campus & Main Administration Gateway
              </h2>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl font-normal">
                Central campus gateway featuring the grand ceremonial fountain plaza, deanery wings, and central microgrid monitoring node. Integrated with 220 kWp solar PV canopy arrays and high-voltage grid interconnection.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                onClick={() => onNavigateTab && onNavigateTab("simulator")}
                className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
                <span>Run What-If Simulation</span>
              </button>

              <button
                onClick={() => onSelectBlock && onSelectBlock("ADMIN")}
                className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 backdrop-blur-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-300" />
                <span>Inverter Logs</span>
              </button>
            </div>
          </div>

          {/* Bottom KPI Tiles Strip (6 Tiles inside hero) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3">
            {/* Tile 1 */}
            <div className="p-3 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80">
              <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">SOLAR ARRAY</div>
              <div className="text-xl font-black text-emerald-400 mt-0.5">220 kWp</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Rooftop Biaxial</div>
            </div>

            {/* Tile 2 */}
            <div className="p-3 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80">
              <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">GENERATION TODAY</div>
              <div className="text-xl font-black text-white mt-0.5">842 kWh</div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">▲ +8.4% vs Baseline</div>
            </div>

            {/* Tile 3 */}
            <div className="p-3 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80">
              <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">PERFORMANCE RATIO</div>
              <div className="text-xl font-black text-white mt-0.5">PR 0.74</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Target: 0.80</div>
            </div>

            {/* Tile 4 */}
            <div className="p-3 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80">
              <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">HT CONNECTION</div>
              <div className="text-xl font-black text-white mt-0.5">11 kV</div>
              <div className="text-[10px] text-slate-400 mt-0.5">BESCOM Intertie</div>
            </div>

            {/* Tile 5 */}
            <div className="p-3 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80">
              <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">ENERGY CONSUMED</div>
              <div className="text-xl font-black text-white mt-0.5">1,420 kWh/d</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Daily Avg Run</div>
            </div>

            {/* Tile 6 */}
            <div className="p-3 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-rose-900/50">
              <div className="text-[9px] font-bold uppercase text-rose-400 tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                ANOMALY
              </div>
              <div className="text-xl font-black text-rose-400 mt-0.5">-18.2%</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Soiling Alert</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. ACTIVE CAMPUS BLOCKS PORTFOLIO (3-COLUMN CARDS) ─────────────────── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
              <span>INFRASTRUCTURE CLUSTERS</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400">Real-time Stream</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Campus Blocks Portfolio</h2>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Click any block card to highlight live telemetry diagnostics & sub-meter breakdown.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredCards.map((card) => (
            <div
              key={card.id}
              onClick={() => onSelectBlock && onSelectBlock(card.id)}
              className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
            >
              {/* Card Image with Badges & Title Overlay */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                <BlockImage
                  imagePath={card.image}
                  blockName={card.title}
                  category={card.zone}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  showCredit={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Top Pill Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-emerald-400/30 flex items-center gap-1">
                    <Sun className="w-3 h-3 text-emerald-400" />
                    {card.tag}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${card.statusColor}`}>
                    {card.statusTag}
                  </span>
                </div>

                {/* Bottom Overlay Title */}
                <div className="absolute bottom-3 left-3 right-3 space-y-0.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    {card.zone}
                  </div>
                  <h3 className="text-sm font-black text-white line-clamp-1 leading-snug">
                    {card.title}
                  </h3>
                </div>
              </div>

              {/* Card Body KPIs */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {card.stats.map((s, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="text-[10px] font-bold uppercase text-slate-400">{s.label}</div>
                      <div className="text-base font-black text-slate-900">{s.val}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{s.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Lower Badges */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
                  {card.badges.map((b, bIdx) => (
                    <span key={bIdx} className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${b.color}`}>
                      {b.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">
                  Inspect Sub-meters
                </span>
                <div className="w-6 h-6 rounded-full bg-emerald-500 group-hover:bg-emerald-600 text-white flex items-center justify-center transition-all shadow-xs">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 4. BLOCK TELEMETRY BENCHMARKING TABLE ───────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        {/* Table Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Block Telemetry Benchmarking & ESG Ratings
            </h3>
            <p className="text-xs text-slate-500">
              Verified parameters aggregated via Schneider Electric ION meters & Kamstrup ultrasonic telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              ISO 50001 Calibrated
            </span>
            <button
              onClick={() => showToast("Downloading aggregated CSV raw telemetry dump...", "info")}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV Raw Dump</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th className="py-3 px-3">BLOCK IDENTIFIER</th>
                <th className="py-3 px-3">GROSS FLOOR AREA</th>
                <th className="py-3 px-3">SOLAR PV (KWP)</th>
                <th className="py-3 px-3">DAILY ENERGY (KWH)</th>
                <th className="py-3 px-3">WATER RECYCLING (KL)</th>
                <th className="py-3 px-3">WASTE DIVERTED</th>
                <th className="py-3 px-3">PEAK LOAD</th>
                <th className="py-3 px-3 text-right">AUDIT RATING</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableRows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onSelectBlock && onSelectBlock(row.id)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  {/* Block Name + Identifier */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 border ${row.avatarBg}`}>
                        {row.avatarLetter}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {row.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {row.subCode}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Floor Area */}
                  <td className="py-3.5 px-3 font-semibold text-slate-600">
                    {row.area}
                  </td>

                  {/* Solar PV */}
                  <td className="py-3.5 px-3 font-bold">
                    <span className={row.solarHighlight ? "text-emerald-700 font-black" : "text-slate-700"}>
                      {row.solarKwp}
                    </span>
                  </td>

                  {/* Daily Energy */}
                  <td className="py-3.5 px-3 font-bold text-slate-800">
                    {row.dailyEnergy}
                  </td>

                  {/* Water Recycling */}
                  <td className="py-3.5 px-3 font-semibold text-slate-600">
                    {row.waterReuse}
                  </td>

                  {/* Waste Diverted */}
                  <td className="py-3.5 px-3 font-semibold text-slate-600">
                    {row.wasteDiverted}
                  </td>

                  {/* Peak Load */}
                  <td className="py-3.5 px-3 font-bold">
                    <span className={row.peakAlert ? "text-rose-600 font-black" : "text-slate-800"}>
                      {row.peakLoad}
                    </span>
                  </td>

                  {/* Audit Rating Badge */}
                  <td className="py-3.5 px-3 text-right">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${row.ratingBadge}`}>
                      {row.ratingLabel} (Score: {row.ratingScore})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 5. CAMPUS EXPANSION PROTOCOL BANNER (BOTTOM) ────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-teal-950 via-slate-950 to-emerald-950 text-white p-8 border border-teal-900/50 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              <span>▶▶</span>
              <span>CAMPUS EXPANSION PROTOCOL 2026</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Deploy IoT Telemetry Sensor Pods across Presidency University Blocks
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Seamlessly expand telemetry coverage to School of Law, Hostels 1–4, and the Sports Complex. Provision wireless LoRaWAN edge bridges with zero downtime.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab && onNavigateTab("data")}
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Request Sensor Provisioning</span>
            </button>

            <button
              onClick={() => onNavigateTab && onNavigateTab("blocks-explorer")}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 backdrop-blur-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>View Device Registry</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
