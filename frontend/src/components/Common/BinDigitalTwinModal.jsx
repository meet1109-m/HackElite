import React, { useState, useEffect } from 'react';
import { X, Cpu, Battery, Thermometer, Clock, Weight, MapPin, Truck, AlertTriangle, ArrowRight, Camera, Sparkles, BarChart2, CheckCircle2 } from 'lucide-react';
import OverflowCountdownBadge from './OverflowCountdownBadge';
import ProvenanceBadge from './ProvenanceBadge';
import RecyclingPurityGauge from './RecyclingPurityGauge';
import ExplainableScoreCard from './ExplainableScoreCard';
import { apiService } from '../../services/api';
import { useWasteData } from '../../context/WasteDataContext';

export const BinDigitalTwinModal = (props) => {
  const context = useWasteData?.() || {};
  const bin = props.bin || context.selectedDigitalTwin || context.selectedBin;
  const onClose = props.onClose || context.closeDigitalTwin || (() => {});
  const onNavigateTab = props.onNavigateTab;

  const [readings, setReadings] = useState([]);
  const [bestVehicle, setBestVehicle] = useState(null);
  const [loadingVehicle, setLoadingVehicle] = useState(false);
  const [predictionRun, setPredictionRun] = useState(false);

  useEffect(() => {
    if (bin) {
      apiService.getBinReadings(bin.id).then(r => setReadings(r || []));
      setBestVehicle(null);
      setPredictionRun(false);
    }
  }, [bin]);

  if (!bin) return null;

  const handleFindVehicle = async () => {
    setLoadingVehicle(true);
    const res = await apiService.getBestVehicleForBin(bin.id);
    if (res) {
      setBestVehicle(res);
    }
    setLoadingVehicle(false);
  };

  const handleRunPrediction = () => {
    setPredictionRun(true);
    context.showToast?.(`✓ ML Prediction updated for ${bin.bin_code}: Predicted overflow in ${bin.predicted_overflow_text}.`, 'info');
  };

  const comp = bin.composition || {};
  const pred = bin.prediction || {};

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white/95 backdrop-blur-xl border-l border-[#E3EAE6] shadow-2xl overflow-y-auto flex flex-col animate-fade-in">
      {/* Header */}
      <div className="p-5 border-b border-[#E3EAE6] bg-white sticky top-0 z-10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#DCFCE7] border border-[#BBF7D0] rounded-2xl text-[#0B5D3B]">
            <Cpu className="w-5 h-5 text-[#16845B]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-[#17201B] font-mono">{bin.bin_code}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F1F6F3] text-[#17201B] font-bold border border-[#E3EAE6]">
                {bin.waste_stream}
              </span>
            </div>
            <p className="text-xs text-[#66736C] flex items-center gap-1 mt-0.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#16845B] shrink-0" />
              <span className="truncate max-w-[280px]">{bin.address}</span>
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-[#66736C] hover:text-[#17201B] bg-[#F1F6F3] hover:bg-[#E5ECE8] rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-5 flex-1 text-[#17201B]">
        {/* Overflow Countdown Hero Card */}
        <div className="p-4 rounded-2xl bg-[#F7FAF8] border border-[#E3EAE6] flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-[#66736C] uppercase tracking-wider block mb-1">
              Overflow Prediction Status
            </span>
            <OverflowCountdownBadge hours={bin.predicted_overflow_hours} text={bin.predicted_overflow_text} size="lg" />
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#66736C] uppercase tracking-widest block font-bold">Priority Tier</span>
            <span className="text-sm font-black text-[#17201B]">{bin.priority_explanation?.tier || bin.status}</span>
            <div className="text-xs font-mono font-bold text-[#16845B]">{bin.priority_score}/100</div>
          </div>
        </div>

        {/* Current State Grid */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#66736C] mb-3 flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-[#16845B]" /> Current Telemetry State
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-[#F7FAF8] border border-[#E3EAE6] rounded-2xl">
              <span className="text-[11px] text-[#66736C] block mb-1 font-semibold">Fill Level</span>
              <div className="text-xl font-black font-mono text-[#17201B]">{bin.fill_percentage}%</div>
              <div className="w-full bg-[#E3EAE6] h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${bin.fill_percentage >= 80 ? 'bg-[#D64545]' : (bin.fill_percentage >= 50 ? 'bg-[#E89A27]' : 'bg-[#16845B]')}`}
                  style={{ width: `${bin.fill_percentage}%` }}
                />
              </div>
            </div>

            <div className="p-3 bg-[#F7FAF8] border border-[#E3EAE6] rounded-2xl">
              <span className="text-[11px] text-[#66736C] block mb-1 font-semibold">Weight</span>
              <div className="text-xl font-black font-mono text-[#17201B]">{bin.estimated_weight_kg} <span className="text-xs text-[#66736C] font-normal">kg</span></div>
              <span className="text-[10px] text-[#66736C] block mt-1">Cap: {bin.capacity_kg} kg</span>
            </div>

            <div className="p-3 bg-[#F7FAF8] border border-[#E3EAE6] rounded-2xl">
              <span className="text-[11px] text-[#66736C] block mb-1 font-semibold">Daily Velocity</span>
              <div className="text-xl font-black font-mono text-[#16845B]">{bin.avg_daily_generation_kg} <span className="text-xs text-[#66736C] font-normal">kg/d</span></div>
              <span className="text-[10px] text-[#66736C] block mt-1">AMC Baseline</span>
            </div>

            <div className="p-3 bg-[#F7FAF8] border border-[#E3EAE6] rounded-2xl">
              <span className="text-[11px] text-[#66736C] block mb-1 font-semibold">Last Emptied</span>
              <div className="text-xs font-bold text-[#17201B] leading-tight mt-1 truncate">{bin.last_collection}</div>
              <span className="text-[10px] text-[#66736C] block mt-1">RFID Confirmed</span>
            </div>
          </div>
        </div>

        {/* Prediction Engine Forecast */}
        <div className="p-4 bg-[#F7FAF8] border border-[#E3EAE6] rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#17201B] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#2878C8]" /> ML Fill-Level Forecasting
            </h3>
            <button
              onClick={handleRunPrediction}
              className="px-3 py-1 bg-white hover:bg-[#F1F6F3] text-[#16845B] border border-[#BBF7D0] rounded-lg text-xs font-bold transition shadow-sm"
            >
              {predictionRun ? '✓ Updated' : 'Predict Overflow'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-white rounded-xl border border-[#E3EAE6] shadow-sm">
              <span className="text-[11px] text-[#66736C] block mb-1 font-semibold">6 Hours</span>
              <span className="text-base font-black font-mono text-[#2878C8]">{pred.fill_6h || Math.min(100, bin.fill_percentage + 15)}%</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-[#E3EAE6] shadow-sm">
              <span className="text-[11px] text-[#66736C] block mb-1 font-semibold">12 Hours</span>
              <span className="text-base font-black font-mono text-[#E89A27]">{pred.fill_12h || Math.min(100, bin.fill_percentage + 30)}%</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-[#E3EAE6] shadow-sm">
              <span className="text-[11px] text-[#66736C] block mb-1 font-semibold">24 Hours</span>
              <span className="text-base font-black font-mono text-[#D64545]">{pred.fill_24h || 100}%</span>
            </div>
          </div>
          <p className="text-[11px] text-[#66736C] text-center font-medium">
            Predicted Overflow in <strong className="text-[#D64545] font-mono font-bold">{bin.predicted_overflow_text}</strong> • Confidence: {pred.confidence || 89}%
          </p>
        </div>

        {/* Waste Intelligence & Purity Score */}
        <div className="p-4 bg-[#F7FAF8] border border-[#E3EAE6] rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#17201B] flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[#16845B]" /> Waste Composition Intelligence
            </h3>
            <ProvenanceBadge source={comp.source} confidence={comp.confidence} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <RecyclingPurityGauge
              score={comp.recycling_purity_score || 76}
              stream={bin.waste_stream}
              alert={comp.contamination_alert}
            />

            <div className="space-y-2">
              {[
                { label: "Plastic", val: comp.plastic, color: "bg-[#16845B]" },
                { label: "Organic", val: comp.organic, color: "bg-[#0D9488]" },
                { label: "Paper", val: comp.paper, color: "bg-[#2878C8]" },
                { label: "Metal", val: comp.metal, color: "bg-[#66736C]" },
                { label: "Glass", val: comp.glass, color: "bg-[#0284C7]" },
                { label: "Other", val: comp.other, color: "bg-[#D64545]" }
              ].map(item => (
                <div key={item.label} className="text-xs">
                  <div className="flex justify-between text-[11px] text-[#17201B] mb-0.5 font-medium">
                    <span>{item.label}</span>
                    <span className="font-mono font-bold">{item.val || 0}%</span>
                  </div>
                  <div className="w-full bg-[#E3EAE6] h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.val || 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Explainable AI Score Breakdown */}
        <ExplainableScoreCard explanation={bin.priority_explanation} binCode={bin.bin_code} />

        {/* Best Vehicle Matcher */}
        <div className="p-4 bg-[#F7FAF8] border border-[#E3EAE6] rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#17201B] flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#2878C8]" /> Vehicle Dispatch Recommendation
            </h3>
            {!bestVehicle && (
              <button
                onClick={handleFindVehicle}
                disabled={loadingVehicle}
                className="px-3.5 py-1.5 bg-[#2878C8] hover:bg-[#1E40AF] text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                {loadingVehicle ? 'Calculating...' : 'Find Best Vehicle'}
              </button>
            )}
          </div>

          {bestVehicle ? (
            <div className="space-y-3">
              <div className="p-3.5 bg-white border border-[#BFDBFE] rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#17201B] text-sm">
                    {bestVehicle.best_vehicle?.vehicle_code}
                  </span>
                  <span className="px-2 py-0.5 bg-[#DCFCE7] text-[#0B5D3B] border border-[#BBF7D0] rounded-full text-[10px] font-bold">
                    RECOMMENDED
                  </span>
                </div>
                <div className="text-xs text-[#17201B] mt-1 font-medium">
                  <strong>{bestVehicle.best_vehicle?.distance_km} km</strong> away • Available Capacity: <strong className="text-[#16845B]">{bestVehicle.best_vehicle?.available_capacity_kg} kg</strong>
                </div>
                <p className="text-[11px] text-[#66736C] mt-2 italic">
                  "{bestVehicle.recommendation_summary}"
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#66736C] italic">
              Click 'Find Best Vehicle' to calculate the nearest active truck with sufficient payload margin for {bin.estimated_weight_kg} kg.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BinDigitalTwinModal;
