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
  const [currentPage, setCurrentPage] = useState('landing');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isAIDemoOpen, closeAIDemo } = useWasteData();

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onLaunchApp={() => setCurrentPage('command-center')} onNavigate={setCurrentPage} />;
      case 'command-center':
      case 'command':
        return <CommandCenterPage onNavigate={setCurrentPage} onNavigateTab={setCurrentPage} />;
      case 'operations':
        return <LiveOperationsPage onNavigate={setCurrentPage} onNavigateTab={setCurrentPage} />;
      case 'bins':
        return <BinIntelligencePage onNavigate={setCurrentPage} />;
      case 'vision':
        return <WasteVisionPage onNavigate={setCurrentPage} />;
      case 'routes':
        return <RouteOptimizerPage onNavigate={setCurrentPage} />;
      case 'analytics':
        return <AnalyticsHotspotsPage onNavigate={setCurrentPage} />;
      case 'recycling':
        return <RecyclingIntelligencePage onNavigate={setCurrentPage} />;
      case 'simulator':
        return <WhatIfSimulatorPage onNavigate={setCurrentPage} />;
      case 'events':
        return <EventPlacementPage onNavigate={setCurrentPage} />;
      case 'ai-assistant':
      case 'ai-manager':
        return <AIWasteManagerPage onNavigate={setCurrentPage} />;
      case 'settings':
        return <SettingsPage onNavigate={setCurrentPage} />;
      default:
        return <CommandCenterPage onNavigate={setCurrentPage} onNavigateTab={setCurrentPage} />;
    }
  };

  const isLanding = currentPage === 'landing';

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-[#17201B] flex flex-col font-sans selection:bg-[#16845B] selection:text-white">
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
      <BinDigitalTwinModal onNavigateTab={setCurrentPage} />

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
