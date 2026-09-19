import React, { useState } from 'react';
import { useWasteData } from '../context/WasteDataContext';
import { Sliders, Play, RefreshCw, ArrowRight, TrendingUp, AlertTriangle, Truck, Gauge, ShieldCheck, Sparkles } from 'lucide-react';

export default function WhatIfSimulatorPage() {
  const { runSimulation, simulationResult } = useWasteData();
  const [vehiclesCount, setVehiclesCount] = useState(3);
  const [vehicleCapacity, setVehicleCapacity] = useState(2000);
  const [fillThreshold, setFillThreshold] = useState(75);
  const [generationMultiplier, setGenerationMultiplier] = useState(20); // +20%
  const [trafficCondition, setTrafficCondition] = useState('Heavy');
  const [simulating, setSimulating] = useState(false);

  // Baseline standard values
  const baseline = {
    distance_km: 42.1,
    overflow_risk_pct: 5.2,
    fleet_utilization_pct: 71.0,
    uncollected_bins: 2,
    fuel_liters: 14.2
  };

  const handleSimulate = async () => {
    setSimulating(true);
    await runSimulation({
      vehicles_count: vehiclesCount,
      vehicle_capacity_kg: vehicleCapacity,
      collection_threshold_pct: fillThreshold,
      generation_surge_pct: generationMultiplier,
      traffic_factor: trafficCondition
    });
    setSimulating(false);
  };

  // Current scenario result based on state or calculated dynamically
  const result = simulationResult || {
    distance_km: (42.1 * (1 + (generationMultiplier / 100) * 0.4) * (trafficCondition === 'Heavy' ? 1.15 : 1.0)).toFixed(1),
    overflow_risk_pct: Math.min(95, Math.max(2, (5.2 + (generationMultiplier * 0.25) + (3 - vehiclesCount) * 4.5))).toFixed(1),
    fleet_utilization_pct: Math.min(98, Math.max(30, (71.0 + (3 - vehiclesCount) * 12 + generationMultiplier * 0.3))).toFixed(1),
    uncollected_bins: Math.max(0, Math.round(2 + (3 - vehiclesCount) * 3 + generationMultiplier * 0.1)),
    fuel_liters: (14.2 * (1 + (generationMultiplier / 100) * 0.35)).toFixed(1)
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sliders className="w-8 h-8 text-emerald-400" />
              What-If Operational Scenario Simulator
            </h1>
            <span className="px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              Predictive Stress-Testing Engine
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Simulate municipal resource reallocations, fleet constraints, weather/traffic conditions, and sudden generation spikes.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Simulation / Scenario Estimation Mode</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Scenario Controls */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">Scenario Parameters</h3>
            <button
              onClick={() => {
                setVehiclesCount(3);
                setVehicleCapacity(2000);
                setFillThreshold(75);
                setGenerationMultiplier(20);
                setTrafficCondition('Heavy');
              }}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Slider 1: Active Vehicles */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold">Active Collection Vehicles</span>
              <span className="font-mono font-bold text-emerald-400">{vehiclesCount} Trucks</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={vehiclesCount}
              onChange={(e) => setVehiclesCount(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-950 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1 Truck (Severe)</span>
              <span>3 (Default)</span>
              <span>5 (Surge Fleet)</span>
            </div>
          </div>

          {/* Slider 2: Waste Generation Surge */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold">Waste Generation Surge</span>
              <span className={`font-mono font-bold ${generationMultiplier > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                {generationMultiplier > 0 ? `+${generationMultiplier}%` : `${generationMultiplier}%`}
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="60"
              step="5"
              value={generationMultiplier}
              onChange={(e) => setGenerationMultiplier(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-950 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-20% (Low Season)</span>
              <span>0% (Baseline)</span>
              <span>+60% (Festival Peak)</span>
            </div>
          </div>

          {/* Slider 3: Collection Dispatch Threshold */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold">Collection Trigger Fill Threshold</span>
              <span className="font-mono font-bold text-blue-400">{fillThreshold}% Fill</span>
            </div>
            <input
              type="range"
              min="50"
              max="90"
              step="5"
              value={fillThreshold}
              onChange={(e) => setFillThreshold(Number(e.target.value))}
              className="w-full accent-blue-500 bg-slate-950 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>50% (High Frequency)</span>
              <span>75% (Balanced)</span>
              <span>90% (Late Collection)</span>
            </div>
          </div>

          {/* Radio: Traffic Conditions */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">Ahmedabad Traffic Factor</span>
            <div className="grid grid-cols-3 gap-2">
              {['Light', 'Normal', 'Heavy'].map(t => (
                <button
                  key={t}
                  onClick={() => setTrafficCondition(t)}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    trafficCondition === t
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${simulating ? 'animate-spin' : ''}`} />
            {simulating ? 'Simulating Operations...' : 'Compute Simulated Impact'}
          </button>
        </div>

        {/* Right Column: Simulated Impact Differential Cards */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Projected Operational Impact</h3>
                <p className="text-xs text-slate-400">Comparing baseline municipal operations vs simulated scenario</p>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full">
                Delta Analysis
              </span>
            </div>

            {/* Impact Metric Rows */}
            <div className="space-y-4">
              {/* Total Distance */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Fleet Distance</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-mono text-slate-400">{baseline.distance_km} km</span>
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                    <span className="text-lg font-bold text-white font-mono">{result.distance_km} km</span>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg">
                  +{((result.distance_km - baseline.distance_km)).toFixed(1)} km
                </span>
              </div>

              {/* Overflow Risk */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">City-Wide Overflow Risk</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-mono text-slate-400">{baseline.overflow_risk_pct}%</span>
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                    <span className={`text-lg font-bold font-mono ${result.overflow_risk_pct > 10 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {result.overflow_risk_pct}%
                    </span>
                  </div>
                </div>
                <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg border ${
                  result.overflow_risk_pct > 10 ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}>
                  {result.overflow_risk_pct > 10 ? 'High Risk Exposure' : 'Manageable Risk'}
                </span>
              </div>

              {/* Fleet Utilization */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Average Vehicle Payload Utilization</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-mono text-slate-400">{baseline.fleet_utilization_pct}%</span>
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                    <span className="text-lg font-bold text-white font-mono">{result.fleet_utilization_pct}%</span>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg">
                  {result.fleet_utilization_pct >= 85 ? 'High Efficiency' : 'Moderate Load'}
                </span>
              </div>
            </div>

            {/* AI Scenario Insight */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                AI Scenario Synthesis & Operational Verdict
              </span>
              <p className="text-slate-300 leading-relaxed">
                Reducing fleet size from 3 to {vehiclesCount} vehicles under a +{generationMultiplier}% generation surge increases average fleet payload utilization to {result.fleet_utilization_pct}%, but risks {result.uncollected_bins} delayed bin pickups in Sabarmati and Navrangpura.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
