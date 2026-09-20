import React, { useState } from 'react';
import {
  ArrowRight,
  Cpu,
  ShieldCheck,
  TrendingUp,
  Recycle,
  Truck,
  Camera,
  MapPin,
  AlertTriangle,
  Zap,
  Clock,
  CheckCircle2,
  BarChart2,
  Sparkles,
  Layers,
  Activity,
  Globe,
  Compass,
  ChevronRight,
  Play
} from 'lucide-react';
import { useWasteData } from '../context/WasteDataContext';

export const LandingPage = ({ onLaunchApp, onEnterCommandCenter, onNavigate }) => {
  const handleLaunch = onLaunchApp || onEnterCommandCenter || (() => onNavigate?.('command-center'));
  const { startAIDemo, openDigitalTwin, bins } = useWasteData();

  // State for interactive workflow card selection
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);

  // State for scale zoom level
  const [activeScaleIndex, setActiveScaleIndex] = useState(0);

  // State for live AI decision interactive simulation
  const [simulationState, setSimulationState] = useState('idle'); // 'idle' | 'analyzing' | 'decision_made'

  const workflowSteps = [
    {
      step: "01",
      title: "Monitor",
      subtitle: "IoT Sensory Telemetry",
      desc: "Continuous telemetry captures fill percentage, gross payload weight, GPS coordinates, and historical generation velocity across all municipal bin nodes.",
      metric: "120 Active Nodes",
      icon: <Cpu className="w-6 h-6 text-[#16845B]" />
    },
    {
      step: "02",
      title: "Predict",
      subtitle: "ML Overflow Forecasting",
      desc: "Time-series regression models forecast 6h, 12h, and 24h trajectories, computing precise countdown clocks before hazardous street-level overflow occurs.",
      metric: "94% Forecast Accuracy",
      icon: <Clock className="w-6 h-6 text-[#2878C8]" />
    },
    {
      step: "03",
      title: "Classify",
      subtitle: "Computer Vision Waste Audit",
      desc: "Multi-stream vision models inspect bin interior imagery to identify plastic, organic, paper, metal, and glass fractions while computing recycling purity indices.",
      metric: "6 Material Streams",
      icon: <Camera className="w-6 h-6 text-[#0D9488]" />
    },
    {
      step: "04",
      title: "Prioritize",
      subtitle: "Explainable Urgency Scoring",
      desc: "Multi-factor priority engine scores bins from 0 to 100 with full point attribution across fill level, overflow velocity, location sensitivity, and stream decay risk.",
      metric: "Transparent 0-100 Score",
      icon: <Zap className="w-6 h-6 text-[#E89A27]" />
    },
    {
      step: "05",
      title: "Optimize",
      subtitle: "Capacitated Dynamic Routing",
      desc: "OR-Tools TSP solver matches optimal vehicles, enforces truck load limits, and generates consolidated collection routes with dynamic mid-route insertion.",
      metric: "27.4 km Efficient Route",
      icon: <Truck className="w-6 h-6 text-[#2878C8]" />
    },
    {
      step: "06",
      title: "Recover",
      subtitle: "Circularity & Landfill Diversion",
      desc: "Tracks material recovery streams to Ahmedabad MRFs and composting hubs, measuring diverted landfill tonnage and verified carbon emissions avoided.",
      metric: "63.9% Diversion Rate",
      icon: <Recycle className="w-6 h-6 text-[#16845B]" />
    }
  ];

  const scaleSteps = [
    {
      level: "ONE BIN",
      title: "Smart Bin Node AHM-104",
      location: "Sabarmati Riverfront Walkway",
      desc: "Sensory IoT node capturing fill (82%), weight (31.4 kg), and predictive overflow in 03h 42m.",
      icon: "🗑️",
      stat: "82% Full"
    },
    {
      level: "AMC ZONE",
      title: "Zone C — Sabarmati Corridor",
      location: "East & West Riverfront Promenades",
      desc: "Aggregated telemetry monitoring 24 smart nodes, detecting high-volume weekend footfall surges.",
      icon: "📍",
      stat: "780 kg/day (+50%)"
    },
    {
      level: "COLLECTION ROUTE",
      title: "Route #V01-Morning",
      location: "Sabarmati Hub → CG Road → Vastrapur",
      desc: "Capacity-constrained vehicle trajectory dispatching 2,000 kg compactor to collect 1,740 kg across 5 nodes.",
      icon: "🚚",
      stat: "27.4 km (87% Load)"
    },
    {
      level: "AHMEDABAD CITY",
      title: "City-Wide AI Command Grid",
      location: "12 Municipal Zones across AMC",
      desc: "Coordinating 120 smart bins, 16 municipal fleet vehicles, and 2 central Material Recovery Facilities.",
      icon: "🏙️",
      stat: "120 Nodes Active"
    },
    {
      level: "CIRCULAR INTELLIGENCE",
      title: "City-Wide Waste Intelligence",
      location: "Closed-Loop Closed Carbon Network",
      desc: "Autonomous AI loop continuously learning from collection telemetry to eliminate overflow and maximize recovery.",
      icon: "🌱",
      stat: "63.9% Diverted"
    }
  ];

  const triggerLiveDecision = () => {
    setSimulationState('analyzing');
    setTimeout(() => {
      setSimulationState('decision_made');
    }, 1200);
  };

  return (
    <div className="min-h-screen text-[#17201B] overflow-x-hidden selection:bg-[#16845B] selection:text-white relative">
      {/* Fixed Background Image — same as login page */}
      <div
        className="fixed inset-0 bg-cover bg-center z-0 pointer-events-none"
        style={{
          backgroundImage: `url('/city-riverfront-bg.jpg')`,
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          opacity: 0.92,
          filter: 'none'
        }}
      />
      {/* Minimal overlay — preserves the vivid sunset tones */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.03) 50%, rgba(255, 245, 220, 0.06) 100%)' }} />

      {/* All content above the background */}
      <div className="relative z-10">
        {/* Top Banner */}
        <div className="bg-[#E6F4EA]/90 backdrop-blur-sm border-b border-[#C2E7CB] px-4 py-2 text-center text-xs font-semibold text-[#0B5D3B] flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#16845B] animate-ping"></span>
          <span>Ahmedabad Municipal AI Waste Operations Prototype • Live Simulated Telemetry</span>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
          HERO SECTION — Full Viewport Height
          Layout zones (approximate, relative to viewport height):
            0–10%  : top banner already rendered above
           10–38%  : AI badge + H1 heading (above the bridge / in sky zone)
           38–55%  : Bridge clearly visible — NO content here
           42–52%  : Telemetry panel RIGHT column (vertical center)
           54–74%  : Compact predict-waste card + CTA Buttons (below bridge)
           74–82%  : Stat pills row
      ══════════════════════════════════════════════════════════════════ */}
        <section className="relative w-full" style={{ minHeight: '100vh' }}>

          {/* ── HEADING LAYER: Badge + H1 in the sky zone, slightly above the bridge ── */}
          <div
            className="absolute left-0 right-0 flex flex-col items-start px-6 sm:px-14"
            style={{ top: '26vh' }}
          >
            {/* AI Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCFCE7]/90 backdrop-blur-md border border-[#BBF7D0] text-[#0B5D3B] text-xs font-extrabold tracking-wide shadow-sm mb-3">
              <Zap className="w-3.5 h-3.5 text-[#16845B]" />
              <span>AI DECISION SUPPORT SYSTEM • AHMEDABAD</span>
            </div>

            {/* H1 — sits just above the bridge (bridge is ~40-55% vh) */}
            <h1
              className="font-black tracking-tight text-[#05120a] leading-[1.1]"
              style={{
                fontSize: 'clamp(2.4rem, 4.8vw, 3.8rem)',
                textShadow: '0 2px 16px rgba(255,255,255,1), 0 0 8px rgba(255,255,255,1)',
                whiteSpace: 'nowrap'
              }}
            >
              Ahmedabad's Waste.
              <span
                className="text-[#0a4f2e]"
                style={{
                  display: 'block',
                  textShadow: '0 2px 16px rgba(255,255,255,1), 0 0 8px rgba(255,255,255,1)'
                }}
              >
                Managed Intelligently.
              </span>
            </h1>
          </div>

          {/* ── TELEMETRY PANEL — Right side, vertically centered at 50vh ── */}
          <div
            className="absolute right-6 sm:right-14 hidden lg:block"
            style={{ top: '50vh', transform: 'translateY(-50%)', width: 'min(44vw, 560px)' }}
          >
            <div className="bg-white border border-[#E3EAE6] rounded-3xl p-5 shadow-2xl relative overflow-hidden">
              {/* LIVE TELEMETRY SIGNAL header */}
              <div className="flex items-center justify-between border-b border-[#E3EAE6] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D64545] animate-ping"></span>
                  <span className="text-xs font-black font-mono text-[#D64545] tracking-wider">LIVE TELEMETRY SIGNAL</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#66736C] bg-[#F1F6F3] px-2 py-1 rounded-lg border border-[#E3EAE6]">
                  Node AHM-104 (Sabarmati)
                </span>
              </div>

              {/* Map Route SVG */}
              <div className="relative bg-[#F7FAF8] rounded-2xl px-4 pt-3 pb-2 border border-[#E3EAE6] overflow-hidden mb-3">
                <div className="absolute inset-0 bg-[radial-gradient(#CBD8D2_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none"></div>
                <svg className="w-full h-36" viewBox="0 0 400 140">
                  <path d="M 50,120 Q 120,35 200,70 T 350,30" fill="none" stroke="#16845B" strokeWidth="3" strokeDasharray="6 4" className="animate-pulse" />
                  <circle cx="50" cy="120" r="9" fill="#2878C8" stroke="#FFFFFF" strokeWidth="2" />
                  <text x="50" y="138" fontSize="8" fontWeight="bold" fill="#17201B" textAnchor="middle">AMC Depot</text>
                  <circle cx="200" cy="70" r="13" fill="#D64545" stroke="#FFFFFF" strokeWidth="3" className="animate-ping" opacity="0.4" />
                  <circle cx="200" cy="70" r="9" fill="#D64545" stroke="#FFFFFF" strokeWidth="2" />
                  <text x="200" y="60" fontSize="8" fontWeight="bold" fill="#D64545" textAnchor="middle">AHM-104 (82%)</text>
                  <rect x="108" y="52" width="32" height="16" rx="3" fill="#0B5D3B" stroke="#FFFFFF" strokeWidth="1.5" />
                  <text x="124" y="63" fontSize="7" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">🚚 V-01</text>
                  <circle cx="350" cy="30" r="9" fill="#16845B" stroke="#FFFFFF" strokeWidth="2" />
                  <text x="350" y="18" fontSize="8" fontWeight="bold" fill="#0B5D3B" textAnchor="middle">MRF Recovery</text>
                </svg>
                <div className="flex items-center justify-between pt-1.5 border-t border-[#E3EAE6] text-[10px]">
                  <span className="text-[#66736C] font-semibold flex items-center gap-1">
                    <Activity className="w-3 h-3 text-[#16845B]" /> Telemetry: Real-Time
                  </span>
                  <span className="font-mono text-[#16845B] font-bold">23.056°N, 72.585°E</span>
                </div>
              </div>

              {/* Quick Metrics Cards */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {[
                  { label: 'Current Fill', val: '82%', sub: '31.4 kg', color: 'text-[#D64545]' },
                  { label: 'Overflow In', val: '03h 42m', sub: 'ML Forecast', color: 'text-[#E89A27]' },
                  { label: 'Priority', val: '94/100', sub: 'Critical', color: 'text-[#16845B]' },
                  { label: 'Assigned', val: 'V-01', sub: '2.4 km', color: 'text-[#2878C8]' },
                ].map((m, i) => (
                  <div key={i} className="p-2 bg-[#F1F6F3] rounded-xl border border-[#E3EAE6]">
                    <span className="text-[9px] text-[#66736C] font-bold block uppercase leading-tight">{m.label}</span>
                    <span className={`font-extrabold font-mono text-sm ${m.color}`}>{m.val}</span>
                    <span className="text-[9px] text-[#66736C] block leading-tight">{m.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── LEFT CONTENT BELOW BRIDGE: Compact predict-waste card + Buttons + Stats ── */}
          <div
            className="absolute left-6 sm:left-14 right-6 sm:right-14 lg:right-auto"
            style={{ top: '56vh', maxWidth: '540px' }}
          >
            {/* COMPACT Predict-waste card — minimal height */}
            <div className="landing-glass-card px-4 py-3 mb-3 flex items-center gap-3">
              <div className="p-2 bg-[#F0FDF4]/90 rounded-xl border border-[#BBF7D0] shrink-0 shadow-sm">
                <Zap className="w-4 h-4 text-[#16845B]" />
              </div>
              <p className="text-xs sm:text-sm font-black text-[#042e1a] leading-snug">
                Predict waste. Prevent overflow.{' '}
                <span className="text-[#0B5D3B]">Optimize collection. Maximize recovery.</span>
              </p>
            </div>

            {/* CTA Buttons — always visible on first load */}
            <div className="flex flex-wrap gap-2.5 mb-3">
              <button
                onClick={handleLaunch}
                className="px-6 py-3 bg-[#16845B] hover:bg-[#0B5D3B] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-[#16845B]/25 flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Explore Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate?.('login')}
                className="px-5 py-3 bg-[#DCFCE7] hover:bg-[#BBF7D0] border border-[#BBF7D0] text-[#065F46] text-sm font-extrabold rounded-xl flex items-center gap-2 transition-all shadow-sm"
              >
                <span>Operator Login</span>
              </button>
              <a
                href="#workflow"
                className="px-4 py-3 bg-white/85 hover:bg-white backdrop-blur-md border border-white/70 text-[#17201B] text-sm font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>How It Works</span>
                <ChevronRight className="w-4 h-4 text-[#66736C]" />
              </a>
            </div>

            {/* Stat pills row */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#0a1a10]">
              {[
                '120 Smart Nodes',
                '16 EV & Tipper Trucks',
                '12 AMC Zones',
                '63.9% Recovery Rate'
              ].map((label) => (
                <div key={label} className="flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-white/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16845B]" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Telemetry panel for mobile/tablet (stacked below content) */}
          <div className="lg:hidden absolute left-6 sm:left-14 right-6 sm:right-14" style={{ top: '90vh' }}>
            <div className="bg-white border border-[#E3EAE6] rounded-3xl p-5 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#E3EAE6] pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D64545] animate-ping"></span>
                  <span className="text-xs font-black font-mono text-[#D64545] tracking-wider">LIVE TELEMETRY SIGNAL</span>
                </div>
                <span className="text-xs font-mono font-bold text-[#66736C] bg-[#F1F6F3] px-2.5 py-1 rounded-lg border border-[#E3EAE6]">
                  Node AHM-104 (Bodakdev)
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {[
                  { label: 'Fill', val: '82%', color: 'text-[#D64545]' },
                  { label: 'Overflow', val: '3h 42m', color: 'text-[#E89A27]' },
                  { label: 'Priority', val: '94/100', color: 'text-[#16845B]' },
                  { label: 'Vehicle', val: 'V-01', color: 'text-[#2878C8]' },
                ].map((m, i) => (
                  <div key={i} className="p-2 bg-[#F1F6F3] rounded-xl border border-[#E3EAE6]">
                    <span className="text-[9px] text-[#66736C] font-bold block uppercase">{m.label}</span>
                    <span className={`font-extrabold font-mono text-sm ${m.color}`}>{m.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </section>

        {/* THE PROBLEM VS SMARTBINX (Section 17) */}
        <section className="py-20 px-6 sm:px-12">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="landing-glass-card p-6 sm:p-8 text-center max-w-2xl mx-auto space-y-2.5">
              <span className="text-xs font-black text-[#0B5D3B] uppercase tracking-widest bg-[#DCFCE7]/90 px-3 py-1 rounded-full border border-[#BBF7D0] inline-block shadow-sm">
                Paradigm Shift
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#05120a] tracking-tight">
                Transforming Traditional Waste Collection
              </h2>
              <p className="text-sm text-[#17201B] font-medium max-w-xl mx-auto leading-relaxed">
                Moving from blind, reactive schedule runs to transparent, predictive closed-loop decision intelligence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* Traditional Fixed Model */}
              <div className="p-8 bg-[#FEF2F2]/60 border border-[#FECACA] rounded-3xl space-y-6 flex flex-col justify-between shadow-sm">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FEE2E2] text-[#991B1B] text-xs font-bold rounded-full border border-[#FECACA]">
                    <AlertTriangle className="w-3.5 h-3.5" /> Traditional Fixed Schedule
                  </div>
                  <h3 className="text-xl font-bold text-[#17201B]">
                    Blind routes ignore real-time urban dynamics
                  </h3>

                  {/* Workflow Diagram */}
                  <div className="bg-white p-4 rounded-2xl border border-[#FECACA] font-mono text-xs text-[#991B1B] space-y-2">
                    <div className="flex items-center justify-between">
                      <span>FIXED SCHEDULE</span>
                      <span>→</span>
                      <span>FIXED ROUTE</span>
                    </div>
                    <div className="flex items-center justify-between text-[#D64545] font-bold">
                      <span>OVERFLOW</span>
                      <span>→</span>
                      <span>UNNECESSARY TRIPS</span>
                    </div>
                    <div className="flex items-center justify-between text-[#7F1D1D]">
                      <span>HIGHER COST</span>
                      <span>→</span>
                      <span>LOWER RECYCLING</span>
                    </div>
                  </div>

                  <ul className="text-xs text-[#66736C] space-y-2.5 leading-relaxed pt-2">
                    <li className="flex items-start gap-2">
                      <span className="text-[#D64545] font-bold">✕</span> Trucks collect half-empty bins while urgent bins spill onto public corridors.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#D64545] font-bold">✕</span> Zero forward visibility into which bins will overflow in 3–6 hours.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#D64545] font-bold">✕</span> Unsegregated loads contaminate recyclables and overwhelm Pirana landfill.
                    </li>
                  </ul>
                </div>
              </div>

              {/* SmartBinX AI Closed-Loop Model */}
              <div className="p-8 bg-[#F0FDF4]/80 border border-[#BBF7D0] rounded-3xl space-y-6 flex flex-col justify-between shadow-md">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#DCFCE7] text-[#0B5D3B] text-xs font-bold rounded-full border border-[#BBF7D0]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#16845B]" /> SmartBinX AI Paradigm
                  </div>
                  <h3 className="text-xl font-bold text-[#17201B]">
                    Closed-Loop Predictive Decision Intelligence
                  </h3>

                  {/* Workflow Diagram */}
                  <div className="bg-white p-4 rounded-2xl border border-[#BBF7D0] font-mono text-xs text-[#0B5D3B] font-bold space-y-2">
                    <div className="flex items-center justify-between">
                      <span>MONITOR</span>
                      <span className="text-[#16845B]">→</span>
                      <span>PREDICT</span>
                      <span className="text-[#16845B]">→</span>
                      <span>PRIORITIZE</span>
                    </div>
                    <div className="flex items-center justify-between text-[#16845B]">
                      <span>OPTIMIZE</span>
                      <span className="text-[#0B5D3B]">→</span>
                      <span>RECOVER</span>
                      <span className="text-[#0B5D3B]">→</span>
                      <span>LEARN</span>
                    </div>
                  </div>

                  <ul className="text-xs text-[#17201B] space-y-2.5 leading-relaxed pt-2 font-medium">
                    <li className="flex items-start gap-2">
                      <span className="text-[#16845B] font-bold">✓</span> Continuous ML fill forecasting predicts overflow hours ahead.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#16845B] font-bold">✓</span> Hybrid Waste Vision audits purity and ensures clean segregated recovery.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#16845B] font-bold">✓</span> Dynamic vehicle replanning with zero truck overload risks.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW WASTEWISE AI THINKS — 6-STEP WORKFLOW (Section 18) */}
        <section id="workflow" className="py-20 px-6 sm:px-12 max-w-7xl mx-auto">
          <div className="landing-glass-card p-6 sm:p-8 text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-black text-[#0B5D3B] uppercase tracking-widest bg-[#DCFCE7]/90 px-3 py-1 rounded-full border border-[#BBF7D0] inline-block shadow-sm">
              Automated Decision Pipeline
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#05120a] tracking-tight">
              How SmartBinX AI Thinks
            </h2>
            <p className="text-sm text-[#17201B] font-medium leading-relaxed">
              An intelligent 6-phase autonomous cycle running continuously on real-time municipal telemetry.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflowSteps.map((item, idx) => {
              const isSelected = activeWorkflowStep === idx;
              return (
                <div
                  key={item.step}
                  onClick={() => setActiveWorkflowStep(idx)}
                  className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 flex flex-col justify-between ${isSelected
                    ? 'bg-white border-[#16845B] ring-2 ring-[#16845B]/20 shadow-xl'
                    : 'bg-white border-[#E3EAE6] hover:border-[#16845B]/50 shadow-card hover:shadow-card-hover'
                    }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-extrabold text-[#66736C] bg-[#F1F6F3] px-2.5 py-1 rounded-lg border border-[#E3EAE6]">
                        STEP {item.step}
                      </span>
                      <div className="p-3 bg-[#F0FDF4] rounded-2xl border border-[#BBF7D0]">
                        {item.icon}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-[#17201B] mb-1">{item.title}</h3>
                    <h4 className="text-xs font-semibold text-[#16845B] mb-3">{item.subtitle}</h4>
                    <p className="text-xs text-[#66736C] leading-relaxed mb-4">{item.desc}</p>
                  </div>

                  <div className="pt-3 border-t border-[#E3EAE6] flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-[#0B5D3B] bg-[#DCFCE7] px-2 py-0.5 rounded">
                      {item.metric}
                    </span>
                    <span className="text-xs font-bold text-[#16845B] flex items-center gap-1">
                      <span>Inspect</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FROM ONE BIN TO THE WHOLE CITY — SCALE ZOOM CONCEPT (Section 19) */}
        <section className="py-20 px-6 sm:px-12">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="landing-glass-card p-6 sm:p-8 text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-black text-[#0B5D3B] uppercase tracking-widest bg-[#DCFCE7]/90 px-3 py-1 rounded-full border border-[#BBF7D0] inline-block shadow-sm">
                Scalability Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#05120a] tracking-tight">
                From One Bin to the Whole City
              </h2>
              <p className="text-sm text-[#17201B] font-medium leading-relaxed">
                SmartBinX scales seamlessly from micro-telemetry at an individual sensor node to multi-zone urban coordination.
              </p>
            </div>

            {/* Scale Step Navigation Tabs */}
            <div className="flex items-center justify-between max-w-4xl mx-auto bg-[#F7FAF8] p-1.5 rounded-2xl border border-[#E3EAE6] overflow-x-auto gap-2">
              {scaleSteps.map((step, idx) => (
                <button
                  key={step.level}
                  onClick={() => setActiveScaleIndex(idx)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${activeScaleIndex === idx
                    ? 'bg-[#16845B] text-white shadow-md shadow-[#16845B]/20'
                    : 'text-[#66736C] hover:text-[#17201B] hover:bg-white'
                    }`}
                >
                  <span>{step.icon}</span>
                  <span>{step.level}</span>
                </button>
              ))}
            </div>

            {/* Active Scale Details Showcase */}
            <div className="bg-[#F7FAF8] border border-[#E3EAE6] rounded-3xl p-8 max-w-4xl mx-auto shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-lg">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#DCFCE7] text-[#0B5D3B] text-xs font-bold rounded-full border border-[#BBF7D0]">
                  <span>Scale Tier {activeScaleIndex + 1} of 5</span>
                </div>
                <h3 className="text-2xl font-black text-[#17201B]">{scaleSteps[activeScaleIndex].title}</h3>
                <p className="text-xs text-[#16845B] font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{scaleSteps[activeScaleIndex].location}</span>
                </p>
                <p className="text-sm text-[#66736C] leading-relaxed">
                  {scaleSteps[activeScaleIndex].desc}
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E3EAE6] text-center shadow-sm w-full md:w-60 shrink-0 space-y-2">
                <span className="text-xs font-bold text-[#66736C] uppercase tracking-wider block">Operational Metric</span>
                <div className="text-2xl font-black text-[#16845B] font-mono">
                  {scaleSteps[activeScaleIndex].stat}
                </div>
                <span className="text-[11px] text-[#66736C] block">Live Telemetry Stamped</span>
              </div>
            </div>
          </div>
        </section>

        {/* SEE AI MAKE A DECISION — LIVE DEMO SECTION (Section 20) */}
        <section className="py-20 px-6 sm:px-12 max-w-6xl mx-auto">
          <div className="landing-glass-card p-6 sm:p-8 text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-black text-[#0B5D3B] uppercase tracking-widest bg-[#DCFCE7]/90 px-3 py-1 rounded-full border border-[#BBF7D0] inline-block shadow-sm">
              Interactive Demonstration
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#05120a] tracking-tight">
              See AI Make a Decision
            </h2>
            <p className="text-sm text-[#17201B] font-medium leading-relaxed">
              Experience how the platform transitions from detecting a raw problem to generating an optimal dispatch action.
            </p>
          </div>

          <div className="bg-white border border-[#E3EAE6] rounded-3xl p-8 shadow-xl space-y-8">
            {/* 3-Stage Progression */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stage 1: Problem */}
              <div className="p-5 bg-[#FEF2F2] rounded-2xl border border-[#FECACA] space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#991B1B]">
                  <span>01. PROBLEM DETECTED</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D64545] animate-pulse"></span>
                </div>
                <div className="space-y-1">
                  <span className="font-mono font-bold text-base text-[#17201B]">AHM-104 (Bodakdev)</span>
                  <div className="text-2xl font-black font-mono text-[#D64545]">82% FULL</div>
                </div>
                <div className="text-xs text-[#66736C] space-y-1">
                  <div>Predicted Overflow: <strong className="text-[#D64545]">4h 18m</strong></div>
                  <div>Priority Score: <strong className="text-[#D64545]">94 / 100 (Critical)</strong></div>
                </div>
              </div>

              {/* Stage 2: AI Decision */}
              <div className="p-5 bg-[#EFF6FF] rounded-2xl border border-[#BFDBFE] space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#1E40AF]">
                  <span>02. AI DECISION LOGIC</span>
                  <Sparkles className="w-4 h-4 text-[#2878C8]" />
                </div>
                <div className="space-y-1">
                  <span className="font-mono font-bold text-base text-[#17201B]">Explainable Evaluation</span>
                  <div className="text-sm font-bold text-[#2878C8]">Collect within 4 hours</div>
                </div>
                <div className="text-xs text-[#66736C] space-y-1">
                  <div>Selected Vehicle: <strong className="text-[#17201B]">Truck V-01</strong></div>
                  <div>Proximity: <strong className="text-[#17201B]">2.4 km away</strong></div>
                  <div>Available Payload: <strong className="text-[#16845B]">1,700 kg</strong></div>
                </div>
              </div>

              {/* Stage 3: Optimal Action */}
              <div className="p-5 bg-[#F0FDF4] rounded-2xl border border-[#BBF7D0] space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#0B5D3B]">
                  <span>03. DISPATCH ACTION</span>
                  <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
                </div>
                <div className="space-y-1">
                  <span className="font-mono font-bold text-base text-[#17201B]">Optimized Route</span>
                  <div className="text-2xl font-black font-mono text-[#16845B]">27.4 km</div>
                </div>
                <div className="text-xs text-[#66736C] space-y-1">
                  <div>Turn-by-turn TSP generated</div>
                  <div>Payload: <strong className="text-[#17201B]">1,740 kg (87% Load)</strong></div>
                </div>
              </div>
            </div>

            {/* Interactive Trigger Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E3EAE6]">
              <div className="text-xs text-[#66736C]">
                Click below to launch the step-by-step interactive 10-step AI operations walkthrough.
              </div>
              <button
                onClick={startAIDemo}
                className="px-6 py-3 bg-[#16845B] hover:bg-[#0B5D3B] text-white text-xs font-extrabold rounded-xl shadow-md shadow-[#16845B]/20 flex items-center gap-2 transition-all transform hover:scale-105"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Launch 10-Step AI Walkthrough</span>
              </button>
            </div>
          </div>
        </section>

        {/* IMPACT SECTION (Section 21) */}
        <section className="py-20 px-6 sm:px-12">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="landing-glass-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-black text-[#0B5D3B] uppercase tracking-widest bg-[#DCFCE7]/90 px-3 py-1 rounded-full border border-[#BBF7D0] inline-block shadow-sm">
                  Measurable Sustainability
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#05120a] mt-2 tracking-tight">
                  Projected Operational Impact
                </h2>
              </div>
              <div className="px-3.5 py-1.5 bg-[#FFFBEB]/90 border border-[#FDE68A] text-[#92400E] text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm self-start sm:self-auto">
                <AlertTriangle className="w-4 h-4 text-[#E89A27]" />
                <span>Prototype / Simulated Operational Metrics</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 bg-[#F7FAF8] rounded-3xl border border-[#E3EAE6] space-y-2">
                <span className="text-3xl sm:text-4xl font-black font-mono text-[#D64545]">12</span>
                <h3 className="text-sm font-bold text-[#17201B]">Overflow Events Averted</h3>
                <p className="text-xs text-[#66736C]">Pre-emptive collections before public spillage threshold.</p>
              </div>

              <div className="p-6 bg-[#F7FAF8] rounded-3xl border border-[#E3EAE6] space-y-2">
                <span className="text-3xl sm:text-4xl font-black font-mono text-[#16845B]">87%</span>
                <h3 className="text-sm font-bold text-[#17201B]">Vehicle Utilization</h3>
                <p className="text-xs text-[#66736C]">Payload density maximized without exceeding 2,000 kg capacity.</p>
              </div>

              <div className="p-6 bg-[#F7FAF8] rounded-3xl border border-[#E3EAE6] space-y-2">
                <span className="text-3xl sm:text-4xl font-black font-mono text-[#0D9488]">64%</span>
                <h3 className="text-sm font-bold text-[#17201B]">Recovery & Diversion Rate</h3>
                <p className="text-xs text-[#66736C]">Diverted from Pirana landfill to MRFs and composting hubs.</p>
              </div>

              <div className="p-6 bg-[#F7FAF8] rounded-3xl border border-[#E3EAE6] space-y-2">
                <span className="text-3xl sm:text-4xl font-black font-mono text-[#2878C8]">23.4 km</span>
                <h3 className="text-sm font-bold text-[#17201B]">Distance Avoided Daily</h3>
                <p className="text-xs text-[#66736C]">Eliminated unnecessary routes across AMC West zone.</p>
              </div>
            </div>
          </div>
        </section>

        {/* AHMEDABAD SECTION (Section 22) */}
        <section className="py-20 px-6 sm:px-12 max-w-7xl mx-auto space-y-12">
          <div className="landing-glass-card p-6 sm:p-8 text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-black text-[#0B5D3B] uppercase tracking-widest bg-[#DCFCE7]/90 px-3 py-1 rounded-full border border-[#BBF7D0] inline-block shadow-sm">
              Urban Scalability
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#05120a] tracking-tight">
              Built for Ahmedabad. Designed to Scale.
            </h2>
            <p className="text-sm text-[#17201B] font-medium max-w-2xl mx-auto leading-relaxed">
              A modular architecture designed to support diverse urban deployments across Gujarat and beyond.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
            {[
              { title: "Municipal Operations", desc: "City-wide ward and zone collections", icon: "🏛️" },
              { title: "University Campuses", desc: "High footfall academic institutions", icon: "🎓" },
              { title: "Residential Communities", desc: "Townships & high-density societies", icon: "🏡" },
              { title: "Commercial Areas", desc: "Retail plazas & business corridors", icon: "🏢" },
              { title: "Industrial Zones", desc: "Manufacturing parks & logistics depots", icon: "🏭" },
            ].map((item, idx) => (
              <div key={idx} className="p-5 bg-white rounded-2xl border border-[#E3EAE6] shadow-sm space-y-2">
                <span className="text-3xl">{item.icon}</span>
                <h3 className="text-sm font-bold text-[#17201B]">{item.title}</h3>
                <p className="text-[11px] text-[#66736C]">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL LANDING PAGE CTA (Section 23) */}
        <section className="py-20 bg-gradient-to-b from-[#E6F4EA] to-[#F7FAF8] border-t border-[#C2E7CB] text-center px-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#BBF7D0] text-[#0B5D3B] text-xs font-bold shadow-sm">
              <span>SmartBinX • Smarter Bins • Cleaner Cities</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-[#17201B] tracking-tight">
              Don't Wait for Waste to Overflow.
            </h2>

            <p className="text-lg font-semibold text-[#0B5D3B]">
              Predict it. Prioritize it. Optimize it. Recover it.
            </p>

            <p className="text-sm text-[#66736C] max-w-xl mx-auto">
              Launch the interactive command center to explore live Ahmedabad telemetry, simulate routing, and interact with the AI assistant.
            </p>

            <div className="pt-2">
              <button
                onClick={handleLaunch}
                className="px-10 py-4 bg-[#16845B] hover:bg-[#0B5D3B] text-white font-black text-base rounded-2xl shadow-xl shadow-[#16845B]/30 transition-all transform hover:scale-105 active:scale-95"
              >
                Launch Waste Intelligence
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-md border-t border-white/60 py-8 px-6 sm:px-12 text-xs text-[#66736C]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/smartbinx-logo.png" alt="SmartBinX" className="h-8 w-auto" />
              <span className="font-mono font-bold text-[#17201B]">SmartBinX</span>
              <span className="text-[#94A39D]">•</span>
              <span>Ahmedabad Smart Municipal Operations</span>
            </div>
            <div className="text-center sm:text-right text-[11px] text-[#94A39D]">
              Simulated Demonstration Environment • Closed-Loop Decision Intelligence
            </div>
          </div>
        </footer>
      </div>{/* close z-10 content wrapper */}
    </div>
  );
};

export default LandingPage;
