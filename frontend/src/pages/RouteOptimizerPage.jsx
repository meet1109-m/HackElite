import React, { useState } from 'react';
import { useWasteData } from '../context/WasteDataContext';
import { Truck, Navigation, CheckCircle2, AlertTriangle, ArrowRight, Zap, RefreshCw, Gauge, MapPin, Sparkles, Clock, ShieldAlert } from 'lucide-react';

export default function RouteOptimizerPage() {
  const { vehicles, routes, optimizeRoute, triggerDynamicReplan, replanState, bins } = useWasteData();
  const [selectedVehicleId, setSelectedVehicleId] = useState('V-01');
  const [optimizing, setOptimizing] = useState(false);
  const [replanning, setReplanning] = useState(false);
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('All');
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
      { stop_number: 0, bin_id: 'DEPOT', bin_code: 'DEPOT-01 (Sabarmati AMC Hub)', is_depot: true, weight_kg: 0, priority: 0 },
      { stop_number: 1, bin_id: 'AHM-104', bin_code: 'AHM-104 (Sabarmati Riverfront)', is_depot: false, weight_kg: 340, priority: 94, is_critical: true },
      { stop_number: 2, bin_id: 'AHM-118', bin_code: 'AHM-118 (Navrangpura CG Road)', is_depot: false, weight_kg: 420, priority: 89, is_critical: true },
      { stop_number: 3, bin_id: 'AHM-091', bin_code: 'AHM-091 (Vastrapur Food Court)', is_depot: false, weight_kg: 510, priority: 76, is_critical: false },
      { stop_number: 4, bin_id: 'AHM-127', bin_code: 'AHM-127 (Bodakdev SBR Plaza)', is_depot: false, weight_kg: 470, priority: 72, is_critical: false },
      { stop_number: 5, bin_id: 'DEPOT', bin_code: 'DEPOT-01 (Sabarmati AMC Hub)', is_depot: true, weight_kg: 0, priority: 0 }
    ]
  };

  const filteredStops = activeRoute.stops.filter(stop => {
    if (stop.is_depot) return true;
    if (selectedPriorityFilter === 'Critical') return stop.priority >= 85;
    if (selectedPriorityFilter === 'High') return stop.priority >= 70;
    return true;
  });

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
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#17201B] flex items-center gap-2">
              <Truck className="w-7 h-7 text-[#16845B]" />
              AI Route Optimizer & Dynamic Replanner
            </h1>
            <span className="px-3 py-1 text-xs font-bold bg-[#DCFCE7] text-[#0B5D3B] border border-[#BBF7D0] rounded-full">
              OR-Tools Capacitated TSP Engine
            </span>
          </div>
          <p className="text-[#66736C] text-xs sm:text-sm mt-1">
            Capacity-constrained collection routing with dynamic real-time insertion for high-urgency overflow events in Ahmedabad.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunOptimize}
            disabled={optimizing}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#16845B] hover:bg-[#0B5D3B] text-white text-xs font-bold rounded-xl transition shadow-md shadow-[#16845B]/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${optimizing ? 'animate-spin' : ''}`} />
            <span>Generate Optimal Route</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC ROUTE REPLANNING SPOTLIGHT CARD */}
      <div className="bg-white border border-[#FDE68A] p-6 rounded-3xl shadow-md relative overflow-hidden space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] rounded-full flex items-center gap-1.5">
                <ShieldAlert className="w-3 h-3 text-[#D64545]" />
                Live Replanning Scenario Active
              </span>
              <span className="text-xs text-[#66736C] font-semibold">Emergency Overflow at AHM-156</span>
            </div>
            <h3 className="text-xl font-black text-[#17201B]">
              Dynamic Mid-Route Waypoint Insertion
            </h3>
            <p className="text-xs text-[#66736C] leading-relaxed">
              Bin <strong className="text-[#17201B]">AHM-156 (Sabarmati Riverfront Flower Park)</strong> is predicted to overflow in <strong className="text-[#D64545]">45 minutes</strong>. The optimizer recalculates the optimal waypoint insertion with minimum deviation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-[#F7FAF8] p-4 rounded-2xl border border-[#E3EAE6]">
            <div className="text-center px-3 border-r border-[#E3EAE6]">
              <span className="text-[10px] text-[#66736C] block uppercase font-mono font-bold">Previous Route</span>
              <span className="text-base font-bold text-[#66736C]">31.2 km</span>
            </div>
            <div className="text-center px-3 border-r border-[#E3EAE6]">
              <span className="text-[10px] text-[#66736C] block uppercase font-mono font-bold">Replanned Route</span>
              <span className="text-base font-black text-[#16845B]">33.4 km</span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-[#66736C] block uppercase font-mono font-bold">Additional</span>
              <span className="text-sm font-black text-[#E89A27] font-mono">+2.2 km</span>
            </div>

            <button
              onClick={handleReplan}
              disabled={replanning}
              className="px-5 py-3 bg-[#E89A27] hover:bg-[#D97706] text-white font-extrabold text-xs rounded-xl transition flex items-center gap-2 shadow-md shadow-[#E89A27]/20 disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${replanning ? 'animate-spin' : ''}`} />
              <span>{replanState.isReplanned ? 'Route Updated with AHM-156' : 'Replan Route'}</span>
            </button>
          </div>
        </div>

        {replanState.isReplanned && (
          <div className="pt-3 border-t border-[#E3EAE6] flex items-center justify-between text-xs text-[#0B5D3B] font-bold bg-[#DCFCE7] p-3 rounded-xl border border-[#BBF7D0]">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
              Replanning Successful: Bin AHM-156 inserted at Stop #2. Overflow Risk Reduced to 0%.
            </span>
            <span className="text-[#0B5D3B] font-mono text-[11px]">Computed via Hungarian Insertion Algorithm</span>
          </div>
        )}
      </div>

      {/* Main Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Fleet Selection & Capacity Breakdown */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Fleet Selector */}
          <div className="bg-white border border-[#E3EAE6] rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-[#17201B] flex items-center justify-between">
              <span>Municipal Fleet Roster</span>
              <span className="text-xs text-[#16845B] font-mono font-bold">{vehicles.length} Trucks Active</span>
            </h3>

            <div className="space-y-3">
              {vehicles.map(v => {
                const util = (( (v.current_load_kg || v.current_load) / v.capacity_kg) * 100).toFixed(0);
                const isSelected = v.id === selectedVehicleId;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-[#F0FDF4] border-[#16845B] ring-2 ring-[#16845B]/20 shadow-sm'
                        : 'bg-[#F7FAF8] border-[#E3EAE6] hover:border-[#CBD8D2]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className={`w-4 h-4 ${isSelected ? 'text-[#16845B]' : 'text-[#66736C]'}`} />
                        <span className="font-bold text-[#17201B] text-xs">{v.vehicle_code}</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#17201B] font-mono">
                        {v.current_load_kg || v.current_load} / {v.capacity_kg} kg ({util}%)
                      </span>
                    </div>

                    <div className="w-full bg-[#E3EAE6] rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          util > 85 ? 'bg-[#D64545]' : util > 60 ? 'bg-[#E89A27]' : 'bg-[#16845B]'
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
          <div className="bg-white border border-[#E3EAE6] rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-[#17201B] flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[#16845B]" />
              Strict Capacity Constraint
            </h3>
            <p className="text-xs text-[#66736C] leading-relaxed">
              The optimizer strictly enforces that total collected weight across all sequence waypoints never exceeds vehicle rated capacity ({activeVehicle?.capacity_kg || 2000} kg).
            </p>
          </div>
        </div>

        {/* Middle / Right Column: Active Route Waypoint Timeline & Best Vehicle Matcher */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Route Summary Bar */}
          <div className="bg-white border border-[#E3EAE6] rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3EAE6] pb-4">
              <div>
                <span className="text-xs font-mono text-[#16845B] font-bold uppercase tracking-wider block">Assigned Route Plan</span>
                <h2 className="text-lg font-black text-[#17201B]">{activeVehicle?.vehicle_code || 'Truck V-01'}</h2>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#66736C] font-semibold">Filter:</span>
                {['All', 'Critical', 'High'].map(p => (
                  <button
                    key={p}
                    onClick={() => setSelectedPriorityFilter(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      selectedPriorityFilter === p
                        ? 'bg-[#16845B] text-white shadow-sm'
                        : 'bg-[#F1F6F3] text-[#66736C] hover:text-[#17201B]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 text-xs font-bold">
                <div className="bg-[#F7FAF8] px-3 py-1.5 rounded-xl border border-[#E3EAE6]">
                  <span className="text-[#66736C] block text-[10px]">Distance</span>
                  <span className="text-[#17201B] font-mono">{activeRoute.distance_km} km</span>
                </div>
                <div className="bg-[#F7FAF8] px-3 py-1.5 rounded-xl border border-[#E3EAE6]">
                  <span className="text-[#66736C] block text-[10px]">Duration</span>
                  <span className="text-[#17201B] font-mono">{activeRoute.duration_minutes} min</span>
                </div>
                <div className="bg-[#F7FAF8] px-3 py-1.5 rounded-xl border border-[#E3EAE6]">
                  <span className="text-[#66736C] block text-[10px]">Payload</span>
                  <span className="text-[#16845B] font-mono">{activeRoute.collected_weight_kg} kg</span>
                </div>
              </div>
            </div>

            {/* Sequence Waypoints Timeline */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#66736C] uppercase tracking-wider">Optimized Sequence Waypoints</span>
              
              <div className="relative border-l-2 border-[#E3EAE6] ml-4 pl-6 space-y-4">
                {filteredStops.map((stop, idx) => (
                  <div key={idx} className="relative group">
                    {/* Circle marker on line */}
                    <div className={`absolute -left-[31px] top-2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
                      stop.is_depot ? 'bg-[#66736C]' : (stop.is_critical ? 'bg-[#D64545]' : 'bg-[#16845B]')
                    }`} />

                    <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                      stop.is_dynamically_inserted ? 'bg-[#FFFBEB] border-[#FDE68A]' : 'bg-[#F7FAF8] border-[#E3EAE6] hover:bg-white'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-[#66736C] w-6">#{idx}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#17201B]">{stop.bin_code}</span>
                            {stop.is_critical && (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#FEE2E2] text-[#991B1B] rounded-full border border-[#FECACA]">
                                Priority {stop.priority}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#66736C]">
                            {stop.is_depot ? 'Depot Hub Operations' : `Estimated Payload: ${stop.weight_kg} kg`}
                          </span>
                        </div>
                      </div>

                      <div className="text-right text-xs">
                        <span className="text-[#66736C] block text-[10px] uppercase font-bold">Action</span>
                        <span className="font-bold text-[#17201B]">
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
          <div className="bg-white border border-[#E3EAE6] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E3EAE6] pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#17201B] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#16845B]" />
                  Best Vehicle for Critical Bin Selection
                </h3>
                <p className="text-xs text-[#66736C]">Automated matching based on proximity and remaining capacity</p>
              </div>

              <select
                value={selectedBinForMatch}
                onChange={(e) => setSelectedBinForMatch(e.target.value)}
                className="bg-[#F7FAF8] border border-[#E3EAE6] text-xs font-bold text-[#17201B] px-3 py-2 rounded-xl focus:outline-none focus:border-[#16845B]"
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
                  className={`p-4 rounded-2xl border text-xs flex flex-col justify-between ${
                    c.eligible
                      ? 'bg-[#F7FAF8] border-[#E3EAE6]'
                      : 'bg-[#FEF2F2] border-[#FECACA] opacity-75'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[#17201B]">{c.id}</span>
                      {c.eligible ? (
                        <span className="text-[10px] font-bold text-[#0B5D3B] bg-[#DCFCE7] px-2 py-0.5 rounded-full border border-[#BBF7D0]">
                          Score: {c.score}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-[#991B1B] bg-[#FEE2E2] px-2 py-0.5 rounded-full border border-[#FECACA]">
                          Ineligible
                        </span>
                      )}
                    </div>
                    <p className="text-[#66736C] text-[11px] mb-2 font-medium">{c.status}</p>
                    <div className="space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between text-[#66736C]">
                        <span>Proximity:</span>
                        <span className="text-[#17201B] font-bold">{c.distance_km} km</span>
                      </div>
                      <div className="flex justify-between text-[#66736C]">
                        <span>Avail Cap:</span>
                        <span className={c.eligible ? 'text-[#16845B] font-bold' : 'text-[#D64545]'}>{c.avail_kg} kg</span>
                      </div>
                    </div>
                  </div>

                  {!c.eligible && (
                    <p className="text-[10px] text-[#991B1B] mt-2 font-semibold">{c.reason}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl text-xs text-[#17201B] flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16845B] shrink-0" />
                <span>AI Recommendation: Assign <strong>Truck V-01</strong> (Closest proximity with 1,700 kg available margin).</span>
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
