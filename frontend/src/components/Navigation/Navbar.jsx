import React, { useState, useEffect } from 'react';
import { Play, Sparkles, AlertCircle, Bell, Search, Activity, ShieldAlert, Cpu } from 'lucide-react';
import { useWasteData } from '../../context/WasteDataContext';

export const Navbar = ({ activeTab, onTabChange }) => {
  const { bins, startAIDemo } = useWasteData();
  const [time, setTime] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const criticalCount = bins.filter(b => b.status === 'Critical' || b.status === 'Overflow Risk').length;

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & City Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onTabChange('command')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <Cpu className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white font-mono">SmartBinX</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Ahmedabad AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              Waste Intelligence & Circularity Optimizer
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-slate-800 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>AMC IoT Telemetry Grid: <strong>120 Nodes Active</strong></span>
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-3">
        {/* Prototype / Simulated Data Notice */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/50 border border-amber-800/60 rounded-lg text-[11px] text-amber-300 font-medium">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Demo environment — simulated operational data</span>
        </div>

        {/* Live IST Clock */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>{time} IST</span>
        </div>

        {/* Critical Alerts Badge */}
        {criticalCount > 0 && (
          <div 
            onClick={() => onTabChange('bins')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-700/80 text-rose-300 text-xs font-bold cursor-pointer hover:bg-rose-900/80 transition-colors animate-pulse-slow"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>{criticalCount} Critical Bins</span>
          </div>
        )}

        {/* Signature Run AI Demo Button */}
        <button
          onClick={startAIDemo}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold rounded-lg shadow-lg shadow-emerald-950/60 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span className="tracking-wide">Run AI Demo</span>
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
