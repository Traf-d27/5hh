import React, { useState } from "react";
import { CampusProvider } from "./context/CampusContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { ToastContainer } from "./components/Toast";

import { OverviewPage } from "./pages/OverviewPage";
import { BlockExplorerPage } from "./pages/BlockExplorerPage";
import { CampusMapPage } from "./pages/CampusMapPage";
import { BlockDetailPage } from "./pages/BlockDetailPage";
import { BlockComparePage } from "./pages/BlockComparePage";
import { LeaderboardPage } from "./pages/LeaderboardPage";

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
import { ExternalDatasetsPage } from "./pages/ExternalDatasetsPage";

export default function App() {
  const [currentTab, setCurrentTab] = useState("overview");
  const [selectedBlockId, setSelectedBlockId] = useState("ADMIN");

  const handleOpenBlockDetail = (id) => {
    setSelectedBlockId(id);
    setCurrentTab("block-detail");
  };

  return (
    <ErrorBoundary>
      <CampusProvider>
        <div className="min-h-screen bg-slate-100/70 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
          {/* Global Presidency University Navigation Header */}
          <Navbar onNavigateTab={setCurrentTab} />

          {/* Main Body */}
          <div className="flex-1 flex">
            {/* Responsive Navigation Sidebar */}
            <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

            {/* Dynamic Page Content (ml-60 offset for fixed left sidebar) */}
            <main className="flex-1 ml-60 p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0">
              {/* Block Intelligence Group */}
              {currentTab === "blocks-explorer" && (
                <BlockExplorerPage
                  onSelectBlock={handleOpenBlockDetail}
                  onNavigateTab={setCurrentTab}
                />
              )}
              {currentTab === "blocks-map" && (
                <CampusMapPage onSelectBlock={handleOpenBlockDetail} />
              )}
              {currentTab === "blocks-compare" && (
                <BlockComparePage onSelectBlock={handleOpenBlockDetail} />
              )}
              {currentTab === "blocks-leaderboard" && (
                <LeaderboardPage onSelectBlock={handleOpenBlockDetail} />
              )}
              {currentTab === "block-detail" && (
                <BlockDetailPage
                  blockId={selectedBlockId}
                  onBack={() => setCurrentTab("blocks-explorer")}
                  onNavigateTab={setCurrentTab}
                />
              )}

              {/* Campus Resource Intelligence Group */}
              {currentTab === "overview" && (
                <OverviewPage
                  onNavigateTab={setCurrentTab}
                  onSelectBlock={handleOpenBlockDetail}
                />
              )}
              {currentTab === "solar" && <SolarIntelligencePage onNavigateTab={setCurrentTab} />}
              {currentTab === "water" && <WaterIntelligencePage onNavigateTab={setCurrentTab} />}
              {currentTab === "waste" && <WasteIntelligencePage onNavigateTab={setCurrentTab} />}
              {currentTab === "inefficiencies" && <InefficienciesPage onNavigateTab={setCurrentTab} />}
              {currentTab === "recommendations" && <RecommendationsPage onNavigateTab={setCurrentTab} />}
              {currentTab === "simulator" && <InterventionSimulatorPage onNavigateTab={setCurrentTab} />}
              {currentTab === "ml" && <MLIntelligencePage onNavigateTab={setCurrentTab} />}
              {currentTab === "actions" && <ActionTrackerPage />}
              {currentTab === "impact" && <ImpactVerificationPage />}
              {currentTab === "data" && <DataManagementPage onNavigateTab={setCurrentTab} />}
              {currentTab === "datasets" && <ExternalDatasetsPage />}
            </main>
          </div>

          {/* Toast Alerts System */}
          <ToastContainer />
        </div>
      </CampusProvider>
    </ErrorBoundary>
  );
}
