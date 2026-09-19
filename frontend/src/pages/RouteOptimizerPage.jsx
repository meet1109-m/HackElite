import React, { useState } from 'react';
import { useWasteData } from '../context/WasteDataContext';
import { Truck, Navigation, CheckCircle2, AlertTriangle, ArrowRight, Zap, RefreshCw, Gauge, MapPin, Sparkles, Clock, ShieldAlert } from 'lucide-react';

export default function RouteOptimizerPage() {
  const { vehicles, routes, optimizeRoute, triggerDynamicReplan, replanState, bins } = useWasteData();
  const [selectedVehicleId, setSelectedVehicleId] = useState('V-01');
  const [optimizing, setOptimizing] = useState(false);
  const [replanning, setReplanning] = useState(false);
  const [selectedBinForMatch, setSelectedBinForMatch] = useState('AHM-104');

  const activeVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];
  const activeRoute = routes[selectedVehicleId] || {
    vehicle_id: selectedVehicleId,
    distance_km: 27.4,
    duration_minutes: 98,
    collected_weight_kg: 1740,
    vehicle_capacity_kg: 2000,
    utilization_pct: 87.0,
    stops: [
      { stop_number: 0, bin_id: 'DEPOT', bin_code: 'DEPOT-01 (Sabarmati AMC)', is_depot: true, weight_kg: 0, priority: 0 },
      { stop_number: 1, bin_id: 'AHM-104', bin_code: 'AHM-104 (Sabarmati)', is_depot: false, weight_kg: 340, priority: 96, is_critical: true },
      { stop_number: 2, bin_id: 'AHM-118', bin_code: 'AHM-118 (Navrangpura)', is_depot: false, weight_kg: 420, priority: 91, is_critical: true },
      { stop_number: 3, bin_id: 'AHM-091', bin_code: 'AHM-091 (Vastrapur)', is_depot: false, weight_kg: 510, priority: 84, is_critical: false },
      { stop_number: 4, bin_id: 'AHM-127', bin_code: 'AHM-127 (Bodakdev)', is_depot: false, weight_kg: 470, priority: 78, is_critical: false },
      { stop_number: 5, bin_id: 'DEPOT', bin_code: 'DEPOT-01 (Sabarmati AMC)', is_depot: true, weight_kg: 0, priority: 0 }
    ]
  };

  const handleRunOptimize = async () => {
    setOptimizing(true);
    await optimizeRoute(selectedVehicleId);
    setOptimizing(false);
  };

  const handleReplan = async () => {
    setReplanning(true);
    await triggerDynamicReplan();
    setReplanning(false);
  };

  // Best vehicle matching mock logic for interactive widget
  const candidateVehicles = [
    { id: 'V-01', name: 'Truck V-01 (Heavy Compactor)', distance_km: 2.4, avail_kg: 1700, status: 'Active (Sabarmati)', eligible: true, score: 94 },
    { id: 'V-02', name: 'Truck V-02 (Medium Electric)', distance_km: 1.2, avail_kg: 200, status: 'Near Full (Navrangpura)', eligible: false, reason: 'Insufficient capacity (200kg < 280kg required)' },
    { id: 'V-03', name: 'Truck V-03 (Standard Tipper)', distance_km: 4.1, avail_kg: 1100, status: 'Active (Vastrapur)', eligible: true, score: 81 }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Truck className="w-8 h-8 text-emerald-400" />
              AI Route Optimizer & Dynamic Replanner
            </h1>
            <span className="px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              OR-Tools Capacitated TSP Engine
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Capacity-constrained collection routing with dynamic real-time insertion for high-urgency overflow events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunOptimize}
            disabled={optimizing}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${optimizing ? 'animate-spin' : ''}`} />
            Recalculate Route
          </button>
        </div>
      </div>

      {/* DYNAMIC ROUTE REPLANNING SPOTLIGHT CARD */}
      <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-emerald-950/30 border border-amber-500/40 p-6 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40 rounded-full flex items-center gap-1.5 animate-pulse">
                <ShieldAlert className="w-3 h-3" />
                Live Replanning Scenario Active
              </span>
              <span className="text-xs text-slate-400">Emergency Overflow Event at AHM-156</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              Dynamic Mid-Route Insertion Engine
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Bin <strong className="text-white">AHM-156 (Sabarmati Riverfront)</strong> is predicted to overflow in <strong className="text-red-400">45 minutes</strong>. The optimizer evaluates vehicle trajectories and recalculates the optimal waypoint insertion with minimum deviation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <div className="text-center px-3 border-r border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Original Route</span>
              <span className="text-base font-bold text-slate-300">31.2 km</span>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Replanned Route</span>
              <span className="text-base font-bold text-emerald-400">33.4 km</span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Delta</span>
              <span className="text-sm font-bold text-amber-400 font-mono">+2.2 km</span>
            </div>

            <button
              onClick={handleReplan}
              disabled={replanning}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${replanning ? 'animate-spin' : ''}`} />
              {replanState.isReplanned ? 'Route Updated with AHM-156' : 'Execute Dynamic Replan'}
            </button>
          </div>
        </div>

        {replanState.isReplanned && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-semibold bg-emerald-950/20 p-3 rounded-xl">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Replanning Successful: Bin AHM-156 inserted between Stop #1 and Stop #2. Overflow averted.
            </span>
            <span className="text-slate-400 font-mono text-[11px]">Computed via Hungarian Insertion Algorithm</span>
          </div>
        )}
      </div>

      {/* Main Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Fleet Selection & Capacity Breakdown */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Fleet Selector */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Municipal Fleet Roster</span>
              <span className="text-xs text-emerald-400 font-mono">{vehicles.length} Trucks</span>
            </h3>

            <div className="space-y-2.5">
              {vehicles.map(v => {
                const util = ((v.current_load / v.capacity_kg) * 100).toFixed(0);
                const isSelected = v.id === selectedVehicleId;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={`w-full p-3.5 rounded-xl border text-left transition flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/60 ring-1 ring-emerald-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                        <span className="font-bold text-white text-xs">{v.vehicle_code}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-300 font-mono">
                        {v.current_load} / {v.capacity_kg} kg ({util}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          util > 85 ? 'bg-red-500' : util > 65 ? 'bg-amber-500' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(100, util)}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Capacity Constraint Guarantee */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-400" />
              Strict Capacity Constraint
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The optimizer strictly enforces that total collected weight across all sequence waypoints never exceeds vehicle rated capacity ({activeVehicle?.capacity_kg || 2000} kg).
            </p>
          </div>
        </div>

        {/* Middle / Right Column: Active Route Waypoint Timeline & Best Vehicle Matcher */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Route Summary Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider block">Assigned Route Plan</span>
                <h2 className="text-lg font-bold text-white">Route for {activeVehicle?.vehicle_code || 'Truck V-01'}</h2>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Distance</span>
                  <span className="text-white font-mono">{activeRoute.distance_km} km</span>
                </div>
                <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Duration</span>
                  <span className="text-white font-mono">{activeRoute.duration_minutes} min</span>
                </div>
                <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Payload</span>
                  <span className="text-emerald-400 font-mono">{activeRoute.collected_weight_kg} kg</span>
                </div>
              </div>
            </div>

            {/* Sequence Waypoints Timeline */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Optimized Sequence Waypoints</span>
              
              <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-4">
                {activeRoute.stops.map((stop, idx) => (
                  <div key={idx} className="relative group">
                    {/* Circle marker on line */}
                    <div className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                      stop.is_depot ? 'bg-slate-400' : stop.is_critical ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'
                    }`} />

                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-slate-500 w-6">#{idx}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{stop.bin_code}</span>
                            {stop.is_critical && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">
                                Priority {stop.priority}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {stop.is_depot ? 'Depot Hub Operations' : `Estimated Payload: ${stop.weight_kg} kg`}
                          </span>
                        </div>
                      </div>

                      <div className="text-right text-xs">
                        <span className="text-slate-500 block text-[10px]">Action</span>
                        <span className="font-semibold text-slate-300">
                          {stop.is_depot ? 'Dispatch / Offload' : 'Collect & Compress'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Best Vehicle for Bin Intelligent Matcher */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Best Vehicle for Critical Bin Selection
                </h3>
                <p className="text-xs text-slate-400">Automated multi-factor matching based on proximity and remaining capacity</p>
              </div>

              <select
                value={selectedBinForMatch}
                onChange={(e) => setSelectedBinForMatch(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-white px-3 py-1.5 rounded-xl focus:outline-none focus:border-emerald-500"
              >
                <option value="AHM-104">Bin AHM-104 (280 kg req)</option>
                <option value="AHM-118">Bin AHM-118 (340 kg req)</option>
                <option value="AHM-156">Bin AHM-156 (410 kg req)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {candidateVehicles.map(c => (
                <div
                  key={c.id}
                  className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between ${
                    c.eligible
                      ? 'bg-slate-950/60 border-slate-800'
                      : 'bg-red-950/10 border-red-500/20 opacity-70'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-white">{c.id}</span>
                      {c.eligible ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          Match Score: {c.score}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                          Ineligible
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-[11px] mb-2">{c.status}</p>
                    <div className="space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between text-slate-300">
                        <span>Proximity:</span>
                        <span>{c.distance_km} km</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Avail Cap:</span>
                        <span className={c.eligible ? 'text-emerald-400 font-bold' : 'text-red-400'}>{c.avail_kg} kg</span>
                      </div>
                    </div>
                  </div>

                  {!c.eligible && (
                    <p className="text-[10px] text-red-400 mt-2 font-semibold">{c.reason}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>AI Recommendation: Assign <strong>Truck V-01</strong> (Closest proximity with 1,700 kg available margin).</span>
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
