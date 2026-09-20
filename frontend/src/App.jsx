import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Navigate, 
  useNavigate, 
  useLocation, 
  Outlet 
} from 'react-router-dom';
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
    return sessionStorage.getItem('smartbinx_auth') === 'true' && Boolean(sessionStorage.getItem('smartbinx_token'));
  } catch (e) {
    return false;
  }
}

// Protected Route Guard
function ProtectedRoute({ isAuthenticated, children }) {
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

// App Layout with Navbar, Sidebar, and Modals
function AppLayout({ isAuthenticated, onLogout }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAIDemoOpen, closeAIDemo } = useWasteData();

  // Extract current tab name from pathname (e.g. /bins/AHM-104 -> 'bins')
  const currentTab = location.pathname.split('/')[1] || 'command-center';

  const handleNavigate = (page) => {
    if (!page) return;
    const target = page.startsWith('/') ? page : `/${page}`;
    navigate(target);
  };

  return (
    <div className="min-h-screen text-[#17201B] flex flex-col font-sans selection:bg-[#0D5C3A] selection:text-white relative">
      {/* Top Navbar */}
      <Navbar
        currentPage={currentTab}
        onNavigate={handleNavigate}
        isAuthenticated={isAuthenticated}
        onLogout={onLogout}
        onToggleSidebar={() => setSidebarCollapsed(prev => !prev)}
      />

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentTab}
          onNavigate={handleNavigate}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(prev => !prev)}
          onLogout={onLogout}
        />

        {/* Main Content Area */}
        <main className="page-container flex-1 overflow-y-auto">
          <Outlet context={{ onNavigate: handleNavigate }} />
        </main>
      </div>

      {/* Global Digital Twin Modal */}
      <BinDigitalTwinModal onNavigateTab={handleNavigate} />

      {/* Global 10-Step AI Demo Modal */}
      <AIDemoModal isOpen={isAIDemoOpen} onClose={closeAIDemo} />
    </div>
  );
}

function AppRoutes() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => getInitialAuthState());
  const navigate = useNavigate();
  const location = useLocation();

  // Handle legacy hash navigation migration (e.g. /#command-center -> /command-center)
  useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash) {
        window.history.replaceState(null, '', window.location.pathname);
        navigate(`/${hash}`, { replace: true });
      }
    }
  }, [navigate]);

  const handleLoginSuccess = () => {
    try {
      sessionStorage.setItem('smartbinx_auth', 'true');
    } catch (e) {}
    setIsAuthenticated(true);
    const destination = location.state?.from?.pathname || '/command-center';
    navigate(destination, { replace: true });
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('smartbinx_auth');
      sessionStorage.removeItem('smartbinx_token');
      sessionStorage.removeItem('smartbinx_user');
    } catch (e) {}
    setIsAuthenticated(false);
    navigate('/login', { replace: true });
  };

  const handleNavigate = (page) => {
    const target = page.startsWith('/') ? page : `/${page}`;
    navigate(target);
  };

  return (
    <Routes>
      {/* Public Pages */}
      <Route 
        path="/" 
        element={
          <div className="min-h-screen text-[#17201B] flex flex-col font-sans selection:bg-[#0D5C3A] selection:text-white relative">
            <Navbar
              currentPage="landing"
              onNavigate={handleNavigate}
              isAuthenticated={isAuthenticated}
              onLogout={handleLogout}
              onToggleSidebar={() => {}}
            />
            <main className="page-container flex-1 overflow-y-auto w-full">
              <LandingPage onLaunchApp={() => handleNavigate('command-center')} onNavigate={handleNavigate} />
            </main>
          </div>
        } 
      />
      <Route 
        path="/landing" 
        element={<Navigate to="/" replace />} 
      />
      <Route 
        path="/login" 
        element={
          <div className="min-h-screen text-[#17201B] flex flex-col font-sans selection:bg-[#0D5C3A] selection:text-white relative">
            <Navbar
              currentPage="login"
              onNavigate={handleNavigate}
              isAuthenticated={isAuthenticated}
              onLogout={handleLogout}
              onToggleSidebar={() => {}}
            />
            <main className="page-container flex-1 overflow-y-auto w-full login-page">
              <LoginPage onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />
            </main>
          </div>
        } 
      />

      {/* Protected Command & Operations Modules */}
      <Route 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AppLayout isAuthenticated={isAuthenticated} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      >
        <Route path="/command-center" element={<CommandCenterPage onNavigate={handleNavigate} onNavigateTab={handleNavigate} />} />
        <Route path="/command" element={<Navigate to="/command-center" replace />} />
        <Route path="/operations" element={<LiveOperationsPage onNavigate={handleNavigate} onNavigateTab={handleNavigate} />} />
        
        {/* Route parameters for /bins and /bins/:binId */}
        <Route path="/bins" element={<BinIntelligencePage onNavigate={handleNavigate} />} />
        <Route path="/bins/:binId" element={<BinIntelligencePage onNavigate={handleNavigate} />} />
        
        <Route path="/vision" element={<WasteVisionPage onNavigate={handleNavigate} />} />
        
        {/* Route parameters for /routes and /routes/:vehicleId */}
        <Route path="/routes" element={<RouteOptimizerPage onNavigate={handleNavigate} />} />
        <Route path="/routes/:vehicleId" element={<RouteOptimizerPage onNavigate={handleNavigate} />} />
        
        <Route path="/analytics" element={<AnalyticsHotspotsPage onNavigate={handleNavigate} />} />
        <Route path="/recycling" element={<RecyclingIntelligencePage onNavigate={handleNavigate} />} />
        <Route path="/simulator" element={<WhatIfSimulatorPage onNavigate={handleNavigate} />} />
        <Route path="/events" element={<EventPlacementPage onNavigate={handleNavigate} />} />
        <Route path="/ai-assistant" element={<AIWasteManagerPage onNavigate={handleNavigate} />} />
        <Route path="/ai-manager" element={<Navigate to="/ai-assistant" replace />} />
        <Route path="/settings" element={<SettingsPage onNavigate={handleNavigate} />} />
      </Route>

      {/* Catch-all 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <WasteDataProvider>
        <AppRoutes />
      </WasteDataProvider>
    </BrowserRouter>
  );
}
