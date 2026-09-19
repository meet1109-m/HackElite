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
    <div className="min-h-screen bg-[#F7FAF8] text-[#17201B] overflow-x-hidden selection:bg-[#16845B] selection:text-white">
      {/* Top Banner */}
      <div className="bg-[#E6F4EA] border-b border-[#C2E7CB] px-4 py-2 text-center text-xs font-semibold text-[#0B5D3B] flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#16845B] animate-ping"></span>
        <span>Ahmedabad Municipal AI Waste Operations Prototype • Live Simulated Telemetry</span>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-6 sm:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DCFCE7] border border-[#BBF7D0] text-[#0B5D3B] text-xs font-extrabold tracking-wide shadow-sm">
            <Zap className="w-4 h-4 text-[#16845B]" />
            <span>AI DECISION SUPPORT SYSTEM • AHMEDABAD</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#17201B] leading-[1.15]">
            Ahmedabad's Waste. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#16845B] via-[#0D9488] to-[#2878C8]">
              Managed Intelligently.
            </span>
          </h1>

          <p className="text-base sm:text-lg font-semibold text-[#0B5D3B]">
            Predict waste. Prevent overflow. Optimize collection. Maximize recovery.
          </p>

          <p className="text-sm sm:text-base text-[#66736C] max-w-2xl leading-relaxed">
            <strong>SmartBinX</strong> transforms waste collection from fixed schedules into predictive, data-driven operations using AI forecasting, computer vision, intelligent routing and recycling analytics for Ahmedabad.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <button
              onClick={handleLaunch}
              className="w-full sm:w-auto px-8 py-4 bg-[#16845B] hover:bg-[#0B5D3B] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-[#16845B]/25 flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#workflow"
              className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-[#F1F6F3] border border-[#E3EAE6] text-[#17201B] text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <span>See How It Works</span>
              <ChevronRight className="w-4 h-4 text-[#66736C]" />
            </a>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#66736C] border-t border-[#E3EAE6]">
            <div className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
              <span>120 Smart Nodes</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
              <span>16 EV & Tipper Trucks</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
              <span>12 AMC Zones</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
              <span>63.9% Recovery Rate</span>
            </div>
          </div>
        </div>

        {/* Hero Visual: Stylized Interactive Ahmedabad Digital Waste Map */}
        <div className="flex-1 w-full max-w-xl">
          <div className="bg-white border border-[#E3EAE6] rounded-3xl p-6 shadow-xl relative overflow-hidden">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-[#E3EAE6] pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-[#D64545] animate-ping"></span>
                <span className="text-xs font-black font-mono text-[#D64545] tracking-wider">LIVE TELEMETRY SIGNAL</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#66736C] bg-[#F1F6F3] px-2.5 py-1 rounded-lg border border-[#E3EAE6]">
                Node AHM-104 (Sabarmati)
              </span>
            </div>

            {/* Stylized Node Simulator Canvas */}
            <div className="relative bg-[#F7FAF8] rounded-2xl p-5 border border-[#E3EAE6] overflow-hidden mb-4">
              {/* Pulsing Grid Background */}
              <div className="absolute inset-0 bg-[radial-gradient(#CBD8D2_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none"></div>

              {/* Map Route SVG Overlay */}
              <svg className="w-full h-44" viewBox="0 0 400 160">
                {/* Route Path */}
                <path
                  d="M 50,130 Q 120,40 200,80 T 350,40"
                  fill="none"
                  stroke="#16845B"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                  className="animate-pulse"
                />

                {/* Depot Node */}
                <circle cx="50" cy="130" r="10" fill="#2878C8" stroke="#FFFFFF" strokeWidth="2" />
                <text x="50" y="152" fontSize="9" fontWeight="bold" fill="#17201B" textAnchor="middle">AMC Depot</text>

                {/* Bin Node AHM-104 (Pulsing Critical) */}
                <circle cx="200" cy="80" r="14" fill="#D64545" stroke="#FFFFFF" strokeWidth="3" className="animate-ping" opacity="0.4" />
                <circle cx="200" cy="80" r="10" fill="#D64545" stroke="#FFFFFF" strokeWidth="2" />
                <text x="200" y="70" fontSize="9" fontWeight="bold" fill="#D64545" textAnchor="middle">AHM-104 (82%)</text>

                {/* Vehicle Marker */}
                <rect x="110" y="60" width="34" height="18" rx="4" fill="#0B5D3B" stroke="#FFFFFF" strokeWidth="1.5" />
                <text x="127" y="72" fontSize="8" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">🚚 V-01</text>

                {/* Recycling Center Node */}
                <circle cx="350" cy="40" r="10" fill="#16845B" stroke="#FFFFFF" strokeWidth="2" />
                <text x="350" y="25" fontSize="9" fontWeight="bold" fill="#0B5D3B" textAnchor="middle">MRF Recovery</text>
              </svg>

              {/* Real-time Indicator Chip */}
              <div className="flex items-center justify-between pt-2 border-t border-[#E3EAE6] text-xs">
                <span className="text-[#66736C] font-semibold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#16845B]" /> Telemetry Stream: Real-Time
                </span>
                <span className="font-mono text-[#16845B] font-bold">23.056° N, 72.585° E</span>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
              <div className="p-3 bg-[#F1F6F3] rounded-xl border border-[#E3EAE6]">
                <span className="text-[10px] text-[#66736C] font-bold block uppercase">Current Fill</span>
                <span className="font-extrabold font-mono text-[#D64545] text-base">82%</span>
                <span className="text-[10px] text-[#66736C] block">31.4 kg / 50kg</span>
              </div>
              <div className="p-3 bg-[#F1F6F3] rounded-xl border border-[#E3EAE6]">
                <span className="text-[10px] text-[#66736C] font-bold block uppercase">Overflow In</span>
                <span className="font-extrabold font-mono text-[#E89A27] text-base">03h 42m</span>
                <span className="text-[10px] text-[#66736C] block">ML Forecast</span>
              </div>
              <div className="p-3 bg-[#F1F6F3] rounded-xl border border-[#E3EAE6]">
                <span className="text-[10px] text-[#66736C] font-bold block uppercase">Priority</span>
                <span className="font-extrabold font-mono text-[#16845B] text-base">94/100</span>
                <span className="text-[10px] text-[#66736C] block">Critical Tier</span>
              </div>
              <div className="p-3 bg-[#F1F6F3] rounded-xl border border-[#E3EAE6]">
                <span className="text-[10px] text-[#66736C] font-bold block uppercase">Assigned</span>
                <span className="font-extrabold font-mono text-[#2878C8] text-base">V-01</span>
                <span className="text-[10px] text-[#66736C] block">2.4 km away</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM VS SMARTBINX (Section 17) */}
      <section className="py-20 bg-white border-y border-[#E3EAE6] px-6 sm:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-[#16845B] uppercase tracking-widest">Paradigm Shift</span>
            <h2 className="text-3xl font-extrabold text-[#17201B] mt-2">
              Transforming Traditional Waste Collection
            </h2>
            <p className="text-sm text-[#66736C] mt-2">
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
                  <ShieldCheck className="w-3.5 h-3.5 text-[#16845B]" /> WasteWise AI Paradigm
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
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-xs font-bold text-[#16845B] uppercase tracking-widest">Automated Decision Pipeline</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17201B]">How WasteWise AI Thinks</h2>
          <p className="text-sm text-[#66736C]">
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
                className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                  isSelected
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
      <section className="py-20 bg-white border-y border-[#E3EAE6] px-6 sm:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#16845B] uppercase tracking-widest">Scalability Architecture</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17201B]">
              From One Bin to the Whole City
            </h2>
            <p className="text-sm text-[#66736C]">
              SmartBinX scales seamlessly from micro-telemetry at an individual sensor node to multi-zone urban coordination.
            </p>
          </div>

          {/* Scale Step Navigation Tabs */}
          <div className="flex items-center justify-between max-w-4xl mx-auto bg-[#F7FAF8] p-1.5 rounded-2xl border border-[#E3EAE6] overflow-x-auto gap-2">
            {scaleSteps.map((step, idx) => (
              <button
                key={step.level}
                onClick={() => setActiveScaleIndex(idx)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
                  activeScaleIndex === idx
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
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-[#16845B] uppercase tracking-widest">Interactive Demonstration</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17201B]">See AI Make a Decision</h2>
          <p className="text-sm text-[#66736C]">
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
                <span className="font-mono font-bold text-base text-[#17201B]">AHM-104 (Sabarmati)</span>
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
      <section className="py-20 bg-white border-y border-[#E3EAE6] px-6 sm:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#16845B] uppercase tracking-widest">Measurable Sustainability</span>
              <h2 className="text-3xl font-extrabold text-[#17201B] mt-1">Projected Operational Impact</h2>
            </div>
            <div className="px-3.5 py-1.5 bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-xs font-bold rounded-xl flex items-center gap-2">
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
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#16845B] uppercase tracking-widest">Urban Scalability</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17201B]">
            Built for Ahmedabad. Designed to Scale.
          </h2>
          <p className="text-sm text-[#66736C]">
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
      <footer className="bg-white border-t border-[#E3EAE6] py-8 px-6 sm:px-12 text-xs text-[#66736C]">
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
    </div>
  );
};

export default LandingPage;
