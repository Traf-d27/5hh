import React, { useState } from "react";
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  RotateCcw, 
  Database, 
  PlusCircle, 
  ShieldCheck, 
  Layers, 
  Info 
} from "lucide-react";
import { useCampus } from "../context/CampusContext";
import { ManualEntryModal } from "../components/ManualEntryModal";

export function DataManagementPage({ onNavigateTab }) {
  const { facilities, resetToDemo, showToast, loadAll } = useCampus();

  const [resourceType, setResourceType] = useState("Solar");
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (!selected.name.endsWith(".csv")) {
        showToast("Please choose a valid .csv spreadsheet file.", "error");
        return;
      }
      setFile(selected);
      setUploadResult(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("resourceType", resourceType);

    try {
      const res = await fetch("/api/upload-csv", {
        method: "POST",
        body: formData
      });
      const json = await res.json();
      if (json.success) {
        setUploadResult(json);
        showToast(json.message, "success");
        setFile(null);
        await loadAll();
      } else {
        setUploadResult(json);
        showToast(json.message || "CSV validation error.", "error");
      }
    } catch (err) {
      showToast("Network failure during CSV upload.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadSample = (type) => {
    window.location.href = `/api/sample-csv?type=${type}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300">
                Data Provenance & Ingestion
              </span>
              <span className="text-xs text-slate-500">
                Presidency University Telemetry Architecture
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Multi-Resource Data Management & CSV Ingestion</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Every telemetry record maintains an immutable classification tag. Ingest CSV batch logs, record manual field inspections, or download format templates.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab("datasets")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold text-xs shadow-md transition-all border border-slate-700"
              >
                <Database className="w-4 h-4 text-cyan-400" />
                <span>External Datasets</span>
              </button>
            )}
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Manual Entry Form</span>
            </button>
          </div>
        </div>

        {/* 4 Strict Data Classifications Banner */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Strict Multi-Tier Data Classifications (Never Silently Combined):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <span className="font-bold text-amber-900 block">1. Official Published Reference</span>
              <span className="text-amber-800 text-[11px] block mt-0.5">800 kWh Solar, 300 kL STP, 120-150 kg Waste</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="font-bold text-emerald-900 block">2. Synthetic Demonstration Data</span>
              <span className="text-emerald-800 text-[11px] block mt-0.5">Physics-calibrated 14-day campus telemetry</span>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
              <span className="font-bold text-purple-900 block">3. Imported Campus Measurement</span>
              <span className="text-purple-800 text-[11px] block mt-0.5">CSV batch uploads & validated manual entries</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
              <span className="font-bold text-blue-900 block">4. Live Sensor Measurement</span>
              <span className="text-blue-800 text-[11px] block mt-0.5">Authorized IoT inverter / smart meter feeds</span>
            </div>
          </div>
        </div>
      </div>

      {/* CSV Ingestion Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Upload Campus Telemetry (CSV)</h2>
              <p className="text-xs text-slate-500">Supports Solar Inverter, Electricity Sub-meter, STP Water, and Cafeteria Waste logs</p>
            </div>
          </div>

          {/* Resource Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {["Solar", "Electricity", "Water", "Waste"].map((res) => (
              <button
                key={res}
                type="button"
                onClick={() => setResourceType(res)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  resourceType === res
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleUpload} className="space-y-4 pt-2">
          <div className="border-2 border-dashed border-slate-300 hover:border-purple-400 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-purple-50/20 transition-all cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              id="multi-csv-input"
              className="hidden"
            />
            <label htmlFor="multi-csv-input" className="cursor-pointer block space-y-2">
              <FileSpreadsheet className="w-10 h-10 text-purple-500 mx-auto" />
              <div className="text-sm font-bold text-slate-700">
                {file ? file.name : `Click or drag a .CSV ${resourceType} file to upload`}
              </div>
              <div className="text-xs text-slate-400">
                Target classification: <strong>IMPORTED_MEASUREMENT</strong> • Expected format: timestamp, facilityId, value
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">
              {file && (
                <span className="font-medium text-purple-700">
                  Ready: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={!file || isUploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md disabled:opacity-50 transition-all"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? "Validating & Ingesting..." : `Validate & Ingest ${resourceType} CSV`}
            </button>
          </div>
        </form>

        {/* Upload Result / Validation Diagnostics */}
        {uploadResult && (
          <div className={`mt-4 p-4 rounded-xl border text-xs space-y-2 ${
            uploadResult.success ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-rose-50 border-rose-200 text-rose-900"
          }`}>
            <div className="flex items-center gap-2 font-bold text-sm">
              {uploadResult.success ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{uploadResult.message}</span>
            </div>
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="font-semibold text-rose-800">Validation Notices:</div>
                <ul className="list-disc pl-5 space-y-0.5 text-rose-700">
                  {uploadResult.errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Download Sample CSV Templates */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Download Template Files (Format Verification)</h2>
          <p className="text-xs text-slate-500">Pre-formatted CSV templates calibrated for Presidency University telemetry ingestion</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleDownloadSample("solar")}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/20 text-xs font-bold text-slate-800 transition-all text-left"
          >
            <div>
              <span className="block text-slate-900">Solar & Electricity CSV</span>
              <span className="text-[11px] text-slate-400 font-normal">timestamp, facilityId, kwh</span>
            </div>
            <Download className="w-4 h-4 text-amber-600" />
          </button>

          <button
            onClick={() => handleDownloadSample("water")}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/20 text-xs font-bold text-slate-800 transition-all text-left"
          >
            <div>
              <span className="block text-slate-900">Water & STP CSV</span>
              <span className="text-[11px] text-slate-400 font-normal">timestamp, facilityId, litres</span>
            </div>
            <Download className="w-4 h-4 text-cyan-600" />
          </button>

          <button
            onClick={() => handleDownloadSample("waste")}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20 text-xs font-bold text-slate-800 transition-all text-left"
          >
            <div>
              <span className="block text-slate-900">Cafeteria Waste CSV</span>
              <span className="text-[11px] text-slate-400 font-normal">timestamp, facilityId, kg</span>
            </div>
            <Download className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      </div>

      {/* Manual Entry Modal */}
      <ManualEntryModal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} />
    </div>
  );
}
