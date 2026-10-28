import React, { useState, useEffect, useCallback } from "react";
import {
  Brain, Activity, Cpu, GitBranch, AlertCircle, CheckCircle2,
  RefreshCw, BarChart2, Info, ChevronDown, ChevronUp, Layers,
  TrendingDown, TrendingUp, Zap, Droplets, Trash2, Leaf
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Cell
} from "recharts";

const MODEL_CARDS = [
  {
    key: "rf",
    label: "Model A",
    title: "Random Forest Regressor",
    description: "Predicts expected solar generation using historical patterns, day-of-week, and weather conditions.",
    endpoint: "/ml/forecast/solar",
    method: "POST",
    body: { forecastDays: 7 },
    icon: Brain,
    color: "violet"
  },
  {
    key: "anomaly",
    label: "Model B",
    title: "Isolation Forest",
    description: "Detects statistically unusual consumption or generation patterns across all resource types.",
    endpoint: "/ml/anomaly-detect",
    method: "POST",
    body: { resourceType: "solar" },
    icon: Activity,
    color: "red"
  },
  {
    key: "linear",
    label: "Model C",
    title: "Linear Regression",
    description: "Interpretable baseline forecast for comparison against Random Forest on the same test data.",
    endpoint: "/ml/forecast/linear",
    method: "POST",
    body: { resourceType: "solar" },
    icon: GitBranch,
    color: "blue"
  },
  {
    key: "kmeans",
    label: "Model D",
    title: "K-Means Clustering",
    description: "Groups Presidency University facilities by resource usage patterns to identify audit priorities.",
    endpoint: "/ml/cluster/facilities",
    method: "POST",
    body: {},
    icon: Layers,
    color: "emerald"
  }
];

const colorMap = {
  violet:  { bg: "bg-violet-50",  border: "border-violet-200", text: "text-violet-700",  badge: "bg-violet-100 text-violet-800",  ring: "ring-violet-300"  },
  red:     { bg: "bg-red-50",     border: "border-red-200",    text: "text-red-700",     badge: "bg-red-100 text-red-800",        ring: "ring-red-300"     },
  blue:    { bg: "bg-blue-50",    border: "border-blue-200",   text: "text-blue-700",    badge: "bg-blue-100 text-blue-800",      ring: "ring-blue-300"    },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200",text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-800",ring: "ring-emerald-300" }
};

// ── Sub-component: RF + LR Forecast Chart ─────────────────────────────────
function ForecastChart({ data }) {
  if (!data) return null;
  const { evaluation, testComparison, futureForecast } = data;

  const chartData = [
    ...(testComparison || []).map(d => ({
      day: `D${d.dayIndex}`,
      actual: d.actualKwh,
      rf: d.rfPredKwh,
      lr: d.lrPredKwh,
      type: "test"
    })),
    ...(futureForecast || []).map(d => ({
      day: `F${d.dayIndex}`,
      rf: d.rfForecastKwh,
      lr: d.lrForecastKwh,
      ref: d.publishedReferenceKwh,
      type: "forecast"
    }))
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <div className="text-xs text-slate-500 mb-1">RF MAE</div>
          <div className="text-lg font-black text-violet-700">{evaluation?.randomForest?.mae} kWh</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <div className="text-xs text-slate-500 mb-1">RF RMSE</div>
          <div className="text-lg font-black text-violet-700">{evaluation?.randomForest?.rmse} kWh</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <div className="text-xs text-slate-500 mb-1">LR MAE</div>
          <div className="text-lg font-black text-blue-700">{evaluation?.linearRegression?.mae} kWh</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <div className="text-xs text-slate-500 mb-1">LR RMSE</div>
          <div className="text-lg font-black text-blue-700">{evaluation?.linearRegression?.rmse} kWh</div>
        </div>
      </div>
      <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
        <strong>Better model on this dataset:</strong> {evaluation?.betterModel} · Split: {evaluation?.splitMethod}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="day" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} unit=" kWh" />
          <Tooltip formatter={(v, n) => [`${v} kWh`, n]} />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="actual"  stroke="#10b981" strokeWidth={2} name="Actual"         dot={false} />
          <Line type="monotone" dataKey="rf"      stroke="#7c3aed" strokeWidth={1.5} name="Random Forest" dot={false} strokeDasharray="4 2" />
          <Line type="monotone" dataKey="lr"      stroke="#3b82f6" strokeWidth={1.5} name="Linear Reg."   dot={false} strokeDasharray="2 3" />
          <Line type="monotone" dataKey="ref"     stroke="#f59e0b" strokeWidth={1}   name="Published Ref" dot={false} strokeDasharray="6 3" />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-slate-400 text-center">
        Trained on 23 days · Tested on 7 days (chronological split — no data leakage)
      </p>
    </div>
  );
}

// ── Sub-component: Isolation Forest Anomaly Chart ─────────────────────────
function AnomalyChart({ data, resourceType }) {
  if (!data) return null;
  const { results, anomaliesDetected, totalReadings } = data;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-2.5 text-center">
          <div className="text-xs text-slate-500">Total Readings</div>
          <div className="text-xl font-black text-slate-800">{totalReadings}</div>
        </div>
        <div className="bg-white rounded-xl border border-red-200 px-4 py-2.5 text-center">
          <div className="text-xs text-slate-500">Anomalies Flagged</div>
          <div className="text-xl font-black text-red-600">{anomaliesDetected}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-2.5 text-center">
          <div className="text-xs text-slate-500">Contamination</div>
          <div className="text-xl font-black text-slate-600">10%</div>
        </div>
        <div className="text-xs text-slate-500 max-w-xs">
          Lower anomaly score = more anomalous. Threshold: model-determined.
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="dayIndex" name="Day" tick={{ fontSize: 10 }} label={{ value: "Day", position: "insideBottom", offset: -5, fontSize: 10 }} />
          <YAxis dataKey="value" name="Value" tick={{ fontSize: 10 }} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ payload }) => {
              if (!payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs shadow-md">
                  <p className="font-bold">Day {d.dayIndex}</p>
                  <p>Value: {d.value?.toLocaleString("en-IN")} {d.unit}</p>
                  <p>Score: {d.anomalyScore}</p>
                  <p className={d.isAnomaly ? "text-red-600 font-bold" : "text-emerald-600"}>
                    {d.isAnomaly ? "⚠ ANOMALY FLAGGED" : "● Normal"}
                  </p>
                </div>
              );
            }}
          />
          <Scatter
            data={results}
            fill="#94a3b8"
          >
            {(results || []).map((d, i) => (
              <Cell key={i} fill={d.isAnomaly ? "#ef4444" : "#94a3b8"} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-slate-400 text-center">
        Red = anomaly flag · Grey = within expected range · Requires investigation, not automatic confirmation
      </p>
      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
        <strong>Disclaimer:</strong> {data.disclaimer}
      </div>
    </div>
  );
}

// ── Sub-component: K-Means Cluster Chart ─────────────────────────────────
function ClusterChart({ data }) {
  if (!data) return null;
  const { facilities, clusterSummaries, nClusters, silhouetteScore } = data;

  const CLUSTER_COLORS = ["#7c3aed", "#10b981", "#f59e0b", "#ef4444"];
  const chartData = (facilities || []).map(f => ({
    name: f.name.split(" ").slice(0, 2).join(" "),
    peakLoad: f.peakLoadKwh,
    loadIntensity: f.loadIntensityWhPerSqm,
    cluster: f.clusterId,
    auditPriority: f.auditPriority
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <div className="text-xs text-slate-500">Clusters</div>
          <div className="text-xl font-black text-emerald-700">{nClusters}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <div className="text-xs text-slate-500">Silhouette Score</div>
          <div className="text-xl font-black text-emerald-700">{silhouetteScore}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <div className="text-xs text-slate-500">Facilities</div>
          <div className="text-xl font-black text-slate-700">{facilities?.length}</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} layout="vertical" barSize={14}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis type="number" tick={{ fontSize: 10 }} unit=" kWh" />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={90} />
          <Tooltip formatter={(v) => [`${v} kWh`, "Peak Load"]} />
          <Bar dataKey="peakLoad" radius={[0, 4, 4, 0]}>
            {chartData.map((d, i) => (
              <Cell key={i} fill={CLUSTER_COLORS[d.cluster % CLUSTER_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(facilities || []).map(f => (
          <div key={f.id} className="bg-white rounded-xl border border-slate-200 p-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-bold text-slate-800">{f.name}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                f.auditPriority === "High" ? "bg-red-100 text-red-700"
                : f.auditPriority === "Medium" ? "bg-amber-100 text-amber-700"
                : "bg-green-100 text-green-700"
              }`}>{f.auditPriority} Priority</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-500">
              <span>Cluster {f.clusterId}</span>
              <span>·</span>
              <span>Peak: {f.peakLoadKwh} kWh</span>
              <span>·</span>
              <span>Intensity: {f.loadIntensityWhPerSqm} Wh/sqm</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-slate-400">
        {data.note}
      </p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export function MLIntelligencePage() {
  const [modelResults, setModelResults] = useState({});
  const [loadingModels, setLoadingModels] = useState({});
  const [errors, setErrors] = useState({});
  const [expanded, setExpanded] = useState({ rf: true });
  const [anomalyResource, setAnomalyResource] = useState("solar");
  const [mlOnline, setMlOnline] = useState(null);

  const checkMlStatus = useCallback(async () => {
    try {
      const res = await fetch("/ml/status");
      const json = await res.json();
      setMlOnline(json.success ? json : null);
    } catch {
      setMlOnline(false);
    }
  }, []);

  useEffect(() => {
    checkMlStatus();
  }, [checkMlStatus]);

  const runModel = useCallback(async (card) => {
    const key = card.key;
    setLoadingModels(prev => ({ ...prev, [key]: true }));
    setErrors(prev => ({ ...prev, [key]: null }));

    try {
      let body = { ...card.body };
      if (key === "anomaly") body.resourceType = anomalyResource;

      const res = await fetch(card.endpoint, {
        method: card.method,
        headers: { "Content-Type": "application/json" },
        body: card.method === "POST" ? JSON.stringify(body) : undefined
      });
      const json = await res.json();
      if (json.success) {
        setModelResults(prev => ({ ...prev, [key]: json }));
        setExpanded(prev => ({ ...prev, [key]: true }));
      } else {
        setErrors(prev => ({ ...prev, [key]: json.error }));
      }
    } catch (e) {
      setErrors(prev => ({ ...prev, [key]: "Cannot reach ML service. Ensure Python ML service is running on port 5002." }));
    } finally {
      setLoadingModels(prev => ({ ...prev, [key]: false }));
    }
  }, [anomalyResource]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-400/20 text-blue-300 border border-blue-400/30">
                Python scikit-learn 1.9 · Real ML Inference
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">ML Intelligence Engine</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Four genuine ML models trained and evaluated on synthetic data calibrated against Presidency University
              published references. All metrics are computed on held-out test data — never fabricated.
            </p>
          </div>
          <div className={`shrink-0 px-4 py-3 rounded-xl border text-center ${
            mlOnline === false ? "border-red-400/40 bg-red-900/30" : mlOnline ? "border-emerald-400/40 bg-emerald-900/30" : "border-slate-600 bg-slate-800"
          }`}>
            <Cpu className="w-6 h-6 mx-auto mb-1 text-blue-300" />
            <div className="text-xs text-slate-300">ML Service</div>
            <div className={`text-xs font-bold mt-0.5 ${
              mlOnline === false ? "text-red-400" : mlOnline ? "text-emerald-400" : "text-slate-400"
            }`}>
              {mlOnline === false ? "● Offline" : mlOnline ? `● Online · sklearn ${mlOnline.sklearnVersion}` : "● Checking…"}
            </div>
          </div>
        </div>
      </div>

      {/* Offline warning */}
      {mlOnline === false && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700">ML Service Offline</p>
            <p className="text-xs text-red-600 mt-1">
              Start the Python ML service: <code className="bg-red-100 px-1 rounded">python ml_service/app.py</code>
              &nbsp;(runs on port 5002). All four models will then be available.
            </p>
          </div>
        </div>
      )}

      {/* Data transparency notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800">
          <strong>Data Transparency:</strong> Models use <strong>synthetic data calibrated to published Presidency University references</strong>
          (800 kWh/day solar, 300,000 L/day STP, 120–150 kg/day food waste). Live meter data is not available.
          Evaluation metrics are calculated on held-out test sets — not training data.
        </p>
      </div>

      {/* Model Cards */}
      {MODEL_CARDS.map((card) => {
        const c = colorMap[card.color];
        const result = modelResults[card.key];
        const loading = loadingModels[card.key];
        const err = errors[card.key];
        const isExpanded = expanded[card.key];
        const Icon = card.icon;

        return (
          <div key={card.key} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Card header */}
            <div className={`p-5 border-b border-slate-100 ${result ? c.bg : ""}`}>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.badge}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${c.badge}`}>{card.label}</span>
                      {result && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    </div>
                    <h3 className="text-sm font-black text-slate-900 mt-0.5">{card.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 max-w-xl">{card.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Anomaly resource selector */}
                  {card.key === "anomaly" && (
                    <select
                      value={anomalyResource}
                      onChange={e => setAnomalyResource(e.target.value)}
                      className="text-xs px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="solar">Solar</option>
                      <option value="water">Water</option>
                      <option value="waste">Waste</option>
                    </select>
                  )}

                  <button
                    onClick={() => runModel(card)}
                    disabled={loading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm disabled:opacity-60 ${
                      card.color === "violet" ? "bg-violet-600 hover:bg-violet-700" :
                      card.color === "red" ? "bg-red-600 hover:bg-red-700" :
                      card.color === "blue" ? "bg-blue-600 hover:bg-blue-700" :
                      "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
                    {loading ? "Running…" : result ? "Re-run" : "Run Model"}
                  </button>

                  {result && (
                    <button
                      onClick={() => setExpanded(prev => ({ ...prev, [card.key]: !isExpanded }))}
                      className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Error */}
            {err && (
              <div className="px-5 py-3 bg-red-50 border-b border-red-100 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{err}</p>
              </div>
            )}

            {/* Results */}
            {result && isExpanded && (
              <div className="p-5">
                {/* Common metadata */}
                <div className="mb-4 flex items-center gap-3 flex-wrap text-[10px] text-slate-500">
                  <span className="px-2 py-1 rounded bg-slate-100">
                    <strong>Model:</strong> {result.modelType}
                  </span>
                  {result.trainingSamples && (
                    <span className="px-2 py-1 rounded bg-slate-100">
                      <strong>Train samples:</strong> {result.trainingSamples}
                    </span>
                  )}
                  {result.testSamples && (
                    <span className="px-2 py-1 rounded bg-slate-100">
                      <strong>Test samples:</strong> {result.testSamples}
                    </span>
                  )}
                </div>

                {card.key === "rf" && <ForecastChart data={result} />}
                {card.key === "anomaly" && <AnomalyChart data={result} resourceType={anomalyResource} />}
                {card.key === "linear" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 rounded-xl border border-blue-200 p-3 text-center">
                        <div className="text-xs text-slate-500 mb-1">MAE</div>
                        <div className="text-xl font-black text-blue-700">{result.evaluation?.mae}</div>
                      </div>
                      <div className="bg-blue-50 rounded-xl border border-blue-200 p-3 text-center">
                        <div className="text-xs text-slate-500 mb-1">RMSE</div>
                        <div className="text-xl font-black text-blue-700">{result.evaluation?.rmse}</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 italic">{result.interpretationNote}</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={result.testComparison || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="dayIndex" tick={{ fontSize: 10 }} label={{ value: "Day", position: "insideBottom", offset: -5, fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual" dot={false} />
                        <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 2" name="LR Predicted" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {card.key === "kmeans" && <ClusterChart data={result} />}

                {/* Data source footer */}
                <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400">
                  <strong>Data:</strong> {result.dataSource || result.note}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
