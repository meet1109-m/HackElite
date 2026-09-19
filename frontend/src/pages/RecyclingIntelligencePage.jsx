import React from 'react';
import { useWasteData } from '../context/WasteDataContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Recycle, Leaf, Trees, Fuel, Globe, ShieldCheck, ArrowUpRight, TrendingUp, Sparkles } from 'lucide-react';

export default function RecyclingIntelligencePage() {
  const { analytics } = useWasteData();

  const streams = [
    { name: 'Organic (Composting)', value: 1.8, unit: 'tonnes', pct: 42.8, color: '#10b981', target: 'Central AMC Composting Plant' },
    { name: 'Plastic (Baling / Polymers)', value: 0.9, unit: 'tonnes', pct: 21.4, color: '#06b6d4', target: 'Ahmedabad MRF Unit 2' },
    { name: 'Paper & Cardboard', value: 0.6, unit: 'tonnes', pct: 14.3, color: '#3b82f6', target: 'Pulp Recycling Facility' },
    { name: 'Glass Containers', value: 0.4, unit: 'tonnes', pct: 9.5, color: '#a855f7', target: 'Glass Remelt Depot' },
    { name: 'Scrap Metal & Cans', value: 0.2, unit: 'tonnes', pct: 4.8, color: '#94a3b8', target: 'Secondary Smelting Hub' },
    { name: 'Non-Recyclable Residue', value: 0.3, unit: 'tonnes', pct: 7.2, color: '#f43f5e', target: 'Pirana Engineered Landfill' },
  ];

  const trendData = [
    { day: 'Mon', diversion: 58, tons: 3.8 },
    { day: 'Tue', diversion: 61, tons: 4.0 },
    { day: 'Wed', diversion: 59, tons: 3.9 },
    { day: 'Thu', diversion: 64, tons: 4.2 },
    { day: 'Fri', diversion: 63, tons: 4.1 },
    { day: 'Sat', diversion: 66, tons: 4.5 },
    { day: 'Sun', diversion: 64, tons: 4.2 },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Recycle className="w-8 h-8 text-emerald-400" />
              Recycling Intelligence & Landfill Diversion
            </h1>
            <span className="px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              Circularity Index & Environmental Metrics
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Track material recovery streams, quantify Pirana landfill diversion, and measure net carbon offset metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Simulated Operational Environmental Analytics</span>
        </div>
      </div>

      {/* TOP CIRCULARITY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Landfill Diversion Score */}
        <div className="bg-slate-900/80 border border-emerald-500/40 p-6 rounded-2xl backdrop-blur-xl shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Landfill Diversion</span>
            <Recycle className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">63.9%</span>
            <span className="text-xs text-emerald-400 font-bold flex items-center">
              <TrendingUp className="w-3.5 h-3.5" /> +4.2%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            2.7 tonnes of 4.2 tonnes diverted from landfill disposal today.
          </p>
        </div>

        {/* Distance Avoided */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl backdrop-blur-xl shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Distance Avoided</span>
            <Globe className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">23.4 km</span>
            <span className="text-xs text-blue-400 font-bold">via AI TSP</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Eliminated dead-head transit across AMC West Zone collection routes.
          </p>
        </div>

        {/* Diesel Fuel Saved */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl backdrop-blur-xl shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Diesel Saved</span>
            <Fuel className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">5.1 L</span>
            <span className="text-xs text-amber-400 font-bold">Estimated</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Direct fuel savings from dynamic skipping of sub-threshold bins.
          </p>
        </div>

        {/* CO2e Offset */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl backdrop-blur-xl shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CO₂e Avoided</span>
            <Leaf className="w-5 h-5 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">12.4 kg</span>
            <span className="text-xs text-teal-400 font-bold">Today</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Calculated at 2.68 kg CO₂ per liter of municipal diesel combustion.
          </p>
        </div>

      </div>

      {/* STREAM RECOVERY BREAKDOWN & DIVERSION TREND */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Stream Breakdown Cards */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Ahmedabad Waste Stream Recovery Channels</h3>
              <p className="text-xs text-slate-400">Total 4.2 tonnes collected today with designated circularity pathways</p>
            </div>
            <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full">
              6 Fractions
            </span>
          </div>

          <div className="space-y-3.5">
            {streams.map((st, idx) => (
              <div key={idx} className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                  <div>
                    <h4 className="text-xs font-bold text-white">{st.name}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">Destination: {st.target}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-white font-mono">{st.value} {st.unit}</span>
                  <span className="block text-[10px] text-slate-400 font-semibold">{st.pct}% of stream</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Diversion Trend */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6 flex flex-col justify-between">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white">7-Day Landfill Diversion Trend</h3>
            <p className="text-xs text-slate-400">Percentage of total municipal waste successfully recycled</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="diversionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="%" domain={[50, 75]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area type="monotone" dataKey="diversion" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#diversionGrad)" name="Diversion %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3.5 text-xs text-slate-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Circularity Milestone:</strong> Ahmedabad West Zone has maintained a &gt;60% diversion rate for 18 consecutive days.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
