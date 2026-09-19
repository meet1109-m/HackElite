import React from 'react';
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
  BarChart2
} from 'lucide-react';

export const LandingPage = ({ onLaunchApp, onEnterCommandCenter, onNavigate }) => {
  const handleLaunch = onLaunchApp || onEnterCommandCenter || (() => onNavigate?.('command-center'));
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 border-b border-emerald-800/40 px-4 py-2 text-center text-xs font-semibold text-emerald-300 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span>Ahmedabad Municipal AI Waste Operations Prototype • Live Simulated Telemetry</span>
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 sm:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold tracking-wide">
            <Zap className="w-3.5 h-3.5" />
            <span>AI DECISION SUPPORT SYSTEM</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Ahmedabad’s Waste, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Managed Intelligently.
            </span>
          </h1>

          <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
            <strong>SmartBinX</strong> predicts waste generation, prevents bin overflow, optimizes collection routes, and improves recyclable recovery through closed-loop AI decision intelligence.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <button
              onClick={onEnterCommandCenter}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm rounded-xl shadow-xl shadow-emerald-950/80 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
            >
              <span>Open Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#workflow"
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <span>Explore How It Works</span>
            </a>
          </div>

          <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>120 Smart Bins</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>16 EV & Tipper Trucks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>12 AMC Zones</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Card: Live Ahmedabad Intelligence Preview */}
        <div className="flex-1 w-full max-w-xl">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
                <span className="text-xs font-bold font-mono text-rose-300">LIVE PREDICTIVE ALERT</span>
              </div>
              <span className="text-xs font-mono text-slate-400">AHM-104 (Vastrapur)</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Current Fill</span>
                  <div className="text-2xl font-extrabold font-mono text-white">82% <span className="text-xs text-slate-400 font-normal">/ 40kg</span></div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Predicted Overflow</span>
                  <div className="text-xl font-extrabold font-mono text-rose-400">04h 18m</div>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-slate-200">
                <div className="font-bold text-emerald-400 flex items-center gap-1 mb-1">
                  <Cpu className="w-3.5 h-3.5" /> Explainable AI Decision
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Priority Score: <strong>94/100 (CRITICAL)</strong>. Organic stream degradation risk in Vastrapur corridor. Recommended vehicle: <strong>V-01</strong> (2.4 km away, 1,700 kg available).
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Landfill Diversion</span>
                  <span className="font-bold font-mono text-emerald-400 text-sm">63.9%</span>
                </div>
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">CO₂e Avoided</span>
                  <span className="font-bold font-mono text-teal-400 text-sm">384.6 kg</span>
                </div>
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Distance Saved</span>
                  <span className="font-bold font-mono text-sky-400 text-sm">23.4 km</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem vs Solution */}
      <section className="py-16 bg-slate-900/60 border-y border-slate-800 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" /> Traditional Municipal Waste Limitations
            </div>
            <h3 className="text-xl font-bold text-white">Fixed schedules ignore real-time dynamics</h3>
            <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <li>❌ Trucks collect half-empty bins while critical bins overflow onto streets.</li>
              <li>❌ No forward visibility into which bins will overflow in 3–6 hours.</li>
              <li>❌ Unsegregated collections contaminate recyclables and overload landfills.</li>
              <li>❌ Fixed routes waste thousands of liters of fuel every month.</li>
            </ul>
          </div>

          <div className="p-6 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" /> SmartBinX AI Paradigm
            </div>
            <h3 className="text-xl font-bold text-white">Predict → Prioritize → Optimize → Recover</h3>
            <ul className="text-xs text-slate-200 space-y-2 leading-relaxed">
              <li>✅ Continuous ML fill forecasting predicts overflows before they happen.</li>
              <li>✅ Transparent Hybrid Waste Vision with Recycling Purity Scoring.</li>
              <li>✅ Capacity-constrained dynamic routing dispatches nearest optimal vehicles.</li>
              <li>✅ Closed-loop intelligence measures diverted tonnes and circularity impact.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 7-Step Workflow */}
      <section id="workflow" className="py-20 px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Closed-Loop Intelligence</span>
          <h2 className="text-3xl font-extrabold text-white mt-2">How WasteWise AI Works</h2>
          <p className="text-sm text-slate-400 mt-2">
            An automated end-to-end intelligence cycle that continuously learns from telemetry and collection data.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Bin Telemetry", desc: "IoT sensors capture fill %, weight, GPS coordinates, and historical rates.", icon: <Cpu className="w-5 h-5 text-emerald-400" /> },
            { step: "02", title: "ML Overflow Prediction", desc: "Regressive models forecast 6h, 12h, 24h trajectories and exact countdowns.", icon: <Clock className="w-5 h-5 text-sky-400" /> },
            { step: "03", title: "Hybrid Waste Vision", desc: "Computer vision classifies material composition and assigns purity scores.", icon: <Camera className="w-5 h-5 text-teal-400" /> },
            { step: "04", title: "Explainable Priority", desc: "Multi-factor priority engine scores bins with full point transparency.", icon: <Zap className="w-5 h-5 text-amber-400" /> },
            { step: "05", title: "Capacity Routing", desc: "Solves vehicle routing problems without exceeding truck load capacity.", icon: <Truck className="w-5 h-5 text-indigo-400" /> },
            { step: "06", title: "Dynamic Replanning", desc: "Emergency bins dynamically insert into active truck corridors.", icon: <TrendingUp className="w-5 h-5 text-rose-400" /> },
            { step: "07", title: "Circularity & Diversion", desc: "Measures landfill diversion rate and environmental emissions avoided.", icon: <Recycle className="w-5 h-5 text-emerald-400" /> },
            { step: "08", title: "Adaptive Learning", desc: "Collection records feed back to continuously improve future predictions.", icon: <BarChart2 className="w-5 h-5 text-cyan-400" /> },
          ].map(item => (
            <div key={item.step} className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-emerald-500/40 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-extrabold text-slate-500 group-hover:text-emerald-400 transition-colors">{item.step}</span>
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">{item.icon}</div>
              </div>
              <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-t from-emerald-950/40 to-slate-950 border-t border-slate-800 text-center px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Experience the Future of Urban Waste Intelligence
          </h2>
          <p className="text-sm text-slate-300">
            Launch the interactive command center to inspect Ahmedabad's 120 smart bins, simulate fleet routing, run what-if scenarios, and interact with the AI Waste Manager.
          </p>
          <button
            onClick={handleLaunch}
            className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base rounded-xl shadow-2xl shadow-emerald-900/60 transition-transform transform hover:scale-105"
          >
            Launch Waste Intelligence Command Center
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
