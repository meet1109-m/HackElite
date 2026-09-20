import React, { useState, useEffect } from 'react';
import { Play, AlertCircle, Search, Activity, ShieldAlert, ChevronRight, CheckCircle2, Sparkles } from 'lucide-react';
import { useWasteData } from '../../context/WasteDataContext';

export const Navbar = ({ currentPage, activeTab, onNavigate, onTabChange, isAuthenticated, onLogout }) => {
  const currentTab = currentPage || activeTab || 'login';
  const handleNav = onNavigate || onTabChange;
  const { bins, startAIDemo, openDigitalTwin } = useWasteData();
  const [time, setTime] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Search filter
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const filtered = bins.filter(b => 
        b.bin_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.address.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4);
      setSearchResults(filtered);
      setShowSearchDropdown(true);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  }, [searchQuery, bins]);

  const criticalCount = bins.filter(b => b.status === 'Critical' || b.status === 'Overflow Risk').length;
  const isAuthPage = currentTab === 'login';

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-white/60 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Brand & City Indicator */}
      <div className="flex items-center gap-4">
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => handleNav(isAuthenticated ? 'command-center' : 'login')}
        >
          <img 
            src="/smartbinx-logo.png" 
            alt="SmartBinX Logo" 
            className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-[#17201B] font-mono">SmartBinX</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#DCFCE7] text-[#0B5D3B] border border-[#BBF7D0]">
                Ahmedabad AI
              </span>
            </div>
            <p className="text-[10px] text-[#66736C] font-medium">
              Waste Intelligence & Circularity
            </p>
          </div>
        </div>

        {!isAuthPage && (
          <div className="hidden lg:flex items-center gap-2 ml-2 pl-4 border-l border-[#E3EAE6] text-xs text-[#66736C]">
            <span className="w-2 h-2 rounded-full bg-[#16845B] animate-pulse"></span>
            <span>AMC IoT Grid: <strong className="text-[#17201B]">120 Smart Nodes</strong></span>
          </div>
        )}
      </div>

      {/* Center Search Bar with autocomplete (visible on dashboard views) */}
      {!isAuthPage && currentTab !== 'landing' && (
        <div className="hidden md:block relative w-64 lg:w-80">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#66736C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Bin (e.g. AHM-104)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length > 1 && setShowSearchDropdown(true)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#F7FAF8] hover:bg-white border border-[#E3EAE6] focus:border-[#16845B] rounded-xl text-xs text-[#17201B] placeholder-[#94A39D] focus:outline-none transition shadow-sm"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E3EAE6] rounded-xl shadow-xl z-50 overflow-hidden py-1">
              {searchResults.map(b => (
                <div
                  key={b.id}
                  onClick={() => {
                    openDigitalTwin(b);
                    setShowSearchDropdown(false);
                    setSearchQuery('');
                  }}
                  className="px-3 py-2 hover:bg-[#F0FDF4] cursor-pointer flex items-center justify-between text-xs border-b border-[#F1F6F3] last:border-b-0"
                >
                  <div>
                    <span className="font-bold text-[#17201B] font-mono">{b.bin_code}</span>
                    <span className="text-[11px] text-[#66736C] ml-2">{b.zone}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${b.priority_score >= 85 ? 'bg-[#FEE2E2] text-[#991B1B]' : 'bg-[#DCFCE7] text-[#065F46]'}`}>
                    {b.fill_percentage}% Fill
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Right Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Prototype Notice */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg text-[11px] text-[#92400E] font-medium">
          <AlertCircle className="w-3.5 h-3.5 text-[#E89A27] shrink-0" />
          <span>Simulated Operational Telemetry</span>
        </div>

        {/* Live IST Clock */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#F1F6F3] rounded-lg border border-[#E3EAE6] text-xs font-mono text-[#17201B]">
          <Activity className="w-3.5 h-3.5 text-[#16845B]" />
          <span>{time} IST</span>
        </div>

        {/* Interactive 10-Step AI Demo Launcher */}
        <button
          onClick={startAIDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#16845B] to-[#0D9488] text-white text-xs font-bold hover:brightness-110 shadow-md shadow-[#16845B]/20 transition-all cursor-pointer"
          title="Launch Autonomous 10-Step Hackathon Demo"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">10-Step AI Demo</span>
          <span className="sm:hidden">Demo</span>
        </button>

        {/* Critical Alerts Badge (when on dashboard) */}
        {!isAuthPage && criticalCount > 0 && (
          <button
            onClick={() => handleNav('bins')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] text-xs font-bold hover:bg-[#FCA5A5]/40 transition-colors animate-pulse-slow shadow-sm"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#D64545]" />
            <span>{criticalCount} Critical</span>
          </button>
        )}

        {/* Operator Login Button on Landing Page */}
        {currentTab === 'landing' && !isAuthenticated && (
          <button
            onClick={() => handleNav('login')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#DCFCE7] hover:bg-[#BBF7D0] border border-[#BBF7D0] text-[#065F46] text-xs font-bold rounded-xl transition shadow-sm"
          >
            <span>Operator Login</span>
          </button>
        )}

        {/* Public Portal Switch when on Login Page */}
        {isAuthPage && (
          <button
            onClick={() => handleNav('landing')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/90 hover:bg-white text-[#17201B] hover:text-[#0B5D3B] text-xs font-bold rounded-xl border border-[#E3EAE6] transition shadow-sm"
          >
            <span>← Public Portal</span>
          </button>
        )}

        {/* Public Portal Switch when on Dashboard */}
        {isAuthenticated && !isAuthPage && currentTab !== 'landing' && (
          <button
            onClick={() => handleNav('landing')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/80 hover:bg-white text-[#17201B] hover:text-[#0B5D3B] text-xs font-bold rounded-xl border border-[#E3EAE6] transition shadow-sm"
          >
            <span>Public Portal</span>
          </button>
        )}

        {/* Logout / Switch Operator Button */}
        {isAuthenticated && !isAuthPage && (
          <button
            onClick={onLogout || (() => handleNav('login'))}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#F1F6F3] hover:bg-[#FEE2E2] hover:text-[#991B1B] text-[#17201B] text-xs font-bold rounded-xl border border-[#E3EAE6] transition shadow-sm"
          >
            <span>Lock / Switch Operator</span>
          </button>
        )}

        {/* Signature Run AI Demo Button */}
        <button
          onClick={startAIDemo}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#16845B] to-[#0D9488] hover:from-[#0B5D3B] hover:to-[#0F6B47] text-white text-xs font-bold rounded-xl shadow-md shadow-[#16845B]/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Run AI Demo</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-200"></span>
          </span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
