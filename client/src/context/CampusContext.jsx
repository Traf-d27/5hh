import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const CampusContext = createContext();

export function CampusProvider({ children }) {
  const [overviewData, setOverviewData] = useState(null);
  const [solarData, setSolarData] = useState(null);
  const [waterData, setWaterData] = useState(null);
  const [wasteData, setWasteData] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [blocks, setBlocks] = useState([]);
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

  // Global Block & Role Selection
  const [selectedBlockId, setSelectedBlockId] = useState("all");
  const [userRole, setUserRole] = useState("SUSTAINABILITY_ADMIN"); // SUSTAINABILITY_ADMIN | BLOCK_MANAGER
  const [userBlockId, setUserBlockId] = useState("CSE"); // Default block when in BLOCK_MANAGER role
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

  // Auth Header Helper
  const getAuthHeaders = useCallback(() => {
    return {
      "x-user-role": userRole,
      "x-block-id": userRole === "BLOCK_MANAGER" ? userBlockId : ""
    };
  }, [userRole, userBlockId]);

  // Fetch Blocks
  const fetchBlocks = useCallback(async () => {
    try {
      const res = await fetch("/api/blocks");
      const json = await res.json();
      if (json.success) setBlocks(json.data);
    } catch (err) {
      console.error("Error fetching blocks:", err);
    }
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

  // Fetch Solar (supports ?blockId=)
  const fetchSolar = useCallback(async () => {
    try {
      const query = selectedBlockId !== "all" ? `?blockId=${selectedBlockId}` : "";
      const res = await fetch(`/api/solar${query}`);
      const json = await res.json();
      if (json.success) setSolarData(json.data);
    } catch (err) {
      console.error("Error fetching solar:", err);
    }
  }, [selectedBlockId]);

  // Fetch Water (supports ?blockId=)
  const fetchWater = useCallback(async () => {
    try {
      const query = selectedBlockId !== "all" ? `?blockId=${selectedBlockId}` : "";
      const res = await fetch(`/api/water${query}`);
      const json = await res.json();
      if (json.success) setWaterData(json.data);
    } catch (err) {
      console.error("Error fetching water:", err);
    }
  }, [selectedBlockId]);

  // Fetch Waste (supports ?blockId=)
  const fetchWaste = useCallback(async () => {
    try {
      const query = selectedBlockId !== "all" ? `?blockId=${selectedBlockId}` : "";
      const res = await fetch(`/api/waste${query}`);
      const json = await res.json();
      if (json.success) setWasteData(json.data);
    } catch (err) {
      console.error("Error fetching waste:", err);
    }
  }, [selectedBlockId]);

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

  // Fetch Inefficiencies (supports ?blockId=)
  const fetchInefficiencies = useCallback(async () => {
    try {
      const query = selectedBlockId !== "all" ? `?blockId=${selectedBlockId}` : "";
      const res = await fetch(`/api/anomalies${query}`);
      const json = await res.json();
      if (json.success) setAnomalies(json.data);
    } catch (err) {
      console.error("Error fetching anomalies:", err);
    }
  }, [selectedBlockId]);

  // Fetch Recommendations (supports ?blockId=)
  const fetchRecommendations = useCallback(async () => {
    try {
      const query = selectedBlockId !== "all" ? `?blockId=${selectedBlockId}` : "";
      const res = await fetch(`/api/recommendations${query}`);
      const json = await res.json();
      if (json.success) setRecommendations(json.data);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    }
  }, [selectedBlockId]);

  // Fetch Actions (supports ?blockId=)
  const fetchActions = useCallback(async () => {
    try {
      const query = selectedBlockId !== "all" ? `?blockId=${selectedBlockId}` : "";
      const res = await fetch(`/api/actions${query}`);
      const json = await res.json();
      if (json.success) setActions(json.data);
    } catch (err) {
      console.error("Error fetching actions:", err);
    }
  }, [selectedBlockId]);

  // Load All Data
  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchBlocks(),
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
  }, [fetchBlocks, fetchOverview, fetchSolar, fetchWater, fetchWaste, fetchFacilities, fetchInefficiencies, fetchRecommendations, fetchActions]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Update Tariffs / Settings
  const updateSettings = async (updates) => {
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
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
      console.error("Error updating settings:", err);
      showToast("Failed to update settings.", "error");
      return false;
    }
  };

  // Create Action (Block Aware & RBAC protected)
  const createAction = async (actionData) => {
    try {
      const blockId = actionData.blockId || (selectedBlockId !== "all" ? selectedBlockId : "ADMIN");
      const res = await fetch(`/api/blocks/${blockId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(actionData)
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message || "Action created successfully!", "success");
        await fetchActions();
        await fetchOverview();
        await fetchBlocks();
        return json.data;
      } else {
        showToast(json.error || json.message || "Failed to create action.", "error");
        return null;
      }
    } catch (err) {
      console.error("Error creating action:", err);
      showToast("Network error creating action.", "error");
      return null;
    }
  };

  // Update Action
  const updateAction = async (id, updates) => {
    try {
      const res = await fetch(`/api/actions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(updates)
      });
      const json = await res.json();
      if (json.success) {
        showToast("Tracked action status updated!", "success");
        await fetchActions();
        await fetchOverview();
        await fetchBlocks();
        return true;
      }
    } catch (err) {
      console.error("Error updating action:", err);
      showToast("Failed to update action.", "error");
      return false;
    }
  };

  // Reset to Clean Demo Data
  const resetToSeedData = async () => {
    try {
      const res = await fetch("/api/reset-data", {
        method: "POST",
        headers: getAuthHeaders()
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message, "success");
        await loadAll();
        return true;
      }
    } catch (err) {
      console.error("Error resetting data:", err);
      showToast("Failed to reset telemetry.", "error");
      return false;
    }
  };

  return (
    <CampusContext.Provider
      value={{
        overviewData,
        solarData,
        waterData,
        wasteData,
        facilities,
        blocks,
        anomalies,
        recommendations,
        actions,
        settings,
        selectedBlockId,
        setSelectedBlockId,
        userRole,
        setUserRole,
        userBlockId,
        setUserBlockId,
        isLoading,
        toasts,
        showToast,
        removeToast,
        updateSettings,
        createAction,
        updateAction,
        resetToSeedData,
        fetchBlocks,
        refreshAll: loadAll,
        getAuthHeaders
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
