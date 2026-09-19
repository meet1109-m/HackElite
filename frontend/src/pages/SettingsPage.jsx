import React, { useState } from 'react';
import { useWasteData } from '../context/WasteDataContext';
import { 
  Settings, 
  Sliders, 
  Database, 
  Radio, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Server,
  Activity,
  AlertTriangle,
  Flame,
  Zap,
  Cpu,
  Wifi,
  WifiOff,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

export default function SettingsPage() {
  const { 
    priorityWeights, 
    updatePriorityWeights, 
    bins, 
    refreshData, 
    showToast,
    iotStatus,
    simulateFillIncrease,
    simulateOverflowRisk,
    simulateSensorOffline,
    refreshTelemetry
  } = useWasteData();

  // 7 Weight Controls
  const [fillWeight, setFillWeight] = useState(priorityWeights?.fill_weight || 30);
  const [overflowWeight, setOverflowWeight] = useState(priorityWeights?.overflow_weight || 25);
  const [genWeight, setGenWeight] = useState(priorityWeights?.gen_weight || 15);
  const [streamWeight, setStreamWeight] = useState(priorityWeights?.stream_weight || 10);
  const [zoneWeight, setZoneWeight] = useState(priorityWeights?.zone_weight || 10);
  const [freqWeight, setFreqWeight] = useState(priorityWeights?.freq_weight || 5);
  const [delayWeight, setDelayWeight] = useState(priorityWeights?.delay_weight || 5);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [telemetryFrequency, setTelemetryFrequency] = useState(60); // in seconds

  // IoT connection simulation state
  const [amcApiUrl, setAmcApiUrl] = useState('https://smartcity.ahmedabadcity.gov.in/api/v1/iot');
  const [mqttBroker, setMqttBroker] = useState('mqtt://iot-broker.amc.gov.in:1883/bins/telemetry');
  const [dataSourceMode, setDataSourceMode] = useState('simulated'); // 'simulated' | 'live'

  const totalWeight = fillWeight + overflowWeight + genWeight + streamWeight + zoneWeight + freqWeight + delayWeight;

  // Auto-normalize weights to exactly 100%
  const handleAutoNormalize = () => {
    const rawTotal = totalWeight || 1;
    const nFill = Math.round((fillWeight / rawTotal) * 100);
    const nOverflow = Math.round((overflowWeight / rawTotal) * 100);
    const nGen = Math.round((genWeight / rawTotal) * 100);
    const nStream = Math.round((streamWeight / rawTotal) * 100);
    const nZone = Math.round((zoneWeight / rawTotal) * 100);
    const nFreq = Math.round((freqWeight / rawTotal) * 100);
    
    // Remainder to delay
    const subTotal = nFill + nOverflow + nGen + nStream + nZone + nFreq;
    const nDelay = Math.max(0, 100 - subTotal);

    setFillWeight(nFill);
    setOverflowWeight(nOverflow);
    setGenWeight(nGen);
    setStreamWeight(nStream);
    setZoneWeight(nZone);
    setFreqWeight(nFreq);
    setDelayWeight(nDelay);

    showToast('✓ Weights proportionally normalized to 100%.', 'info');
  };

  const handleSaveWeights = () => {
    updatePriorityWeights({
      fill_weight: fillWeight,
      overflow_weight: overflowWeight,
      gen_weight: genWeight,
      stream_weight: streamWeight,
      zone_weight: zoneWeight,
      freq_weight: freqWeight,
      delay_weight: delayWeight
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    setFillWeight(30);
    setOverflowWeight(25);
    setGenWeight(15);
    setStreamWeight(10);
    setZoneWeight(10);
    setFreqWeight(5);
    setDelayWeight(5);

    updatePriorityWeights({
      fill_weight: 30,
      overflow_weight: 25,
      gen_weight: 15,
      stream_weight: 10,
      zone_weight: 10,
      freq_weight: 5,
      delay_weight: 5
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Sample bin comparison preview
  const sampleBins = bins.slice(0, 4);

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#17201B] flex items-center gap-2">
              <Sliders className="w-7 h-7 text-[#16845B]" />
              Priority Weights & IoT Configuration
            </h1>
            <span className="px-3 py-1 text-xs font-bold bg-[#DCFCE7] text-[#0B5D3B] border border-[#BBF7D0] rounded-full">
              Explainable Decision Matrix
            </span>
          </div>
          <p className="text-[#66736C] text-xs sm:text-sm mt-1">
            Configure multi-factor priority weights, monitor municipal IoT sensor status, and simulate telemetry conditions.
          </p>
        </div>

        {/* Prototype Indicator */}
        <div className="px-3.5 py-1.5 bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-xs font-bold rounded-2xl flex items-center gap-2 shadow-sm">
          <Activity className="w-4 h-4 text-[#E89A27] animate-pulse" />
          <span>Prototype / Simulated Operational Telemetry</span>
        </div>
      </div>

      {/* SECTION 1: PRIORITY SCORING WEIGHTS (7 SLIDERS) */}
      <div className="bg-white border border-[#E3EAE6] rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3EAE6] pb-4">
          <div>
            <h2 className="text-base font-extrabold text-[#17201B] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#16845B]" />
              Explainable 7-Factor Priority Weight Matrix
            </h2>
            <p className="text-xs text-[#66736C]">Fine-tune how bin urgency is computed across all 120 Ahmedabad digital twins</p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-full border ${
              totalWeight === 100 ? 'bg-[#DCFCE7] text-[#0B5D3B] border-[#BBF7D0]' : 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]'
            }`}>
              Total: {totalWeight}% {totalWeight === 100 ? '(Balanced 100%)' : `(Delta: ${100 - totalWeight > 0 ? `+${100 - totalWeight}` : 100 - totalWeight}%)`}
            </span>

            {totalWeight !== 100 && (
              <button
                onClick={handleAutoNormalize}
                className="px-3 py-1.5 bg-[#16845B] hover:bg-[#0B5D3B] text-white text-xs font-bold rounded-xl transition shadow-sm"
              >
                Auto-Normalize to 100%
              </button>
            )}
          </div>
        </div>

        {/* 7 Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* 1. Fill Level */}
          <div className="space-y-2 bg-[#F7FAF8] p-4 rounded-2xl border border-[#E3EAE6]">
            <div className="flex justify-between text-xs">
              <span className="text-[#17201B] font-bold">1. Current Fill Level</span>
              <span className="font-mono font-black text-[#16845B]">{fillWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={fillWeight}
              onChange={(e) => setFillWeight(Number(e.target.value))}
              className="w-full accent-[#16845B] bg-[#CBD8D2] rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-[#66736C]">Ultrasonic sensory fill capacity percentage.</p>
          </div>

          {/* 2. Overflow Risk */}
          <div className="space-y-2 bg-[#F7FAF8] p-4 rounded-2xl border border-[#E3EAE6]">
            <div className="flex justify-between text-xs">
              <span className="text-[#17201B] font-bold">2. Overflow Countdown Risk</span>
              <span className="font-mono font-black text-[#D64545]">{overflowWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={overflowWeight}
              onChange={(e) => setOverflowWeight(Number(e.target.value))}
              className="w-full accent-[#D64545] bg-[#CBD8D2] rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-[#66736C]">ML forecasted time-to-full breach window.</p>
          </div>

          {/* 3. Waste Generation Rate */}
          <div className="space-y-2 bg-[#F7FAF8] p-4 rounded-2xl border border-[#E3EAE6]">
            <div className="flex justify-between text-xs">
              <span className="text-[#17201B] font-bold">3. Generation Rate Velocity</span>
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
            <p className="text-[11px] text-[#66736C]">Average kg/hour accumulation gradient.</p>
          </div>

          {/* 4. Waste Type */}
          <div className="space-y-2 bg-[#F7FAF8] p-4 rounded-2xl border border-[#E3EAE6]">
            <div className="flex justify-between text-xs">
              <span className="text-[#17201B] font-bold">4. Waste Type / Recyclability</span>
              <span className="font-mono font-black text-[#2878C8]">{streamWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={streamWeight}
              onChange={(e) => setStreamWeight(Number(e.target.value))}
              className="w-full accent-[#2878C8] bg-[#CBD8D2] rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-[#66736C]">Prioritizes high-value dry plastic & organic compost.</p>
          </div>

          {/* 5. Location Sensitivity */}
          <div className="space-y-2 bg-[#F7FAF8] p-4 rounded-2xl border border-[#E3EAE6]">
            <div className="flex justify-between text-xs">
              <span className="text-[#17201B] font-bold">5. Location Sensitivity</span>
              <span className="font-mono font-black text-[#E89A27]">{zoneWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              value={zoneWeight}
              onChange={(e) => setZoneWeight(Number(e.target.value))}
              className="w-full accent-[#E89A27] bg-[#CBD8D2] rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-[#66736C]">Sabarmati Promenade, commercial, & tourist spots.</p>
          </div>

          {/* 6. Historical Frequency */}
          <div className="space-y-2 bg-[#F7FAF8] p-4 rounded-2xl border border-[#E3EAE6]">
            <div className="flex justify-between text-xs">
              <span className="text-[#17201B] font-bold">6. Historical Frequency</span>
              <span className="font-mono font-black text-[#66736C]">{freqWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={freqWeight}
              onChange={(e) => setFreqWeight(Number(e.target.value))}
              className="w-full accent-[#66736C] bg-[#CBD8D2] rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-[#66736C]">Recurrent surge pattern over 30-day baseline.</p>
          </div>

          {/* 7. Collection Delay */}
          <div className="space-y-2 bg-[#F7FAF8] p-4 rounded-2xl border border-[#E3EAE6] sm:col-span-2 lg:col-span-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#17201B] font-bold">7. Collection Delay Lapsed</span>
              <span className="font-mono font-black text-[#854D0E]">{delayWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={delayWeight}
              onChange={(e) => setDelayWeight(Number(e.target.value))}
              className="w-full accent-[#854D0E] bg-[#CBD8D2] rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-[#66736C]">Hours elapsed since last RFID vehicle emptying.</p>
          </div>

        </div>

        {/* Live Priority Score Preview Across Bins */}
        <div className="bg-[#F7FAF8] p-4 rounded-2xl border border-[#E3EAE6] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#17201B] uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#16845B]" />
              Live Priority Score Shift Preview
            </span>
            <span className="text-[11px] text-[#66736C]">Updated dynamically based on slider values</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {sampleBins.map(b => (
              <div key={b.id} className="p-3 bg-white rounded-xl border border-[#E3EAE6] shadow-sm text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-[#17201B]">{b.bin_code}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${b.priority_score >= 85 ? 'bg-[#FEE2E2] text-[#991B1B]' : 'bg-[#DCFCE7] text-[#0B5D3B]'}`}>
                    {b.status}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-[#66736C]">Priority Score:</span>
                  <span className="font-mono font-black text-base text-[#16845B]">{b.priority_score} / 100</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#E3EAE6]">
          <button
            onClick={handleResetDefaults}
            className="text-xs text-[#66736C] hover:text-[#17201B] font-bold flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Recommended Defaults (30/25/15/10/10/5/5)
          </button>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs text-[#0B5D3B] font-bold flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-[#16845B]" /> Formula Applied to All Bins
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

      {/* SECTION 2: IOT TELEMETRY & SIMULATION CONTROLS */}
      <div className="bg-white border border-[#E3EAE6] rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3EAE6] pb-3">
          <div>
            <h2 className="text-base font-extrabold text-[#17201B] flex items-center gap-2">
              <Server className="w-5 h-5 text-[#2878C8]" />
              IoT Sensor Grid Telemetry & Synthetic Sandbox Controls
            </h2>
            <p className="text-xs text-[#66736C]">Simulate telemetry fluctuations, trigger overflow surges, and inspect sensor health</p>
          </div>

          {/* Telemetry frequency selector */}
          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-4 h-4 text-[#66736C]" />
            <span className="text-[#66736C] font-semibold">Telemetry Interval:</span>
            <select
              value={telemetryFrequency}
              onChange={(e) => setTelemetryFrequency(Number(e.target.value))}
              className="bg-[#F7FAF8] border border-[#E3EAE6] text-xs font-bold text-[#17201B] px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-[#16845B]"
            >
              <option value={10}>10s (Fast Demo)</option>
              <option value={60}>1m (Standard)</option>
              <option value={300}>5m (Conserve)</option>
              <option value={900}>15m (Low Power)</option>
            </select>
          </div>
        </div>

        {/* IoT Node Status Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-[#F7FAF8] rounded-2xl border border-[#E3EAE6]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#66736C] font-semibold">Active Nodes</span>
              <span className="w-2 h-2 rounded-full bg-[#16845B] animate-pulse"></span>
            </div>
            <div className="text-2xl font-black font-mono text-[#17201B]">{iotStatus?.activeNodes || 116}</div>
            <span className="text-[10px] text-[#16845B] font-bold">ONLINE (96.7%)</span>
          </div>

          <div className="p-4 bg-[#F7FAF8] rounded-2xl border border-[#E3EAE6]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#66736C] font-semibold">Offline Nodes</span>
              <WifiOff className="w-3.5 h-3.5 text-[#D64545]" />
            </div>
            <div className="text-2xl font-black font-mono text-[#D64545]">{iotStatus?.offlineNodes || 4}</div>
            <span className="text-[10px] text-[#991B1B] font-bold">Require Inspection</span>
          </div>

          <div className="p-4 bg-[#F7FAF8] rounded-2xl border border-[#E3EAE6]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#66736C] font-semibold">Fill Sensor Health</span>
              <Cpu className="w-3.5 h-3.5 text-[#16845B]" />
            </div>
            <div className="text-2xl font-black font-mono text-[#16845B]">{iotStatus?.fillSensorHealthPct || 98.4}%</div>
            <span className="text-[10px] text-[#0B5D3B] font-bold">Ultrasonic & Optical</span>
          </div>

          <div className="p-4 bg-[#F7FAF8] rounded-2xl border border-[#E3EAE6]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#66736C] font-semibold">Camera Health</span>
              <Activity className="w-3.5 h-3.5 text-[#2878C8]" />
            </div>
            <div className="text-2xl font-black font-mono text-[#2878C8]">{iotStatus?.cameraHealthPct || 88.2}%</div>
            <span className="text-[10px] text-[#1E40AF] font-bold">Waste Vision Active</span>
          </div>
        </div>

        {/* Prototype Simulated Telemetry Controls */}
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0B5D3B] uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#16845B]" />
              Simulate Live Operational Telemetry Injections
            </span>
            <span className="text-[11px] font-mono text-[#0B5D3B] font-semibold">Prototype Sandbox Mode</span>
          </div>
          <p className="text-xs text-[#17201B]">
            Trigger simulated physical events to inspect how SmartBinX algorithms reactively re-prioritize bins and adapt truck collection routes:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <button
              onClick={simulateFillIncrease}
              className="px-4 py-3 bg-white hover:bg-[#DCFCE7] border border-[#BBF7D0] text-[#065F46] font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4 text-[#16845B]" />
              <span>Simulate Fill Increase</span>
            </button>

            <button
              onClick={simulateOverflowRisk}
              className="px-4 py-3 bg-white hover:bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-2"
            >
              <Flame className="w-4 h-4 text-[#D64545]" />
              <span>Simulate Overflow Risk</span>
            </button>

            <button
              onClick={simulateSensorOffline}
              className="px-4 py-3 bg-white hover:bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-2"
            >
              <WifiOff className="w-4 h-4 text-[#E89A27]" />
              <span>Simulate Sensor Offline</span>
            </button>

            <button
              onClick={refreshTelemetry}
              className="px-4 py-3 bg-[#16845B] hover:bg-[#0B5D3B] text-white font-bold text-xs rounded-xl transition shadow-md shadow-[#16845B]/20 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Baseline Telemetry</span>
            </button>
          </div>
        </div>

        {/* REST API & MQTT Broker Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5 text-xs">
            <label className="text-[#66736C] font-semibold">AMC Municipal REST API Endpoint</label>
            <input
              type="text"
              value={amcApiUrl}
              onChange={(e) => setAmcApiUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F7FAF8] border border-[#E3EAE6] rounded-xl text-[#17201B] font-mono text-xs focus:outline-none focus:border-[#16845B]"
            />
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="text-[#66736C] font-semibold">MQTT Sensor Telemetry Broker</label>
            <input
              type="text"
              value={mqttBroker}
              onChange={(e) => setMqttBroker(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F7FAF8] border border-[#E3EAE6] rounded-xl text-[#17201B] font-mono text-xs focus:outline-none focus:border-[#16845B]"
            />
          </div>
        </div>

        <div className="bg-[#F7FAF8] p-4 rounded-2xl border border-[#E3EAE6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#66736C]">
          <span className="flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#16845B]" />
            Environment: Local Synthetic Sandbox (FastAPI + OR-Tools + Scikit-Learn)
          </span>
          <button
            onClick={async () => {
              await refreshData();
              showToast('✓ State purged and auto-seeded with 120 Ahmedabad telemetry nodes.', 'success');
            }}
            className="px-4 py-2 bg-white hover:bg-[#F1F6F3] text-[#17201B] border border-[#E3EAE6] rounded-xl transition text-xs font-bold shadow-sm"
          >
            Purge & Re-seed State
          </button>
        </div>
      </div>
    </div>
  );
}
