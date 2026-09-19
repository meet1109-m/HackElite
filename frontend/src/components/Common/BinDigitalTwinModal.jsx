import React, { useState, useEffect } from 'react';
import { X, Cpu, Battery, Thermometer, Clock, Weight, MapPin, Truck, AlertTriangle, ArrowRight, Camera, Sparkles, BarChart2 } from 'lucide-react';
import { OverflowCountdownBadge } from './OverflowCountdownBadge';
import { ProvenanceBadge } from './ProvenanceBadge';
import { RecyclingPurityGauge } from './RecyclingPurityGauge';
import { ExplainableScoreCard } from './ExplainableScoreCard';
import { apiService } from '../../services/api';

import { useWasteData } from '../../context/WasteDataContext';

export const BinDigitalTwinModal = (props) => {
  const context = useWasteData?.() || {};
  const bin = props.bin || context.selectedDigitalTwin;
  const onClose = props.onClose || context.closeDigitalTwin || (() => {});
  const onNavigateTab = props.onNavigateTab;

  const [readings, setReadings] = useState([]);
  const [bestVehicle, setBestVehicle] = useState(null);
  const [loadingVehicle, setLoadingVehicle] = useState(false);

  useEffect(() => {
    if (bin) {
      apiService.getBinReadings(bin.id).then(r => setReadings(r || []));
      setBestVehicle(null);
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

  const comp = bin.composition || {};
  const pred = bin.prediction || {};

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/70 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950/80 border border-emerald-600/50 rounded-xl text-emerald-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white font-mono">{bin.bin_code}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                {bin.waste_stream}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate max-w-[280px]">{bin.address}</span>
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5 space-y-5 flex-1">
        {/* Overflow Countdown Hero Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between shadow-inner">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Overflow Prediction Status
            </span>
            <OverflowCountdownBadge hours={bin.predicted_overflow_hours} text={bin.predicted_overflow_text} size="lg" />
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Priority Tier</span>
            <span className="text-sm font-extrabold text-white">{bin.priority_explanation?.tier || bin.status}</span>
            <div className="text-xs font-mono font-bold text-emerald-400">{bin.priority_score}/100</div>
          </div>
        </div>

        {/* Current State Grid */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-emerald-400" /> Current Telemetry State
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-1">Fill Level</span>
              <div className="text-xl font-bold font-mono text-white">{bin.fill_percentage}%</div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${bin.fill_percentage >= 80 ? 'bg-rose-500' : (bin.fill_percentage >= 50 ? 'bg-amber-500' : 'bg-emerald-500')}`}
                  style={{ width: `${bin.fill_percentage}%` }}
                />
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-1">Estimated Weight</span>
              <div className="text-xl font-bold font-mono text-white">{bin.estimated_weight_kg} <span className="text-xs text-slate-400">kg</span></div>
              <span className="text-[10px] text-slate-500 block mt-1">Cap: {bin.capacity_kg} kg</span>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-1">Avg Daily Velocity</span>
              <div className="text-xl font-bold font-mono text-emerald-400">{bin.avg_daily_generation_kg} <span className="text-xs text-slate-400">kg/d</span></div>
              <span className="text-[10px] text-slate-500 block mt-1">AMC Baseline</span>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-1">Last Emptied</span>
              <div className="text-xs font-semibold text-slate-200 leading-tight mt-1">{bin.last_collection}</div>
              <span className="text-[10px] text-slate-500 block mt-1">RFID Confirmed</span>
            </div>
          </div>
        </div>

        {/* Prediction Engine Forecast (Module 3 & 4) */}
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> ML Fill-Level Forecasting
            </h3>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              Conf: {pred.confidence || 89}%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">In 6 Hours</span>
              <span className="text-base font-extrabold font-mono text-sky-300">{pred.fill_6h || Math.min(100, bin.fill_percentage + 15)}%</span>
            </div>
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">In 12 Hours</span>
              <span className="text-base font-extrabold font-mono text-amber-300">{pred.fill_12h || Math.min(100, bin.fill_percentage + 30)}%</span>
            </div>
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">In 24 Hours</span>
              <span className="text-base font-extrabold font-mono text-rose-300">{pred.fill_24h || 100}%</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 text-center">
            Predicted Overflow in <strong className="text-rose-400 font-mono">{bin.predicted_overflow_text}</strong> • Model: {pred.model_type || "Prototype ML Ensemble"}
          </p>
        </div>

        {/* Waste Intelligence & Purity Score (Modules 5, 6, 7) */}
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-400" /> Waste Composition Intelligence
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
                { label: "Plastic", val: comp.plastic, color: "bg-emerald-500" },
                { label: "Organic", val: comp.organic, color: "bg-lime-500" },
                { label: "Paper", val: comp.paper, color: "bg-amber-500" },
                { label: "Metal", val: comp.metal, color: "bg-sky-500" },
                { label: "Glass", val: comp.glass, color: "bg-indigo-500" },
                { label: "Other", val: comp.other, color: "bg-slate-500" }
              ].map(item => (
                <div key={item.label} className="text-xs">
                  <div className="flex justify-between text-[11px] text-slate-300 mb-0.5">
                    <span>{item.label}</span>
                    <span className="font-mono font-semibold">{item.val || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.val || 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Explainable AI Score Breakdown (Module 9) */}
        <ExplainableScoreCard explanation={bin.priority_explanation} binCode={bin.bin_code} />

        {/* Best Vehicle Matcher (Module 14 & 20) */}
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-sky-400" /> Vehicle Dispatch Recommendation
            </h3>
            {!bestVehicle && (
              <button
                onClick={handleFindVehicle}
                disabled={loadingVehicle}
                className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                {loadingVehicle ? 'Calculating...' : 'Find Best Vehicle'}
              </button>
            )}
          </div>

          {bestVehicle ? (
            <div className="space-y-3">
              <div className="p-3 bg-sky-950/40 border border-sky-800/60 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-white text-sm">
                    {bestVehicle.best_vehicle?.vehicle_code} — {bestVehicle.best_vehicle?.driver_name}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700 rounded text-[11px] font-bold">
                    RECOMMENDED
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  <strong>{bestVehicle.best_vehicle?.distance_km} km</strong> away • Available Capacity: <strong>{bestVehicle.best_vehicle?.available_capacity_kg} kg</strong>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 italic">
                  "{bestVehicle.recommendation_summary}"
                </p>
              </div>

              {onNavigateTab && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateTab('routes');
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Dispatch in Route Optimizer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Click 'Find Best Vehicle' to calculate nearest active truck with sufficient capacity for {bin.estimated_weight_kg} kg.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BinDigitalTwinModal;
