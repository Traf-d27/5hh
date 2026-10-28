import React, { useState } from "react";
import { CampusProvider } from "./context/CampusContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { ToastContainer } from "./components/Toast";

import { OverviewPage } from "./pages/OverviewPage";
import { SolarIntelligencePage } from "./pages/SolarIntelligencePage";
import { WaterIntelligencePage } from "./pages/WaterIntelligencePage";
import { WasteIntelligencePage } from "./pages/WasteIntelligencePage";
import { InefficienciesPage } from "./pages/InefficienciesPage";
import { RecommendationsPage } from "./pages/RecommendationsPage";
import { InterventionSimulatorPage } from "./pages/InterventionSimulatorPage";
import { MLIntelligencePage } from "./pages/MLIntelligencePage";
import { ActionTrackerPage } from "./pages/ActionTrackerPage";
import { ImpactVerificationPage } from "./pages/ImpactVerificationPage";
import { DataManagementPage } from "./pages/DataManagementPage";

export default function App() {
  const [currentTab, setCurrentTab] = useState("overview");

  return (
    <ErrorBoundary>
      <CampusProvider>
        <div className="min-h-screen bg-slate-50 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
          {/* Global Presidency University Navigation Header */}
          <Navbar />

          {/* Main Body */}
          <div className="flex-1 flex">
            {/* Responsive Navigation Sidebar */}
            <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

            {/* Dynamic Page Content */}
            <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
              {currentTab === "overview" && <OverviewPage onNavigateTab={setCurrentTab} />}
              {currentTab === "solar" && <SolarIntelligencePage onNavigateTab={setCurrentTab} />}
              {currentTab === "water" && <WaterIntelligencePage onNavigateTab={setCurrentTab} />}
              {currentTab === "waste" && <WasteIntelligencePage onNavigateTab={setCurrentTab} />}
              {currentTab === "inefficiencies" && <InefficienciesPage onNavigateTab={setCurrentTab} />}
              {currentTab === "recommendations" && <RecommendationsPage onNavigateTab={setCurrentTab} />}
              {currentTab === "simulator" && <InterventionSimulatorPage onNavigateTab={setCurrentTab} />}
              {currentTab === "ml" && <MLIntelligencePage onNavigateTab={setCurrentTab} />}
              {currentTab === "actions" && <ActionTrackerPage />}
              {currentTab === "impact" && <ImpactVerificationPage />}
              {currentTab === "data" && <DataManagementPage />}
            </main>
          </div>

          {/* Toast Alerts System */}
          <ToastContainer />
        </div>
      </CampusProvider>
    </ErrorBoundary>
  );
}
