import React, { useState } from 'react';
import { useWasteData } from '../context/WasteDataContext';
import { Settings, Sliders, Database, Radio, RefreshCw, CheckCircle2, ShieldCheck, Server } from 'lucide-react';

export default function SettingsPage() {
  const { priorityWeights, updatePriorityWeights, refreshData, showToast } = useWasteData();
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

  const handlePurge = async () => {
    await refreshData();
    showToast('✓ State purged and auto-seeded with 120 Ahmedabad telemetry nodes.', 'success');
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#17201B] flex items-center gap-2">
              <Settings className="w-7 h-7 text-[#16845B]" />
              System Settings & AI Parameters
            </h1>
            <span className="px-3 py-1 text-xs font-bold bg-[#DCFCE7] text-[#0B5D3B] border border-[#BBF7D0] rounded-full">
              Configurable Heuristics & IoT Adapters
            </span>
          </div>
          <p className="text-[#66736C] text-xs sm:text-sm mt-1">
            Fine-tune multi-factor priority weights, configure municipal AMC telemetry bridges, and manage synthetic models.
          </p>
        </div>
      </div>

      {/* SECTION 1: PRIORITY SCORING WEIGHTS */}
      <div className="bg-white border border-[#E3EAE6] rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E3EAE6] pb-4">
          <div>
            <h2 className="text-base font-extrabold text-[#17201B] flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#16845B]" />
              Explainable Priority Scoring Formula Configuration
            </h2>
            <p className="text-xs text-[#66736C]">Customize how bin urgency is computed across all 120 digital twins</p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
              totalWeight === 100 ? 'bg-[#DCFCE7] text-[#0B5D3B] border-[#BBF7D0]' : 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]'
            }`}>
              Total: {totalWeight}% {totalWeight === 100 ? '(Balanced)' : '(Must equal 100%)'}
            </span>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fill weight */}
          <div className="space-y-2 bg-[#F7FAF8] p-4 rounded-2xl border border-[#E3EAE6]">
            <div className="flex justify-between text-xs">
              <span className="text-[#17201B] font-bold">1. Current Fill Level Percentage</span>
              <span className="font-mono font-black text-[#16845B]">{fillWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={fillWeight}
              onChange={(e) => setFillWeight(Number(e.target.value))}
              className="w-full accent-[#16845B] bg-[#CBD8D2] rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-[#66736C]">Sensory fill height measured by ultrasonic/optical sensor.</p>
          </div>

          {/* Overflow risk weight */}
          <div className="space-y-2 bg-[#F7FAF8] p-4 rounded-2xl border border-[#E3EAE6]">
            <div className="flex justify-between text-xs">
              <span className="text-[#17201B] font-bold">2. Predicted Overflow Countdown Time</span>
              <span className="font-mono font-black text-[#D64545]">{overflowWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={overflowWeight}
              onChange={(e) => setOverflowWeight(Number(e.target.value))}
              className="w-full accent-[#D64545] bg-[#CBD8D2] rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-[#66736C]">ML forecasted time-to-full threshold based on recent velocity.</p>
          </div>

          {/* Waste stream recyclability */}
          <div className="space-y-2 bg-[#F7FAF8] p-4 rounded-2xl border border-[#E3EAE6]">
            <div className="flex justify-between text-xs">
              <span className="text-[#17201B] font-bold">3. Waste Stream & Recyclable Value</span>
              <span className="font-mono font-black text-[#2878C8]">{streamWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={streamWeight}
              onChange={(e) => setStreamWeight(Number(e.target.value))}
              className="w-full accent-[#2878C8] bg-[#CBD8D2] rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-[#66736C]">Prioritizes high-grade recyclables and odor-prone organic streams.</p>
          </div>

          {/* Zone sensitivity */}
          <div className="space-y-2 bg-[#F7FAF8] p-4 rounded-2xl border border-[#E3EAE6]">
            <div className="flex justify-between text-xs">
              <span className="text-[#17201B] font-bold">4. Location & Footfall Sensitivity</span>
              <span className="font-mono font-black text-[#E89A27]">{zoneWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={zoneWeight}
              onChange={(e) => setZoneWeight(Number(e.target.value))}
              className="w-full accent-[#E89A27] bg-[#CBD8D2] rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-[#66736C]">Promenade, heritage, transit, and market sensitivity factor.</p>
          </div>

          {/* Generation rate */}
          <div className="space-y-2 bg-[#F7FAF8] p-4 rounded-2xl border border-[#E3EAE6] md:col-span-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#17201B] font-bold">5. Historical Generation Velocity</span>
              <span className="font-mono font-black text-[#0D9488]">{genWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={genWeight}
              onChange={(e) => setGenWeight(Number(e.target.value))}
              className="w-full accent-[#0D9488] bg-[#CBD8D2] rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-[#66736C]">Average kg/day generation gradient across 30-day baseline.</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#E3EAE6]">
          <button
            onClick={handleResetDefaults}
            className="text-xs text-[#66736C] hover:text-[#17201B] font-bold flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset to Recommended Defaults (35/30/15/10/10)
          </button>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs text-[#0B5D3B] font-bold flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-[#16845B]" /> Weights Applied Successfully
              </span>
            )}
            <button
              onClick={handleSaveWeights}
              disabled={totalWeight !== 100}
              className="px-6 py-3 bg-[#16845B] hover:bg-[#0B5D3B] text-white font-bold text-xs rounded-xl transition shadow-md shadow-[#16845B]/20 disabled:opacity-40"
            >
              Apply Scoring Formula
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: MUNICIPAL AMC IOT & REST BRIDGES */}
      <div className="bg-white border border-[#E3EAE6] rounded-3xl p-6 shadow-sm space-y-5">
        <div className="border-b border-[#E3EAE6] pb-3">
          <h2 className="text-base font-extrabold text-[#17201B] flex items-center gap-2">
            <Server className="w-5 h-5 text-[#2878C8]" />
            Ahmedabad Municipal Corporation (AMC) IoT Gateway
          </h2>
          <p className="text-xs text-[#66736C]">Connect to municipal smart city sensor feeds or run in isolated sandbox mode</p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-xs font-bold text-[#17201B] cursor-pointer">
              <input
                type="radio"
                name="dataMode"
                value="simulated"
                checked={dataSourceMode === 'simulated'}
                onChange={() => setDataSourceMode('simulated')}
                className="accent-[#16845B]"
              />
              Simulated Synthetic Sandbox (Default)
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-[#66736C] cursor-pointer">
              <input
                type="radio"
                name="dataMode"
                value="live"
                checked={dataSourceMode === 'live'}
                onChange={() => setDataSourceMode('live')}
                className="accent-[#16845B]"
              />
              Live AMC Open Data / IoT Bridge (Staging)
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 text-xs">
              <label className="text-[#66736C] font-semibold">AMC REST API Endpoint</label>
              <input
                type="text"
                value={amcApiUrl}
                onChange={(e) => setAmcApiUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F7FAF8] border border-[#E3EAE6] rounded-xl text-[#17201B] font-mono text-xs focus:outline-none focus:border-[#16845B]"
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-[#66736C] font-semibold">MQTT Telemetry Topic</label>
              <input
                type="text"
                value={mqttBroker}
                onChange={(e) => setMqttBroker(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F7FAF8] border border-[#E3EAE6] rounded-xl text-[#17201B] font-mono text-xs focus:outline-none focus:border-[#16845B]"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#F7FAF8] p-4 rounded-2xl border border-[#E3EAE6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#66736C]">
          <span className="flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#16845B]" />
            Environment: Local Synthetic Sandbox (FastAPI + OR-Tools + Scikit-Learn)
          </span>
          <button
            onClick={handlePurge}
            className="px-4 py-2 bg-white hover:bg-[#F1F6F3] text-[#17201B] border border-[#E3EAE6] rounded-xl transition text-xs font-bold shadow-sm"
          >
            Purge & Re-seed State
          </button>
        </div>
      </div>
    </div>
  );
}
