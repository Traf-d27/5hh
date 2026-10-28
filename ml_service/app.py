"""
ECHOTECH ML Intelligence Service
Presidency University Campus Sustainability AI Engine
Provides: Random Forest, Isolation Forest, Linear Regression, K-Means Clustering
Port: 5002 (separate from Node.js API on 5001)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import json
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

# ─── Constants from Presidency University published references ───
PUBLISHED_SOLAR_DAILY_KWH = 800        # Central Admin rooftop, ~800 units/day
PUBLISHED_WATER_DAILY_LITRES = 300000  # STP design capacity, 300 kL/day
PUBLISHED_FOOD_WASTE_KG_MIN = 120      # Cafeteria baseline min
PUBLISHED_FOOD_WASTE_KG_MAX = 150      # Cafeteria baseline max
PUBLISHED_FOOD_WASTE_KG_MID = 135      # Reference midpoint
CEA_GRID_CO2_FACTOR = 0.716            # kg CO2e/kWh, CEA India Baseline Database
WATER_PUMP_CO2_FACTOR = 0.45           # kg CO2e per kL (estimated pumping energy)
FOOD_WASTE_METHANE_FACTOR = 1.9        # kg CO2e per kg food waste in landfill


def make_synthetic_solar_features(n_days=30):
    """Generate feature matrix for solar forecasting using synthetic time-series."""
    records = []
    base_date = datetime(2026, 10, 1)
    for i in range(n_days):
        day = base_date + timedelta(days=i)
        day_of_week = day.weekday()
        month = day.month
        # Bengaluru October solar: mostly clear, some partly cloudy days
        cloud_factor = 1.0
        if i in [5, 6, 12, 20]:
            cloud_factor = 0.75  # partly cloudy
        if i in [15]:
            cloud_factor = 0.45  # overcast/rain day
        
        expected_kwh = PUBLISHED_SOLAR_DAILY_KWH * cloud_factor
        # Add soiling degradation in mid-period (days 23-25)
        soiling = 1.0
        if 23 <= i <= 25:
            soiling = 0.62
        actual_kwh = expected_kwh * soiling * (1 + np.random.normal(0, 0.03))
        actual_kwh = max(0, round(actual_kwh, 1))
        
        records.append({
            'day_of_week': day_of_week,
            'month': month,
            'cloud_factor': cloud_factor,
            'expected_kwh': expected_kwh,
            'actual_kwh': actual_kwh,
            'soiling_factor': soiling,
            'day_index': i
        })
    return records


def make_synthetic_water_features(n_days=30):
    """Generate daily water treatment features."""
    records = []
    base_date = datetime(2026, 10, 1)
    for i in range(n_days):
        day = base_date + timedelta(days=i)
        day_of_week = day.weekday()
        baseline = 295000 + int(np.sin(i * 1.5) * 8000)
        # Irrigation leak on days 23-25
        reuse = int(baseline * 0.88)
        if 23 <= i <= 25:
            reuse = 352000
        records.append({
            'day_of_week': day_of_week,
            'day_index': i,
            'treated_litres': baseline,
            'reuse_litres': reuse
        })
    return records


def make_synthetic_waste_features(n_days=30):
    """Generate daily food waste features."""
    records = []
    base_date = datetime(2026, 10, 1)
    for i in range(n_days):
        day = base_date + timedelta(days=i)
        day_of_week = day.weekday()
        baseline = PUBLISHED_FOOD_WASTE_KG_MID + int(np.sin(i * 2.2) * 10)
        actual = baseline
        # Cultural event spike on day 22
        if i == 22:
            actual = 238
        records.append({
            'day_of_week': day_of_week,
            'day_index': i,
            'baseline_kg': baseline,
            'actual_kg': actual
        })
    return records


# ─── MODEL A: Random Forest Regressor ───────────────────────────────────────
@app.route('/ml/forecast/solar', methods=['POST'])
def forecast_solar():
    """
    Random Forest vs Linear Regression forecast for solar generation.
    Uses synthetic Presidency campus data (calibrated against 800 kWh/day reference).
    Returns: predictions, actual values, MAE/RMSE comparison, method label.
    """
    try:
        from sklearn.ensemble import RandomForestRegressor
        from sklearn.linear_model import LinearRegression
        from sklearn.preprocessing import StandardScaler
        from sklearn.metrics import mean_absolute_error, mean_squared_error
        from sklearn.model_selection import train_test_split

        body = request.get_json(silent=True) or {}
        forecast_days = int(body.get('forecastDays', 7))
        
        records = make_synthetic_solar_features(30)
        X = np.array([[r['day_of_week'], r['cloud_factor'], r['day_index']] for r in records])
        y = np.array([r['actual_kwh'] for r in records])

        # Chronological split: last 7 days as test (no data leakage)
        split = max(7, len(records) - 7)
        X_train, X_test = X[:split], X[split:]
        y_train, y_test = y[:split], y[split:]

        scaler = StandardScaler()
        X_train_s = scaler.fit_transform(X_train)
        X_test_s = scaler.transform(X_test)

        # Random Forest
        rf = RandomForestRegressor(n_estimators=50, random_state=42, max_depth=5)
        rf.fit(X_train_s, y_train)
        rf_preds = rf.predict(X_test_s)
        rf_mae = round(float(mean_absolute_error(y_test, rf_preds)), 2)
        rf_rmse = round(float(np.sqrt(mean_squared_error(y_test, rf_preds))), 2)

        # Linear Regression
        lr = LinearRegression()
        lr.fit(X_train_s, y_train)
        lr_preds = lr.predict(X_test_s)
        lr_mae = round(float(mean_absolute_error(y_test, lr_preds)), 2)
        lr_rmse = round(float(np.sqrt(mean_squared_error(y_test, lr_preds))), 2)

        # Build future forecast (next N days)
        future_preds = []
        for i in range(forecast_days):
            future_day_idx = len(records) + i
            future_dow = (future_day_idx) % 7
            future_cloud = 0.9  # Bengaluru late Oct: mostly clear
            Xf = scaler.transform([[future_dow, future_cloud, future_day_idx]])
            rf_val = round(float(rf.predict(Xf)[0]), 1)
            lr_val = round(float(lr.predict(Xf)[0]), 1)
            future_preds.append({
                'dayIndex': future_day_idx,
                'rfForecastKwh': max(0, rf_val),
                'lrForecastKwh': max(0, lr_val),
                'publishedReferenceKwh': PUBLISHED_SOLAR_DAILY_KWH
            })

        # Test-set comparison
        test_comparison = []
        for i, rec in enumerate(records[split:]):
            test_comparison.append({
                'dayIndex': split + i,
                'actualKwh': round(float(y_test[i]), 1),
                'rfPredKwh': round(float(rf_preds[i]), 1),
                'lrPredKwh': round(float(lr_preds[i]), 1)
            })

        return jsonify({
            'success': True,
            'modelType': 'Random Forest Regressor + Linear Regression',
            'dataSource': 'SYNTHETIC_DEMO — Calibrated against Presidency University published 800 kWh/day reference',
            'publishedReference': {
                'daily_kwh': PUBLISHED_SOLAR_DAILY_KWH,
                'source': 'https://presidencyuniversity.in/renewable--',
                'note': 'Published reference, not live meter data'
            },
            'trainingSamples': len(X_train),
            'testSamples': len(X_test),
            'evaluation': {
                'randomForest': {'mae': rf_mae, 'rmse': rf_rmse},
                'linearRegression': {'mae': lr_mae, 'rmse': lr_rmse},
                'betterModel': 'Random Forest' if rf_mae < lr_mae else 'Linear Regression',
                'splitMethod': 'Chronological (last 7 days as test set)'
            },
            'testComparison': test_comparison,
            'futureForecast': future_preds,
            'disclaimer': 'Models trained on synthetic data calibrated to published campus references. Evaluation metrics reflect synthetic holdout performance, not verified campus measurements.'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ─── MODEL B: Isolation Forest Anomaly Detection ────────────────────────────
@app.route('/ml/anomaly-detect', methods=['POST'])
def detect_anomalies():
    """
    Isolation Forest anomaly detection across electricity, water, and waste.
    Scores each reading. Returns anomaly scores and flags unusual patterns.
    """
    try:
        from sklearn.ensemble import IsolationForest
        from sklearn.preprocessing import StandardScaler

        body = request.get_json(silent=True) or {}
        resource_type = body.get('resourceType', 'solar')

        if resource_type == 'solar':
            records = make_synthetic_solar_features(30)
            X_raw = np.array([[r['actual_kwh'], r['cloud_factor']] for r in records])
            labels = [r['day_index'] for r in records]
            values = [r['actual_kwh'] for r in records]
            unit = 'kWh/day'
            published_ref = PUBLISHED_SOLAR_DAILY_KWH
        elif resource_type == 'water':
            records = make_synthetic_water_features(30)
            X_raw = np.array([[r['treated_litres'], r['reuse_litres'], r['day_of_week']] for r in records])
            labels = [r['day_index'] for r in records]
            values = [r['reuse_litres'] for r in records]
            unit = 'Litres/day'
            published_ref = PUBLISHED_WATER_DAILY_LITRES
        elif resource_type == 'waste':
            records = make_synthetic_waste_features(30)
            X_raw = np.array([[r['actual_kg'], r['day_of_week']] for r in records])
            labels = [r['day_index'] for r in records]
            values = [r['actual_kg'] for r in records]
            unit = 'kg/day'
            published_ref = PUBLISHED_FOOD_WASTE_KG_MID
        else:
            return jsonify({'success': False, 'error': 'Unknown resource type'}), 400

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_raw)

        iso = IsolationForest(contamination=0.1, random_state=42, n_estimators=100)
        iso_labels = iso.fit_predict(X_scaled)
        scores = iso.score_samples(X_scaled)  # lower = more anomalous

        results = []
        for i in range(len(labels)):
            is_anomaly = iso_labels[i] == -1
            results.append({
                'dayIndex': labels[i],
                'value': round(float(values[i]), 1),
                'unit': unit,
                'publishedReference': published_ref,
                'anomalyScore': round(float(scores[i]), 4),
                'isAnomaly': bool(is_anomaly),
                'deviationFromRef': round(float(values[i] - published_ref), 1),
                'deviationPct': round(((values[i] - published_ref) / published_ref) * 100, 1)
            })

        anomalies_found = [r for r in results if r['isAnomaly']]
        
        return jsonify({
            'success': True,
            'modelType': 'Isolation Forest',
            'resourceType': resource_type,
            'dataSource': 'SYNTHETIC_DEMO — Calibrated against Presidency University published references',
            'totalReadings': len(results),
            'anomaliesDetected': len(anomalies_found),
            'contamination': 0.1,
            'results': results,
            'anomalies': anomalies_found,
            'disclaimer': 'Anomaly flags indicate statistically unusual patterns requiring investigation. They do not confirm equipment failure, leak, or waste. Physical inspection is recommended before any corrective action.'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ─── MODEL C: Linear Regression Baseline ────────────────────────────────────
@app.route('/ml/forecast/linear', methods=['POST'])
def linear_forecast():
    """Linear Regression interpretable baseline for consumption prediction."""
    try:
        from sklearn.linear_model import LinearRegression
        from sklearn.metrics import mean_absolute_error, mean_squared_error

        body = request.get_json(silent=True) or {}
        resource_type = body.get('resourceType', 'solar')

        if resource_type == 'solar':
            records = make_synthetic_solar_features(30)
            y = np.array([r['actual_kwh'] for r in records])
            X = np.array([[r['day_index'], r['cloud_factor']] for r in records])
            unit = 'kWh/day'
        elif resource_type == 'waste':
            records = make_synthetic_waste_features(30)
            y = np.array([r['actual_kg'] for r in records])
            X = np.array([[r['day_index'], r['day_of_week']] for r in records])
            unit = 'kg/day'
        else:
            records = make_synthetic_water_features(30)
            y = np.array([r['reuse_litres'] for r in records])
            X = np.array([[r['day_index'], r['day_of_week']] for r in records])
            unit = 'Litres/day'

        split = max(7, len(records) - 7)
        X_train, X_test = X[:split], X[split:]
        y_train, y_test = y[:split], y[split:]

        lr = LinearRegression()
        lr.fit(X_train, y_train)
        preds = lr.predict(X_test)
        mae = round(float(mean_absolute_error(y_test, preds)), 2)
        rmse = round(float(np.sqrt(mean_squared_error(y_test, preds))), 2)

        comparison = []
        for i in range(len(y_test)):
            comparison.append({
                'dayIndex': split + i,
                'actual': round(float(y_test[i]), 1),
                'predicted': round(float(preds[i]), 1),
                'residual': round(float(y_test[i] - preds[i]), 1)
            })

        return jsonify({
            'success': True,
            'modelType': 'Linear Regression',
            'resourceType': resource_type,
            'unit': unit,
            'coefficients': [round(float(c), 4) for c in lr.coef_],
            'intercept': round(float(lr.intercept_), 4),
            'trainingSamples': len(X_train),
            'evaluation': {'mae': mae, 'rmse': rmse},
            'testComparison': comparison,
            'interpretationNote': 'Linear regression shows trend direction and correlation. It does not establish causation. R-squared and coefficients are correlational, not causal.',
            'dataSource': 'SYNTHETIC_DEMO — Calibrated against published campus references'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ─── MODEL D: K-Means Facility Clustering ───────────────────────────────────
@app.route('/ml/cluster/facilities', methods=['POST'])
def cluster_facilities():
    """
    K-Means clustering of campus facilities by resource usage patterns.
    Uses available facility data: area, base load, peak load, operating hours.
    Identifies potential audit priorities.
    """
    try:
        from sklearn.cluster import KMeans
        from sklearn.preprocessing import StandardScaler
        from sklearn.metrics import silhouette_score

        # Presidency University campus facilities (from published campus data)
        facilities = [
            {'id': 'bldg-admin',     'name': 'Central Admin & Chancellery', 'areaSqM': 8500,  'baseLoadKwh': 22.0, 'peakLoadKwh': 140.0, 'operatingHrsPerDay': 9.5,  'solarInstalled': 1},
            {'id': 'bldg-eng',       'name': 'School of Engineering (A,B,C)','areaSqM': 26000, 'baseLoadKwh': 48.0, 'peakLoadKwh': 310.0, 'operatingHrsPerDay': 11.5, 'solarInstalled': 0},
            {'id': 'bldg-mgmt-law',  'name': 'School of Mgmt & Law',        'areaSqM': 14500, 'baseLoadKwh': 24.0, 'peakLoadKwh': 165.0, 'operatingHrsPerDay': 10.0, 'solarInstalled': 0},
            {'id': 'bldg-foodcourt', 'name': 'Food Court & Cafeteria',       'areaSqM': 5200,  'baseLoadKwh': 18.0, 'peakLoadKwh': 95.0,  'operatingHrsPerDay': 15.0, 'solarInstalled': 0},
            {'id': 'bldg-stp',       'name': 'STP & Green Lawns',            'areaSqM': 4800,  'baseLoadKwh': 28.0, 'peakLoadKwh': 65.0,  'operatingHrsPerDay': 24.0, 'solarInstalled': 0},
            {'id': 'bldg-hostels',   'name': 'Student Residential Towers',   'areaSqM': 32000, 'baseLoadKwh': 35.0, 'peakLoadKwh': 240.0, 'operatingHrsPerDay': 24.0, 'solarInstalled': 0},
        ]

        X_raw = np.array([
            [f['areaSqM'], f['baseLoadKwh'], f['peakLoadKwh'], 
             f['operatingHrsPerDay'], f['solarInstalled']]
            for f in facilities
        ])

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_raw)

        # Try k=2,3 and pick best silhouette score
        best_k = 2
        best_score = -1
        for k in [2, 3]:
            km = KMeans(n_clusters=k, random_state=42, n_init=10)
            labels_ = km.fit_predict(X_scaled)
            if len(set(labels_)) > 1:
                sc = silhouette_score(X_scaled, labels_)
                if sc > best_score:
                    best_score = sc
                    best_k = k

        km_final = KMeans(n_clusters=best_k, random_state=42, n_init=10)
        cluster_labels = km_final.fit_predict(X_scaled)

        # Calculate per-facility load intensity (kWh per sqm)
        result_facilities = []
        for i, f in enumerate(facilities):
            load_intensity = round(f['peakLoadKwh'] / f['areaSqM'] * 100, 3)  # Wh/sqm
            result_facilities.append({
                **f,
                'clusterId': int(cluster_labels[i]),
                'loadIntensityWhPerSqm': load_intensity,
                'auditPriority': 'High' if load_intensity > 0.8 else ('Medium' if load_intensity > 0.5 else 'Low')
            })

        # Cluster summaries
        cluster_summaries = {}
        for k in range(best_k):
            members = [f for f in result_facilities if f['clusterId'] == k]
            cluster_summaries[k] = {
                'clusterId': k,
                'memberCount': len(members),
                'facilities': [m['name'] for m in members],
                'avgPeakLoadKwh': round(np.mean([m['peakLoadKwh'] for m in members]), 1),
                'avgLoadIntensity': round(np.mean([m['loadIntensityWhPerSqm'] for m in members]), 3),
                'characterization': 'Heavy industrial/academic' if np.mean([m['peakLoadKwh'] for m in members]) > 150 else 'Moderate/residential'
            }

        return jsonify({
            'success': True,
            'modelType': 'K-Means Clustering',
            'nClusters': best_k,
            'silhouetteScore': round(float(best_score), 4),
            'facilities': result_facilities,
            'clusterSummaries': list(cluster_summaries.values()),
            'featuresUsed': ['areaSqM', 'baseLoadKwh', 'peakLoadKwh', 'operatingHrsPerDay', 'solarInstalled'],
            'note': 'Clusters group facilities by usage pattern similarity. Audit priority is based on load intensity (Wh per sqm). High-intensity facilities warrant detailed energy audit. Comparisons should account for facility function and occupancy, which are not fully captured here.',
            'dataSource': 'Campus facility specifications from Presidency University published campus profile'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ─── INTERVENTION SIMULATOR ──────────────────────────────────────────────────
@app.route('/ml/simulate', methods=['POST'])
def simulate_intervention():
    """
    What-If Intervention Simulator.
    Calculates projected resource reduction and financial/carbon impact
    for a selected sustainability measure with adjustable parameters.
    All outputs recalculate dynamically from inputs — no hardcoded results.
    """
    try:
        body = request.get_json(silent=True) or {}
        measure = body.get('measure', {})
        params = body.get('params', {})

        resource_type = measure.get('resourceType', 'Solar')
        measure_id = measure.get('id', 'CUSTOM')
        measure_title = measure.get('title', 'Custom Measure')
        
        # ── Energy simulation ──
        if resource_type in ('Solar', 'Electricity'):
            baseline_kwh = float(params.get('baselineKwhPerDay', 800))
            applicable_fraction = float(params.get('applicableFraction', 1.0))
            reduction_pct = float(params.get('assumedReductionPct', 35)) / 100
            days = int(params.get('analysisDays', 30))
            tariff = float(params.get('electricityTariffInr', 8.5))
            co2_factor = float(params.get('co2Factor', CEA_GRID_CO2_FACTOR))

            applicable_baseline = baseline_kwh * applicable_fraction
            period_baseline = applicable_baseline * days
            reduction_kwh = applicable_baseline * reduction_pct
            projected_kwh = applicable_baseline - reduction_kwh
            period_reduction = reduction_kwh * days
            financial_savings = period_reduction * tariff
            co2_avoided_kg = period_reduction * co2_factor

            return jsonify({
                'success': True,
                'simulationMode': 'SCENARIO_PROJECTION',
                'measureId': measure_id,
                'measureTitle': measure_title,
                'resourceType': resource_type,
                'baseline': {
                    'dailyKwh': round(baseline_kwh, 1),
                    'applicableDailyKwh': round(applicable_baseline, 1),
                    'periodKwh': round(period_baseline, 1),
                    'periodDays': days,
                    'dataSource': 'Synthetic demo data calibrated to 800 kWh/day published reference'
                },
                'proposed': {
                    'assumedReductionPct': round(reduction_pct * 100, 1),
                    'reductionSourceLabel': measure.get('reductionSourceLabel', 'Illustrative assumption — not a verified measurement'),
                    'dailyReductionKwh': round(reduction_kwh, 1),
                    'projectedDailyKwh': round(projected_kwh, 1),
                    'periodReductionKwh': round(period_reduction, 1),
                    'projectedPeriodKwh': round(period_baseline - period_reduction, 1)
                },
                'financialImpact': {
                    'currency': 'INR',
                    'tariffUsedInr': tariff,
                    'estimatedSavingsInr': round(financial_savings, 2),
                    'disclaimer': 'Financial savings are projected estimates. Actual savings depend on real metered data, tariff changes, and operational factors.'
                },
                'environmentalImpact': {
                    'co2FactorKgPerKwh': co2_factor,
                    'co2FactorSource': 'CEA India CO2 Baseline Database',
                    'co2AvoidedKg': round(co2_avoided_kg, 1),
                    'co2AvoidedTons': round(co2_avoided_kg / 1000, 3)
                },
                'assumptions': [
                    f'Applicable fraction of baseline: {applicable_fraction * 100:.0f}%',
                    f'Assumed reduction rate: {reduction_pct * 100:.0f}% — {measure.get("reductionSourceLabel", "illustrative")}',
                    f'Electricity tariff: ₹{tariff}/kWh (BESCOM HT commercial)',
                    f'CO2 factor: {co2_factor} kg CO2e/kWh (CEA India Baseline)',
                    'Analysis assumes uniform consumption across period'
                ],
                'confidenceLevel': 'LOW — Scenario projection only. No post-intervention measurements available.',
                'status': 'NOT_IMPLEMENTED'
            })

        # ── Water simulation ──
        elif resource_type == 'Water':
            baseline_litres = float(params.get('baselineLitresPerDay', 300000))
            applicable_fraction = float(params.get('applicableFraction', 1.0))
            reduction_pct = float(params.get('assumedReductionPct', 25)) / 100
            days = int(params.get('analysisDays', 30))
            tariff_per_kl = params.get('waterTariffInrPerKl')

            applicable_baseline = baseline_litres * applicable_fraction
            period_baseline_l = applicable_baseline * days
            reduction_l = applicable_baseline * reduction_pct
            projected_l = applicable_baseline - reduction_l
            period_reduction_l = reduction_l * days

            financial_savings = None
            financial_note = 'Water tariff not supplied — financial savings not calculated.'
            if tariff_per_kl is not None:
                t = float(tariff_per_kl)
                financial_savings = round((period_reduction_l / 1000) * t, 2)
                financial_note = f'Estimated using ₹{t}/kL reference rate'

            return jsonify({
                'success': True,
                'simulationMode': 'SCENARIO_PROJECTION',
                'measureId': measure_id,
                'measureTitle': measure_title,
                'resourceType': 'Water',
                'baseline': {
                    'dailyLitres': round(baseline_litres, 0),
                    'applicableDailyLitres': round(applicable_baseline, 0),
                    'periodLitres': round(period_baseline_l, 0),
                    'periodDays': days,
                    'publishedDesignCapacity': PUBLISHED_WATER_DAILY_LITRES,
                    'dataSource': 'Synthetic demo data calibrated to 300,000 L/day published reference'
                },
                'proposed': {
                    'assumedReductionPct': round(reduction_pct * 100, 1),
                    'dailyReductionLitres': round(reduction_l, 0),
                    'projectedDailyLitres': round(projected_l, 0),
                    'periodReductionLitres': round(period_reduction_l, 0),
                    'periodReductionKl': round(period_reduction_l / 1000, 1)
                },
                'financialImpact': {
                    'estimatedSavingsInr': financial_savings,
                    'note': financial_note
                },
                'environmentalImpact': {
                    'pumpingCo2FactorKgPerKl': WATER_PUMP_CO2_FACTOR,
                    'pumpingCo2AvoidedKg': round((period_reduction_l / 1000) * WATER_PUMP_CO2_FACTOR, 1)
                },
                'assumptions': [
                    f'Applicable fraction of baseline: {applicable_fraction * 100:.0f}%',
                    f'Assumed reduction rate: {reduction_pct * 100:.0f}% — {measure.get("reductionSourceLabel", "illustrative")}',
                    'Water distinction: treated wastewater reuse vs fresh water consumption not separately calculated here',
                    'CO2 factor for pumping energy only — not full lifecycle water treatment'
                ],
                'confidenceLevel': 'LOW — Scenario projection only.',
                'status': 'NOT_IMPLEMENTED'
            })

        # ── Waste simulation ──
        elif resource_type == 'Waste':
            baseline_kg_per_day = float(params.get('baselineKgPerDay', PUBLISHED_FOOD_WASTE_KG_MID))
            reduction_pct = float(params.get('assumedReductionPct', 40)) / 100
            days = int(params.get('analysisDays', 30))
            applicable_fraction = float(params.get('applicableFraction', 1.0))
            waste_cost_per_kg = params.get('wasteCostInrPerKg')

            applicable_baseline = baseline_kg_per_day * applicable_fraction
            period_baseline_kg = applicable_baseline * days
            reduction_kg = applicable_baseline * reduction_pct
            projected_kg = applicable_baseline - reduction_kg
            period_reduction_kg = reduction_kg * days

            financial_savings = None
            financial_note = 'Waste disposal cost not supplied.'
            if waste_cost_per_kg is not None:
                w = float(waste_cost_per_kg)
                financial_savings = round(period_reduction_kg * w, 2)
                financial_note = f'Estimated at ₹{w}/kg disposal cost'

            methane_avoided_kg_co2e = round(period_reduction_kg * FOOD_WASTE_METHANE_FACTOR, 1)

            return jsonify({
                'success': True,
                'simulationMode': 'SCENARIO_PROJECTION',
                'measureId': measure_id,
                'measureTitle': measure_title,
                'resourceType': 'Waste',
                'baseline': {
                    'dailyKg': round(baseline_kg_per_day, 1),
                    'applicableDailyKg': round(applicable_baseline, 1),
                    'periodKg': round(period_baseline_kg, 1),
                    'periodDays': days,
                    'publishedReferenceMin': PUBLISHED_FOOD_WASTE_KG_MIN,
                    'publishedReferenceMax': PUBLISHED_FOOD_WASTE_KG_MAX,
                    'dataSource': 'Synthetic demo data calibrated to 120–150 kg/day published reference'
                },
                'proposed': {
                    'assumedReductionPct': round(reduction_pct * 100, 1),
                    'dailyReductionKg': round(reduction_kg, 1),
                    'projectedDailyKg': round(projected_kg, 1),
                    'periodReductionKg': round(period_reduction_kg, 1)
                },
                'financialImpact': {
                    'estimatedSavingsInr': financial_savings,
                    'note': financial_note
                },
                'environmentalImpact': {
                    'methaneFactor': FOOD_WASTE_METHANE_FACTOR,
                    'methaneFactorNote': 'kg CO2e per kg food waste diverted from anaerobic landfill decomposition',
                    'methaneAvoidedKgCo2e': methane_avoided_kg_co2e,
                    'methaneAvoidedTonsCo2e': round(methane_avoided_kg_co2e / 1000, 3)
                },
                'assumptions': [
                    f'Baseline food waste: {baseline_kg_per_day} kg/day (synthetic, calibrated to published 120–150 kg/day range)',
                    f'Assumed reduction: {reduction_pct * 100:.0f}% — {measure.get("reductionSourceLabel", "illustrative")}',
                    'Methane avoidance factor: 1.9 kg CO2e/kg (IPCC landfill baseline)',
                    'Does not use electricity units or electricity tariff for waste calculations',
                    'Financial savings require waste disposal cost to be provided'
                ],
                'confidenceLevel': 'LOW — Scenario projection only.',
                'status': 'NOT_IMPLEMENTED'
            })

        else:
            return jsonify({'success': False, 'error': f'Unknown resource type: {resource_type}'}), 400

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ─── POST-INTERVENTION VERIFICATION ─────────────────────────────────────────
@app.route('/ml/verify-impact', methods=['POST'])
def verify_impact():
    """
    Before-and-after impact verification.
    Compares baseline and post-intervention readings.
    Handles all three scenarios: not implemented, implemented without data, verified.
    """
    try:
        body = request.get_json(silent=True) or {}
        resource_type = body.get('resourceType', 'Electricity')
        status = body.get('implementationStatus', 'not_implemented')
        baseline_value = float(body.get('baselineValue', 0))
        baseline_period_days = int(body.get('baselinePeriodDays', 30))
        post_value = body.get('postInterventionValue')
        post_period_days = int(body.get('postInterventionPeriodDays', 30))
        projected_reduction_pct = float(body.get('projectedReductionPct', 0)) / 100

        unit_map = {
            'Electricity': 'kWh', 'Solar': 'kWh',
            'Water': 'Litres', 'Waste': 'kg'
        }
        unit = unit_map.get(resource_type, 'units')

        baseline_period_total = baseline_value * baseline_period_days
        projected_period_total = baseline_period_total * (1 - projected_reduction_pct)
        projected_reduction = baseline_period_total - projected_period_total

        result = {
            'success': True,
            'resourceType': resource_type,
            'unit': unit,
            'implementationStatus': status,
            'baseline': {
                'dailyValue': baseline_value,
                'periodDays': baseline_period_days,
                'periodTotal': round(baseline_period_total, 1)
            },
            'projected': {
                'reductionPct': round(projected_reduction_pct * 100, 1),
                'periodReduction': round(projected_reduction, 1),
                'periodTotal': round(projected_period_total, 1),
                'label': 'PROJECTED (not yet verified)'
            }
        }

        if status == 'not_implemented':
            result['verificationState'] = 'NOT_IMPLEMENTED'
            result['message'] = 'Measure not yet implemented. Showing projected/potential savings only.'
            result['savingsVerified'] = False

        elif status == 'implemented_no_data':
            result['verificationState'] = 'IMPLEMENTED_UNVERIFIED'
            result['message'] = 'Measure reported as implemented. No post-intervention measurements available yet. Projected savings shown.'
            result['savingsVerified'] = False

        elif status == 'implemented_with_data' and post_value is not None:
            post_value = float(post_value)
            post_period_total = post_value * post_period_days
            actual_reduction = baseline_period_total - post_period_total
            actual_reduction_pct = (actual_reduction / baseline_period_total * 100) if baseline_period_total > 0 else 0
            deviation_from_projected = actual_reduction - projected_reduction

            result['verificationState'] = 'VERIFIED_WITH_DATA'
            result['postIntervention'] = {
                'dailyValue': post_value,
                'periodDays': post_period_days,
                'periodTotal': round(post_period_total, 1)
            }
            result['actualImpact'] = {
                'absoluteReduction': round(actual_reduction, 1),
                'reductionPct': round(actual_reduction_pct, 1),
                'direction': 'REDUCTION' if actual_reduction > 0 else 'INCREASE',
                'deviationFromProjected': round(deviation_from_projected, 1),
                'projectedVsActual': 'Exceeded projection' if actual_reduction > projected_reduction else 'Below projection'
            }
            result['savingsVerified'] = actual_reduction > 0
            result['message'] = (
                f'Actual reduction: {round(actual_reduction, 1)} {unit} ({round(actual_reduction_pct, 1)}%). '
                f'{"Savings verified." if actual_reduction > 0 else "Consumption increased — negative reduction recorded."}'
            )
            result['comparisonCaveat'] = 'Before-and-after comparison may be affected by occupancy changes, seasonal variation, weather, or concurrent interventions. Attribution to this single intervention cannot be confirmed without controlled comparison.'

        return jsonify(result)

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ─── ML MODEL STATUS ─────────────────────────────────────────────────────────
@app.route('/ml/status', methods=['GET'])
def ml_status():
    """Health check and model capability listing."""
    try:
        import sklearn
        sklearn_version = sklearn.__version__
    except ImportError:
        sklearn_version = 'not installed'

    return jsonify({
        'success': True,
        'service': 'ECHOTECH ML Intelligence Service',
        'campus': 'Presidency University, Yelahanka, Bengaluru',
        'pythonVersion': '3.x',
        'sklearnVersion': sklearn_version,
        'models': {
            'A_RandomForest': 'Solar/electricity consumption forecasting',
            'B_IsolationForest': 'Multi-resource anomaly detection',
            'C_LinearRegression': 'Interpretable baseline + comparison with RF',
            'D_KMeans': 'Facility usage pattern clustering'
        },
        'endpoints': [
            'GET  /ml/status',
            'POST /ml/forecast/solar',
            'POST /ml/forecast/linear',
            'POST /ml/anomaly-detect',
            'POST /ml/cluster/facilities',
            'POST /ml/simulate',
            'POST /ml/verify-impact'
        ],
        'dataNote': 'All models use synthetic data calibrated against official Presidency University published references (800 kWh/day solar, 300,000 L/day STP, 120-150 kg/day food waste). No live meter data available.',
        'timestamp': datetime.now().isoformat()
    })


if __name__ == '__main__':
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    print("=" * 60)
    print("ECHOTECH ML Intelligence Service")
    print("Presidency University Campus Sustainability AI")
    print("=" * 60)
    print("Models: Random Forest | Isolation Forest | LinearReg | KMeans")
    print("Running on: http://localhost:5002")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5002, debug=False)
