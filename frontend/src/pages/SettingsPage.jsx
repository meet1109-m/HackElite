import React, { useState } from 'react';
import { useWasteData } from '../context/WasteDataContext';
import { Settings, Sliders, Database, Radio, RefreshCw, CheckCircle2, ShieldCheck, Server } from 'lucide-react';

export default function SettingsPage() {
  const { priorityWeights, updatePriorityWeights, refreshData } = useWasteData();
  const [fillWeight, setFillWeight] = useState(priorityWeights?.fill_weight || 35);
  const [overflowWeight, setOverflowWeight] = useState(priorityWeights?.overflow_weight || 30);
  const [streamWeight, setStreamWeight] = useState(priorityWeights?.stream_weight || 15);
  const [zoneWeight, setZoneWeight] = useState(priorityWeights?.zone_weight || 10);
  const [genWeight, setGenWeight] = useState(priorityWeights?.gen_weight || 10);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // IoT connection simulation state
  const [amcApiUrl, setAmcApiUrl] = useState('https://smartcity.ahmedabadcity.gov.in/api/v1/iot');
  const [mqttBroker, setMqttBroker] = useState('mqtt://iot-broker.amc.gov.in:1883/bins/telemetry');
  const [dataSourceMode, setDataSourceMode] = useState('simulated'); // 'simulated' | 'live'

  const totalWeight = fillWeight + overflowWeight + streamWeight + zoneWeight + genWeight;

  const handleSaveWeights = () => {
    updatePriorityWeights({
      fill_weight: fillWeight,
      overflow_weight: overflowWeight,
      stream_weight: streamWeight,
      zone_weight: zoneWeight,
      gen_weight: genWeight
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    setFillWeight(35);
    setOverflowWeight(30);
    setStreamWeight(15);
    setZoneWeight(10);
    setGenWeight(10);
    updatePriorityWeights({
      fill_weight: 35,
      overflow_weight: 30,
      stream_weight: 15,
      zone_weight: 10,
      gen_weight: 10
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Settings className="w-8 h-8 text-emerald-400" />
              System Settings & AI Parameters
            </h1>
            <span className="px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              Configurable Heuristics & IoT Adapters
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Fine-tune multi-factor priority weights, configure municipal AMC telemetry bridges, and manage synthetic models.
          </p>
        </div>
      </div>

      {/* SECTION 1: PRIORITY SCORING WEIGHTS */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              Explainable Priority Scoring Formula Configuration
            </h2>
            <p className="text-xs text-slate-400">Customize how bin urgency is computed across all 120 digital twins</p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
              totalWeight === 100 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}>
              Total: {totalWeight}% {totalWeight === 100 ? '(Balanced)' : '(Must equal 100%)'}
            </span>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fill weight */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-white font-semibold">1. Current Fill Level Percentage</span>
              <span className="font-mono font-bold text-emerald-400">{fillWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={fillWeight}
              onChange={(e) => setFillWeight(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-900 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">Sensory fill height measured by ultrasonic/optical sensor.</p>
          </div>

          {/* Overflow risk weight */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-white font-semibold">2. Predicted Overflow Countdown Time</span>
              <span className="font-mono font-bold text-red-400">{overflowWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={overflowWeight}
              onChange={(e) => setOverflowWeight(Number(e.target.value))}
              className="w-full accent-red-500 bg-slate-900 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">ML forecasted time-to-full threshold based on recent velocity.</p>
          </div>

          {/* Waste stream recyclability */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-white font-semibold">3. Waste Stream & Recyclable Value</span>
              <span className="font-mono font-bold text-blue-400">{streamWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={streamWeight}
              onChange={(e) => setStreamWeight(Number(e.target.value))}
              className="w-full accent-blue-500 bg-slate-900 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">Prioritizes high-grade recyclables and odor-prone organic streams.</p>
          </div>

          {/* Zone sensitivity */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-white font-semibold">4. Location & Footfall Sensitivity</span>
              <span className="font-mono font-bold text-amber-400">{zoneWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={zoneWeight}
              onChange={(e) => setZoneWeight(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-900 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">Promenade, heritage, transit, and market sensitivity factor.</p>
          </div>

          {/* Generation rate */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800 md:col-span-2">
            <div className="flex justify-between text-xs">
              <span className="text-white font-semibold">5. Historical Generation Velocity</span>
              <span className="font-mono font-bold text-purple-400">{genWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={genWeight}
              onChange={(e) => setGenWeight(Number(e.target.value))}
              className="w-full accent-purple-500 bg-slate-900 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">Average kg/day generation gradient across 30-day baseline.</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800">
          <button
            onClick={handleResetDefaults}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset to Recommended Defaults (35/30/15/10/10)
          </button>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" /> Weights Saved & Scores Recalculated
              </span>
            )}
            <button
              onClick={handleSaveWeights}
              disabled={totalWeight !== 100}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl transition disabled:opacity-40"
            >
              Apply Scoring Formula
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: MUNICIPAL AMC IOT & REST BRIDGES */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-5">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-400" />
            Ahmedabad Municipal Corporation (AMC) IoT Telemetry Gateway
          </h2>
          <p className="text-xs text-slate-400">Connect to municipal smart city sensor feeds or run in isolated prototype mode</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-white cursor-pointer">
              <input
                type="radio"
                name="dataMode"
                value="simulated"
                checked={dataSourceMode === 'simulated'}
                onChange={() => setDataSourceMode('simulated')}
                className="accent-emerald-500"
              />
              Simulated Synthetic Prototype Mode (Default)
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 cursor-pointer">
              <input
                type="radio"
                name="dataMode"
                value="live"
                checked={dataSourceMode === 'live'}
                onChange={() => setDataSourceMode('live')}
                className="accent-emerald-500"
              />
              Live AMC Open Data / IoT Bridge (Staging)
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 text-xs">
              <label className="text-slate-400 font-medium">AMC REST API Endpoint</label>
              <input
                type="text"
                value={amcApiUrl}
                onChange={(e) => setAmcApiUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-400 font-medium">MQTT Telemetry Topic</label>
              <input
                type="text"
                value={mqttBroker}
                onChange={(e) => setMqttBroker(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Environment: Local Synthetic Sandbox (FastAPI + OR-Tools + Scikit-Learn)
          </span>
          <button
            onClick={refreshData}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition text-xs font-semibold"
          >
            Purge & Re-seed State
          </button>
        </div>
      </div>
    </div>
  );
}
