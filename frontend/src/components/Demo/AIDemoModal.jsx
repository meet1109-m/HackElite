import React, { useState, useEffect } from 'react';
import { useWasteData } from '../../context/WasteDataContext';
import { Sparkles, X, Play, Pause, ChevronRight, ChevronLeft, CheckCircle2, AlertTriangle, Truck, MapPin, Recycle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const DEMO_STEPS = [
  {
    step: 1,
    title: 'IoT Telemetry Influx & Fill Spike',
    tag: 'Telemetry Trigger',
    icon: '📡',
    description: 'Sensory telemetry from Bin AHM-104 (Sabarmati Riverfront Walkway) indicates rapid waste accumulation, reaching 82% volumetric fill capacity (31.4 kg payload).',
    detailBadge: 'Bin AHM-104 • 82% Full • 31.4 kg',
    highlight: 'Fill level cross-referenced with recent weekend velocity pattern.'
  },
  {
    step: 2,
    title: 'AI Fill-Level & Overflow Forecasting',
    tag: 'ML Prediction',
    icon: '⏳',
    description: 'Gradient boosted time-series regression models the generation curve and issues an urgent overflow forecast: Bin AHM-104 is predicted to overflow in 3 hours 42 minutes.',
    detailBadge: '🚨 OVERFLOW RISK: 03h 42m remaining',
    highlight: '6h Fill: 91% | 12h Fill: 100% (Critical breach threshold)'
  },
  {
    step: 3,
    title: 'Explainable Priority Scoring Calculation',
    tag: 'Priority Engine',
    icon: '🎯',
    description: 'Multi-factor priority engine computes an urgency score of 94/100 (CRITICAL) with transparent point attribution: Current Fill (+31), Overflow Velocity (+29), Generation Rate (+15), Organic Decay (+10), Time Lapsed (+9).',
    detailBadge: 'Priority: 94 / 100 • Status: CRITICAL',
    highlight: 'AI Recommendation: Dispatch municipal collection vehicle within 4 hours.'
  },
  {
    step: 4,
    title: 'Automated Dispatch Alert Broadcast',
    tag: 'Alert System',
    icon: '🚨',
    description: 'A priority alert is published to the AMC Central Command Queue and tagged to Zone C supervisor with high visibility countdown indicators.',
    detailBadge: 'Alert #AMC-7829 dispatched to West Zone Console',
    highlight: 'Live notification pushed to supervisory mobile units.'
  },
  {
    step: 5,
    title: 'Computer Vision Waste Classification & Purity Audit',
    tag: 'Waste Vision AI',
    icon: '📷',
    description: 'Inspection image classified: 48% Organic, 28% Plastic, 14% Paper, 4% Metal, 6% Other. Provenance stamped: AI Detected from Image (91% Confidence). Recycling Purity Score: 76/100.',
    detailBadge: 'Recycling Purity: 76/100 • Stream: Organic High Recovery',
    highlight: 'Verified compatible for Direct Municipal Composting.'
  },
  {
    step: 6,
    title: 'Intelligent Vehicle Selection & Margin Matching',
    tag: 'Fleet Matching',
    icon: '🚛',
    description: 'System compares active fleet: Truck V-02 rejected due to insufficient capacity (200kg avail < 280kg required). Truck V-01 selected: 2.4 km proximity and 1,700 kg available margin.',
    detailBadge: 'Assigned: Truck V-01 (Sabarmati Heavy Compactor)',
    highlight: 'Zero risk of vehicle overloading; optimal proximity efficiency.'
  },
  {
    step: 7,
    title: 'Capacitated TSP Route Sequence Generation',
    tag: 'Route Optimization',
    icon: '🗺️',
    description: 'OR-Tools solver calculates optimal collection route: Sabarmati AMC Depot → AHM-104 (Critical) → AHM-118 → AHM-091 → AHM-127 → Depot. Distance: 27.4 km, Payload: 1,740 kg (87% Utilization).',
    detailBadge: '27.4 km • 1h 38m • 87% Vehicle Utilization',
    highlight: 'Multi-bin consolidation eliminates dead-head mileage.'
  },
  {
    step: 8,
    title: 'Dynamic Mid-Route Emergency Event',
    tag: 'Dynamic Surge',
    icon: '⚡',
    description: 'While Truck V-01 is en route, a sudden surge triggers at Bin AHM-156 (Sabarmati Riverfront Promenade) with a 45-minute overflow countdown alert.',
    detailBadge: 'EMERGENCY: Bin AHM-156 overflow in 45m',
    highlight: 'Real-time Hungarian waypoint insertion algorithm triggered.'
  },
  {
    step: 9,
    title: 'Autonomous Mid-Route Dynamic Replanning',
    tag: 'Dynamic Replanner',
    icon: '🔄',
    description: 'Route replanner inserts AHM-156 between Stop #1 and Stop #2. Total distance increases marginally from 31.2 km to 33.4 km (+2.2 km delta) while preventing immediate public overflow.',
    detailBadge: 'Replanned: +2.2 km Deviation • Overflow Averted',
    highlight: 'Turn-by-turn recalculation updated in real-time.'
  },
  {
    step: 10,
    title: 'Closed-Loop Circularity & Environmental Impact',
    tag: 'Closed Loop Intelligence',
    icon: '🌱',
    description: 'Collection completed! Metrics updated: 23.4 km transit avoided, 5.1L diesel saved, 12.4 kg CO2e offset, 64% landfill diversion from Pirana, and predictive models updated with new telemetry velocity.',
    detailBadge: 'Closed Loop Complete: Model Weights Refined for Tomorrow',
    highlight: ' अहमदाबाद स्मार्ट सिटी (Ahmedabad Smart City) Operations Optimized.'
  }
];

export default function AIDemoModal({ isOpen, onClose }) {
  const { triggerDynamicReplan } = useWasteData();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    let timer;
    if (isOpen && isPlaying) {
      timer = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < DEMO_STEPS.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 4500);
    }
    return () => clearInterval(timer);
  }, [isOpen, isPlaying]);

  useEffect(() => {
    if (currentStep === 8) {
      triggerDynamicReplan();
    }
  }, [currentStep, triggerDynamicReplan]);

  if (!isOpen) return null;

  const stepData = DEMO_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-emerald-500/40 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
        
        {/* Top Header */}
        <div className="p-6 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-bold text-lg shadow-lg shadow-emerald-500/30">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">SmartBinX Autonomous AI Demo</h3>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                  Step {currentStep + 1} of 10
                </span>
              </div>
              <p className="text-xs text-slate-400">Ahmedabad End-to-End Decision Intelligence Simulation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-950 h-1.5 flex">
          {DEMO_STEPS.map((s, idx) => (
            <div
              key={idx}
              className={`h-full flex-1 transition-all duration-300 ${
                idx <= currentStep ? 'bg-emerald-400' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Main Content Body */}
        <div className="p-8 space-y-6 flex-1">
          {/* Tag & Icon */}
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono rounded-full flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              {stepData.tag}
            </span>
            <span className="text-3xl">{stepData.icon}</span>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight">
              {stepData.title}
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              {stepData.description}
            </p>
          </div>

          {/* Highlight Badge Box */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400">{stepData.detailBadge}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Live Telemetry Stamped</span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2 pt-1 border-t border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{stepData.highlight}</span>
            </div>
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="p-6 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(prev => !prev)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause Demo' : 'Auto Play'}</span>
            </button>

            <button
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => setCurrentStep(prev => Math.min(DEMO_STEPS.length - 1, prev + 1))}
              disabled={currentStep === DEMO_STEPS.length - 1}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {currentStep === DEMO_STEPS.length - 1 ? (
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-500/20"
              >
                Close & Explore Command Center
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(prev => Math.min(DEMO_STEPS.length - 1, prev + 1))}
                className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
