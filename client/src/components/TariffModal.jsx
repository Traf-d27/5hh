import React, { useState } from "react";
import { X, IndianRupee, Droplets, Trash2, Leaf, Check, HelpCircle } from "lucide-react";
import { useCampus } from "../context/CampusContext";

export function TariffModal({ isOpen, onClose }) {
  const { settings, updateSettings } = useCampus();

  const [elecTariff, setElecTariff] = useState(settings?.electricityTariffInr || 8.5);
  const [waterTariff, setWaterTariff] = useState(settings?.waterTariffInr || 45.0);
  const [wasteCost, setWasteCost] = useState(settings?.wasteCostInr || 4.5);
  const [co2Factor, setCo2Factor] = useState(settings?.gridCo2Factor || 0.716);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await updateSettings({
      electricityTariffInr: Number(elecTariff),
      waterTariffInr: Number(waterTariff),
      wasteCostInr: Number(wasteCost),
      gridCo2Factor: Number(co2Factor)
    });
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-emerald-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 font-bold">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Configure Campus Tariffs & Emissions</h3>
              <p className="text-xs text-slate-500">Presidency University Resource Pricing & CEA Factors</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Electricity Tariff */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                Electricity Tariff (₹ / kWh)
              </span>
              <span className="text-[10px] text-slate-400 font-normal">BESCOM Commercial HT</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.05"
                min="1"
                max="30"
                required
                value={elecTariff}
                onChange={(e) => setElecTariff(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-bold rounded-xl border border-slate-200 focus:border-emerald-500 bg-slate-50 focus:bg-white"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">per kWh</span>
            </div>
          </div>

          {/* Water Tariff */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                Fresh Water / Pumping Cost (₹ / kL)
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Per 1,000 Litres</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="1"
                min="5"
                max="150"
                required
                value={waterTariff}
                onChange={(e) => setWaterTariff(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-bold rounded-xl border border-slate-200 focus:border-cyan-500 bg-slate-50 focus:bg-white"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">per 1,000 L</span>
            </div>
          </div>

          {/* Waste Processing Cost */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-amber-600" />
                Waste Processing & Landfill Avoidance (₹ / kg)
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Tipping & Compost Offset</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.25"
                min="0.5"
                max="25"
                required
                value={wasteCost}
                onChange={(e) => setWasteCost(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-bold rounded-xl border border-slate-200 focus:border-amber-500 bg-slate-50 focus:bg-white"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">per kg</span>
            </div>
          </div>

          {/* CEA Grid Emission Factor */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                Grid Emission Factor (kg CO2e / kWh)
              </span>
              <span className="text-[10px] text-slate-400 font-normal">CEA India Baseline Database</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                min="0.1"
                max="2.0"
                required
                value={co2Factor}
                onChange={(e) => setCo2Factor(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-bold rounded-xl border border-slate-200 focus:border-emerald-500 bg-slate-50 focus:bg-white"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">kg CO2e</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>Updates trigger instant recalculation of historical savings, recommendation paybacks, and avoided carbon tonnage across Solar, Water, and Waste.</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? "Recalculating..." : "Apply Platform Tariffs"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
