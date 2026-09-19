import React, { useState } from 'react';
import { useWasteData } from '../context/WasteDataContext';
import { Sliders, Play, RefreshCw, ArrowRight, TrendingUp, AlertTriangle, Truck, Gauge, ShieldCheck, Sparkles } from 'lucide-react';

export default function WhatIfSimulatorPage() {
  const { runSimulation, simulationResult, showToast } = useWasteData();
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

  const handleReset = () => {
    setVehiclesCount(3);
    setVehicleCapacity(2000);
    setFillThreshold(75);
    setGenerationMultiplier(0);
    setTrafficCondition('Normal');
    showToast('✓ Simulator parameters reset to baseline operations.', 'info');
  };

  // Dynamic calculated estimated metrics
  const trafficMult = trafficCondition === 'Heavy' ? 1.15 : (trafficCondition === 'Light' ? 0.92 : 1.0);
  const result = simulationResult || {
    distance_km: (42.1 * (1 + (generationMultiplier / 100) * 0.4) * trafficMult).toFixed(1),
    overflow_risk_pct: Math.min(95, Math.max(2, (5.2 + (generationMultiplier * 0.25) + (3 - vehiclesCount) * 4.5))).toFixed(1),
    fleet_utilization_pct: Math.min(98, Math.max(30, (71.0 + (3 - vehiclesCount) * 12 + generationMultiplier * 0.3))).toFixed(1),
    uncollected_bins: Math.max(0, Math.round(2 + (3 - vehiclesCount) * 3 + generationMultiplier * 0.1)),
    fuel_liters: (14.2 * (1 + (generationMultiplier / 100) * 0.35) * trafficMult).toFixed(1)
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto bg-pattern-simulator min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#17201B] flex items-center gap-2">
              <Sliders className="w-7 h-7 text-[#16845B]" />
              What-If Operational Scenario Simulator
            </h1>
            <span className="px-3 py-1 text-xs font-bold bg-[#DCFCE7] text-[#0B5D3B] border border-[#BBF7D0] rounded-full">
              Predictive Stress-Testing Engine
            </span>
          </div>
          <p className="text-[#66736C] text-xs sm:text-sm mt-1">
            Simulate municipal fleet reallocations, generation surges, traffic congestion, and collection trigger thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#FFFBEB] px-3.5 py-1.5 rounded-2xl border border-[#FDE68A] text-xs text-[#92400E] font-bold">
          <ShieldCheck className="w-4 h-4 text-[#E89A27]" />
          <span>Simulation / Scenario Estimation</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Scenario Controls */}
        <div className="lg:col-span-5 bg-white border border-[#E3EAE6] rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#E3EAE6] pb-3">
            <h3 className="text-base font-extrabold text-[#17201B]">Scenario Parameters</h3>
            <button
              onClick={handleReset}
              className="text-xs text-[#66736C] hover:text-[#17201B] font-bold flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3 h-3" /> Reset Defaults
            </button>
          </div>

          {/* Slider 1: Active Vehicles */}
          <div className="space-y-2 bg-[#F7FAF8] p-4 rounded-2xl border border-[#E3EAE6]">
            <div className="flex justify-between text-xs">
              <span className="text-[#17201B] font-bold">1. Active Collection Vehicles</span>
              <span className="font-mono font-black text-[#16845B]">{vehiclesCount} Trucks</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={vehiclesCount}
              onChange={(e) => setVehiclesCount(Number(e.target.value))}
              className="w-full accent-[#16845B] bg-[#CBD8D2] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#66736C] font-mono">
              <span>1 Truck (Severe)</span>
              <span>3 (Baseline)</span>
              <span>5 (Surge Fleet)</span>
            </div>
          </div>

          {/* Slider 2: Waste Generation Surge */}
          <div className="space-y-2 bg-[#F7FAF8] p-4 rounded-2xl border border-[#E3EAE6]">
            <div className="flex justify-between text-xs">
              <span className="text-[#17201B] font-bold">2. Waste Generation Surge</span>
              <span className={`font-mono font-black ${generationMultiplier > 0 ? 'text-[#E89A27]' : 'text-[#17201B]'}`}>
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
              className="w-full accent-[#E89A27] bg-[#CBD8D2] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#66736C] font-mono">
              <span>-20% (Low Season)</span>
              <span>0% (Baseline)</span>
              <span>+60% (Festival Peak)</span>
            </div>
          </div>

          {/* Slider 3: Collection Dispatch Threshold */}
          <div className="space-y-2 bg-[#F7FAF8] p-4 rounded-2xl border border-[#E3EAE6]">
            <div className="flex justify-between text-xs">
              <span className="text-[#17201B] font-bold">3. Collection Trigger Fill Threshold</span>
              <span className="font-mono font-black text-[#2878C8]">{fillThreshold}% Fill</span>
            </div>
            <input
              type="range"
              min="50"
              max="90"
              step="5"
              value={fillThreshold}
              onChange={(e) => setFillThreshold(Number(e.target.value))}
              className="w-full accent-[#2878C8] bg-[#CBD8D2] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#66736C] font-mono">
              <span>50% (High Frequency)</span>
              <span>75% (Balanced)</span>
              <span>90% (Late Collection)</span>
            </div>
          </div>

          {/* Radio: Traffic Conditions */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#17201B] block">Ahmedabad Traffic Factor</span>
            <div className="grid grid-cols-3 gap-2">
              {['Light', 'Normal', 'Heavy'].map(t => (
                <button
                  key={t}
                  onClick={() => setTrafficCondition(t)}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    trafficCondition === t
                      ? 'bg-[#16845B] text-white border-[#16845B] shadow-sm'
                      : 'bg-[#F7FAF8] border-[#E3EAE6] text-[#66736C] hover:text-[#17201B]'
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
            className="w-full py-4 bg-[#16845B] hover:bg-[#0B5D3B] text-white font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-[#16845B]/20 disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${simulating ? 'animate-spin' : ''}`} />
            {simulating ? 'Computing Simulation...' : 'Compute Simulated Impact'}
          </button>
        </div>

        {/* Right Column: Simulated Impact Differential Cards */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-[#E3EAE6] rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#E3EAE6] pb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#17201B]">Projected Operational Impact</h3>
                <p className="text-xs text-[#66736C]">Baseline municipal operations vs scenario forecast</p>
              </div>
              <span className="text-xs font-mono font-bold bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] px-3 py-1 rounded-full">
                Delta Analysis
              </span>
            </div>

            {/* Impact Metric Rows */}
            <div className="space-y-4">
              {/* Total Distance */}
              <div className="bg-[#F7FAF8] p-4 rounded-2xl border border-[#E3EAE6] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#66736C] uppercase tracking-wider block">Total Fleet Distance</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-mono text-[#66736C]">{baseline.distance_km} km</span>
                    <ArrowRight className="w-4 h-4 text-[#CBD8D2]" />
                    <span className="text-lg font-black text-[#17201B] font-mono">{result.distance_km} km</span>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono px-3 py-1 bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] rounded-xl">
                  +{((result.distance_km - baseline.distance_km)).toFixed(1)} km
                </span>
              </div>

              {/* Overflow Risk */}
              <div className="bg-[#F7FAF8] p-4 rounded-2xl border border-[#E3EAE6] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#66736C] uppercase tracking-wider block">City-Wide Overflow Risk</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-mono text-[#66736C]">{baseline.overflow_risk_pct}%</span>
                    <ArrowRight className="w-4 h-4 text-[#CBD8D2]" />
                    <span className={`text-lg font-black font-mono ${result.overflow_risk_pct > 10 ? 'text-[#D64545]' : 'text-[#16845B]'}`}>
                      {result.overflow_risk_pct}%
                    </span>
                  </div>
                </div>
                <span className={`text-xs font-bold font-mono px-3 py-1 rounded-xl border ${
                  result.overflow_risk_pct > 10 ? 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]' : 'bg-[#DCFCE7] text-[#0B5D3B] border-[#BBF7D0]'
                }`}>
                  {result.overflow_risk_pct > 10 ? 'High Risk Exposure' : 'Manageable Risk'}
                </span>
              </div>

              {/* Fleet Utilization */}
              <div className="bg-[#F7FAF8] p-4 rounded-2xl border border-[#E3EAE6] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#66736C] uppercase tracking-wider block">Average Vehicle Utilization</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-mono text-[#66736C]">{baseline.fleet_utilization_pct}%</span>
                    <ArrowRight className="w-4 h-4 text-[#CBD8D2]" />
                    <span className="text-lg font-black text-[#17201B] font-mono">{result.fleet_utilization_pct}%</span>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono px-3 py-1 bg-[#DCFCE7] text-[#0B5D3B] border border-[#BBF7D0] rounded-xl">
                  {result.fleet_utilization_pct >= 85 ? 'High Efficiency' : 'Moderate Load'}
                </span>
              </div>
            </div>

            {/* AI Scenario Insight */}
            <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl space-y-1.5 text-xs">
              <span className="font-extrabold text-[#0B5D3B] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#16845B]" />
                AI Scenario Synthesis & Operational Verdict
              </span>
              <p className="text-[#17201B] leading-relaxed">
                Operating with {vehiclesCount} trucks under a {generationMultiplier > 0 ? `+${generationMultiplier}%` : `${generationMultiplier}%`} generation surge and {trafficCondition} traffic produces an estimated total distance of <strong>{result.distance_km} km</strong> with <strong>{result.fleet_utilization_pct}%</strong> payload utilization.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
