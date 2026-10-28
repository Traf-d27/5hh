import React, { useState } from "react";
import {
  Building2,
  Cpu,
  GraduationCap,
  PenTool,
  BookMarked,
  Home,
  Utensils,
  Trophy,
  Theater,
  Droplets,
  Sun,
  Layers
} from "lucide-react";

const CATEGORY_STYLES = {
  "Administrative": {
    icon: Building2,
    gradient: "from-amber-600 via-amber-700 to-slate-900",
    border: "border-amber-500/30",
    badge: "bg-amber-500/20 text-amber-200"
  },
  "Academic-Lab": {
    icon: Cpu,
    gradient: "from-violet-600 via-indigo-700 to-slate-900",
    border: "border-violet-500/30",
    badge: "bg-violet-500/20 text-violet-200"
  },
  "Academic": {
    icon: GraduationCap,
    gradient: "from-blue-600 via-indigo-800 to-slate-900",
    border: "border-blue-500/30",
    badge: "bg-blue-500/20 text-blue-200"
  },
  "Academic-Studio": {
    icon: PenTool,
    gradient: "from-teal-600 via-cyan-800 to-slate-900",
    border: "border-teal-500/30",
    badge: "bg-teal-500/20 text-teal-200"
  },
  "Library": {
    icon: BookMarked,
    gradient: "from-emerald-600 via-teal-800 to-slate-900",
    border: "border-emerald-500/30",
    badge: "bg-emerald-500/20 text-emerald-200"
  },
  "Residential": {
    icon: Home,
    gradient: "from-rose-600 via-pink-800 to-slate-900",
    border: "border-rose-500/30",
    badge: "bg-rose-500/20 text-rose-200"
  },
  "Food-Service": {
    icon: Utensils,
    gradient: "from-orange-600 via-amber-800 to-slate-900",
    border: "border-orange-500/30",
    badge: "bg-orange-500/20 text-orange-200"
  },
  "Recreational": {
    icon: Trophy,
    gradient: "from-yellow-600 via-amber-800 to-slate-900",
    border: "border-yellow-500/30",
    badge: "bg-yellow-500/20 text-yellow-200"
  },
  "Assembly": {
    icon: Theater,
    gradient: "from-purple-600 via-violet-900 to-slate-900",
    border: "border-purple-500/30",
    badge: "bg-purple-500/20 text-purple-200"
  },
  "Utility": {
    icon: Droplets,
    gradient: "from-cyan-600 via-slate-800 to-slate-950",
    border: "border-cyan-500/30",
    badge: "bg-cyan-500/20 text-cyan-200"
  }
};

export function BlockImage({
  imagePath,
  blockName = "Campus Facility",
  category = "Academic",
  rooftopSolarKwp = 0,
  imageCredit = "Presidency University Campus Facilities",
  className = "",
  aspectRatio = "aspect-video", // 16:9 standard
  showCredit = true,
  alt
}) {
  const [hasError, setHasError] = useState(false);
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES["Academic"];
  const CategoryIcon = style.icon;

  return (
    <div className={`relative overflow-hidden ${aspectRatio} bg-slate-900 ${className}`}>
      {!hasError && imagePath ? (
        <img
          src={imagePath}
          alt={alt || `${blockName} - Presidency University`}
          loading="lazy"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      ) : (
        // Designed architectural gradient fallback
        <div className={`w-full h-full bg-gradient-to-br ${style.gradient} flex flex-col items-center justify-center p-6 text-white relative select-none`}>
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-2">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl shadow-black/20">
              <CategoryIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest font-black text-white/70">{category}</p>
              <h3 className="text-base font-bold text-white drop-shadow-sm leading-tight mt-0.5">{blockName}</h3>
            </div>
            {rooftopSolarKwp > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950 shadow-md">
                <Sun className="w-3 h-3 fill-amber-950" />
                <span>{rooftopSolarKwp} kWp Solar Array</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Credit Caption */}
      {showCredit && imageCredit && (
        <div className="absolute bottom-1 right-2 z-10 text-[9px] text-white/70 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded pointer-events-none">
          {imageCredit}
        </div>
      )}
    </div>
  );
}
