import React, { useState } from 'react';
import { WasteDataProvider, useWasteData } from './context/WasteDataContext';
import Navbar from './components/Navigation/Navbar';
import Sidebar from './components/Navigation/Sidebar';
import BinDigitalTwinModal from './components/Common/BinDigitalTwinModal';
import AIDemoModal from './components/Demo/AIDemoModal';

// Pages
import LandingPage from './pages/LandingPage';
import CommandCenterPage from './pages/CommandCenterPage';
import LiveOperationsPage from './pages/LiveOperationsPage';
import BinIntelligencePage from './pages/BinIntelligencePage';
import WasteVisionPage from './pages/WasteVisionPage';
import RouteOptimizerPage from './pages/RouteOptimizerPage';
import AnalyticsHotspotsPage from './pages/AnalyticsHotspotsPage';
import RecyclingIntelligencePage from './pages/RecyclingIntelligencePage';
import WhatIfSimulatorPage from './pages/WhatIfSimulatorPage';
import EventPlacementPage from './pages/EventPlacementPage';
import AIWasteManagerPage from './pages/AIWasteManagerPage';
import SettingsPage from './pages/SettingsPage';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('landing'); // default landing
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isAIDemoOpen, closeAIDemo } = useWasteData();

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onLaunchApp={() => setCurrentPage('command-center')} onNavigate={setCurrentPage} />;
      case 'command-center':
        return <CommandCenterPage onNavigate={setCurrentPage} />;
      case 'operations':
        return <LiveOperationsPage />;
      case 'bins':
        return <BinIntelligencePage />;
      case 'vision':
        return <WasteVisionPage />;
      case 'routes':
        return <RouteOptimizerPage />;
      case 'analytics':
        return <AnalyticsHotspotsPage />;
      case 'recycling':
        return <RecyclingIntelligencePage />;
      case 'simulator':
        return <WhatIfSimulatorPage />;
      case 'events':
        return <EventPlacementPage />;
      case 'ai-assistant':
        return <AIWasteManagerPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <CommandCenterPage onNavigate={setCurrentPage} />;
    }
  };

  const isLanding = currentPage === 'landing';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onToggleSidebar={() => setSidebarCollapsed(prev => !prev)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (hidden on Landing Page) */}
        {!isLanding && (
          <Sidebar
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(prev => !prev)}
          />
        )}

        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto ${isLanding ? 'w-full' : ''}`}>
          {renderPage()}
        </main>
      </div>

      {/* Global Digital Twin Modal */}
      <BinDigitalTwinModal />

      {/* Global 10-Step AI Demo Modal */}
      <AIDemoModal isOpen={isAIDemoOpen} onClose={closeAIDemo} />
    </div>
  );
}

export default function App() {
  return (
    <WasteDataProvider>
      <AppContent />
    </WasteDataProvider>
  );
}
