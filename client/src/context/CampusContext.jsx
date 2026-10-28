import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const CampusContext = createContext();

export function CampusProvider({ children }) {
  const [overviewData, setOverviewData] = useState(null);
  const [solarData, setSolarData] = useState(null);
  const [waterData, setWaterData] = useState(null);
  const [wasteData, setWasteData] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [actions, setActions] = useState([]);
  const [settings, setSettings] = useState({
    institutionName: "Presidency University",
    campusLocation: "Itgalpur, Rajanakunte, Yelahanka, Bengaluru, Karnataka 560064",
    electricityTariffInr: 8.50,
    waterTariffInr: 45.00,
    wasteCostInr: 4.50,
    gridCo2Factor: 0.716,
    publishedSolarDailyKwh: 800,
    publishedStpDailyLitres: 300000,
    publishedFoodWasteKgRange: "120 - 150 kg/day",
    solarDiscrepancyAuditFlag: true
  });

  const [selectedFacility, setSelectedFacility] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Fetch Overview
  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch("/api/overview");
      const json = await res.json();
      if (json.success) {
        setOverviewData(json.data);
        if (json.data.settings) setSettings(json.data.settings);
      }
    } catch (err) {
      console.error("Error fetching overview:", err);
    }
  }, []);

  // Fetch Solar
  const fetchSolar = useCallback(async () => {
    try {
      const res = await fetch("/api/solar");
      const json = await res.json();
      if (json.success) setSolarData(json.data);
    } catch (err) {
      console.error("Error fetching solar:", err);
    }
  }, []);

  // Fetch Water
  const fetchWater = useCallback(async () => {
    try {
      const res = await fetch("/api/water");
      const json = await res.json();
      if (json.success) setWaterData(json.data);
    } catch (err) {
      console.error("Error fetching water:", err);
    }
  }, []);

  // Fetch Waste
  const fetchWaste = useCallback(async () => {
    try {
      const res = await fetch("/api/waste");
      const json = await res.json();
      if (json.success) setWasteData(json.data);
    } catch (err) {
      console.error("Error fetching waste:", err);
    }
  }, []);

  // Fetch Facilities
  const fetchFacilities = useCallback(async () => {
    try {
      const res = await fetch("/api/facilities");
      const json = await res.json();
      if (json.success) setFacilities(json.data);
    } catch (err) {
      console.error("Error fetching facilities:", err);
    }
  }, []);

  // Fetch Inefficiencies
  const fetchInefficiencies = useCallback(async (filters = {}) => {
    try {
      let query = new URLSearchParams();
      if (selectedFacility !== "all") query.append("facilityId", selectedFacility);
      if (filters.resourceType && filters.resourceType !== "all") query.append("resourceType", filters.resourceType);
      if (filters.severity && filters.severity !== "all") query.append("severity", filters.severity);

      const res = await fetch(`/api/inefficiencies?${query.toString()}`);
      const json = await res.json();
      if (json.success) setAnomalies(json.data);
    } catch (err) {
      console.error("Error fetching inefficiencies:", err);
    }
  }, [selectedFacility]);

  // Fetch Recommendations
  const fetchRecommendations = useCallback(async () => {
    try {
      const res = await fetch("/api/recommendations");
      const json = await res.json();
      if (json.success) setRecommendations(json.data);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    }
  }, []);

  // Fetch Actions
  const fetchActions = useCallback(async () => {
    try {
      const res = await fetch("/api/actions");
      const json = await res.json();
      if (json.success) setActions(json.data);
    } catch (err) {
      console.error("Error fetching actions:", err);
    }
  }, []);

  // Load All
  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchOverview(),
        fetchSolar(),
        fetchWater(),
        fetchWaste(),
        fetchFacilities(),
        fetchInefficiencies(),
        fetchRecommendations(),
        fetchActions()
      ]);
    } catch (err) {
      console.error("Error loading Presidency campus data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchOverview, fetchSolar, fetchWater, fetchWaste, fetchFacilities, fetchInefficiencies, fetchRecommendations, fetchActions]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Update Tariffs / Settings
  const updateSettings = async (updates) => {
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      const json = await res.json();
      if (json.success) {
        setSettings(json.data);
        showToast("Tariffs & parameters updated! Platform-wide recalculations applied.", "success");
        await loadAll();
        return true;
      }
    } catch (err) {
      showToast("Error updating settings.", "error");
    }
    return false;
  };

  // Create Action
  const createAction = async (actionData) => {
    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actionData)
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Action "${json.data.title}" initialized!`, "success");
        await Promise.all([fetchActions(), fetchOverview()]);
        return json.data;
      }
    } catch (err) {
      showToast("Error creating action.", "error");
    }
    return null;
  };

  // Update Action
  const updateAction = async (id, updates) => {
    try {
      const res = await fetch(`/api/actions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      const json = await res.json();
      if (json.success) {
        showToast("Action status updated.", "success");
        await Promise.all([fetchActions(), fetchOverview()]);
        return json.data;
      }
    } catch (err) {
      showToast("Error updating action.", "error");
    }
    return null;
  };

  // Delete Action
  const deleteAction = async (id) => {
    try {
      const res = await fetch(`/api/actions/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast("Action deleted.", "info");
        await Promise.all([fetchActions(), fetchOverview()]);
        return true;
      }
    } catch (err) {
      showToast("Error deleting action.", "error");
    }
    return false;
  };

  // Manual Entry Ingestion
  const addManualEntry = async (entryData) => {
    try {
      const res = await fetch("/api/manual-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entryData)
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message, "success");
        await loadAll();
        return json.data;
      }
    } catch (err) {
      showToast("Error logging manual reading.", "error");
    }
    return null;
  };

  // Reset to Demo
  const resetToDemo = async () => {
    try {
      const res = await fetch("/api/reset-data", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        showToast("Presidency University calibrated benchmark restored.", "success");
        await loadAll();
        return true;
      }
    } catch (err) {
      showToast("Error restoring benchmark.", "error");
    }
    return false;
  };

  return (
    <CampusContext.Provider
      value={{
        overviewData,
        dashboardData: overviewData,
        solarData,
        waterData,
        wasteData,
        facilities: facilities || [],
        buildings: facilities || [],
        anomalies: anomalies || [],
        recommendations: recommendations || [],
        actions: actions || [],
        settings,
        selectedFacility: selectedFacility || "all",
        selectedBuilding: selectedFacility || "all",
        setSelectedFacility,
        setSelectedBuilding: setSelectedFacility,
        isLoading,
        toasts,
        showToast,
        removeToast,
        loadAll,
        updateSettings,
        createAction,
        updateAction,
        deleteAction,
        addManualEntry,
        resetToDemo,
        fetchInefficiencies
      }}
    >
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  const ctx = useContext(CampusContext);
  if (!ctx) throw new Error("useCampus must be used within CampusProvider");
  return ctx;
}
