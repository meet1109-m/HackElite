import React, { useState } from 'react';
import { WasteDataProvider, useWasteData } from './context/WasteDataContext';
import Navbar from './components/Navigation/Navbar';
import Sidebar from './components/Navigation/Sidebar';
import BinDigitalTwinModal from './components/Common/BinDigitalTwinModal';
import AIDemoModal from './components/Demo/AIDemoModal';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
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

function getInitialAuthState() {
  try {
    return sessionStorage.getItem('smartbinx_auth') === 'true';
  } catch (e) {
    return false;
  }
}

function getInitialRoute(isAuth) {
  try {
    const hash = window.location.hash.replace('#', '').trim();
    if (hash === 'login') return 'login';
    if (hash === 'landing' || !hash) return 'landing';
    
    // Protected routes
    const protectedRoutes = [
      'command-center', 'command', 'operations', 'bins', 'vision', 
      'routes', 'analytics', 'recycling', 'simulator', 'events', 
      'ai-assistant', 'ai-manager', 'settings'
    ];
    
    if (protectedRoutes.includes(hash)) {
      if (isAuth) return hash;
      return 'login';
    }
    return 'landing';
  } catch (e) {
    return 'landing';
  }
}

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => getInitialAuthState());
  const [currentPage, setCurrentPage] = useState(() => getInitialRoute(getInitialAuthState()));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isAIDemoOpen, closeAIDemo } = useWasteData();

  // Listen to browser hash changes (back/forward & manual navigation)
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (!hash || hash === 'landing') {
        setCurrentPage('landing');
      } else if (hash === 'login') {
        setCurrentPage('login');
      } else {
        if (!isAuthenticated) {
          setCurrentPage('login');
          window.location.hash = 'login';
        } else {
          setCurrentPage(hash);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    try {
      sessionStorage.setItem('smartbinx_auth', 'true');
    } catch (e) {}
    setIsAuthenticated(true);
    setCurrentPage('command-center');
    window.location.hash = 'command-center';
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('smartbinx_auth');
    } catch (e) {}
    setIsAuthenticated(false);
    setCurrentPage('login');
    window.location.hash = 'login';
  };

  const handleNavigate = (page) => {
    // Protected routes guard: require authentication
    if (!isAuthenticated && page !== 'login' && page !== 'landing') {
      setCurrentPage('login');
      window.location.hash = 'login';
      return;
    }
    setCurrentPage(page);
    window.location.hash = page;
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onLaunchApp={() => handleNavigate('command-center')} onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
      case 'command-center':
      case 'command':
        return <CommandCenterPage onNavigate={handleNavigate} onNavigateTab={handleNavigate} />;
      case 'operations':
        return <LiveOperationsPage onNavigate={handleNavigate} onNavigateTab={handleNavigate} />;
      case 'bins':
        return <BinIntelligencePage onNavigate={handleNavigate} />;
      case 'vision':
        return <WasteVisionPage onNavigate={handleNavigate} />;
      case 'routes':
        return <RouteOptimizerPage onNavigate={handleNavigate} />;
      case 'analytics':
        return <AnalyticsHotspotsPage onNavigate={handleNavigate} />;
      case 'recycling':
        return <RecyclingIntelligencePage onNavigate={handleNavigate} />;
      case 'simulator':
        return <WhatIfSimulatorPage onNavigate={handleNavigate} />;
      case 'events':
        return <EventPlacementPage onNavigate={handleNavigate} />;
      case 'ai-assistant':
      case 'ai-manager':
        return <AIWasteManagerPage onNavigate={handleNavigate} />;
      case 'settings':
        return <SettingsPage onNavigate={handleNavigate} />;
      default:
        return <LandingPage onLaunchApp={() => handleNavigate('command-center')} onNavigate={handleNavigate} />;
    }
  };

  const isFullWidth = currentPage === 'landing' || currentPage === 'login';

  return (
    <div className="min-h-screen text-[#17201B] flex flex-col font-sans selection:bg-[#0D5C3A] selection:text-white relative">
      {/* Top Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        onToggleSidebar={() => setSidebarCollapsed(prev => !prev)}
      />

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Sidebar (hidden on Landing & Login Pages) */}
        {!isFullWidth && (
          <Sidebar
            currentPage={currentPage}
            onNavigate={handleNavigate}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(prev => !prev)}
            onLogout={handleLogout}
          />
        )}

        {/* Main Content Area with Page-Specific Dimming Overlay */}
        <main className={`page-container flex-1 overflow-y-auto ${isFullWidth ? 'w-full' : ''} ${currentPage === 'login' ? 'login-page' : ''}`}>
          {renderPage()}
        </main>
      </div>

      {/* Global Digital Twin Modal */}
      <BinDigitalTwinModal onNavigateTab={handleNavigate} />

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
