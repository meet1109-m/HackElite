import React from 'react';
import { useWasteData } from '../context/WasteDataContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Recycle, Leaf, Trees, Fuel, Globe, ShieldCheck, ArrowUpRight, TrendingUp, Sparkles } from 'lucide-react';

export default function RecyclingIntelligencePage() {
  const { analytics } = useWasteData();

  const totalTons = analytics?.total_waste_collected_tonnes || 4.24;
  const sb = analytics?.stream_breakdown || {};
  const streams = [
    { name: 'Organic (Composting)', value: sb.Organic ?? 1.82, unit: 'tonnes', pct: totalTons > 0 ? Math.round(((sb.Organic ?? 1.82) / totalTons) * 100) : 43, color: '#16845B', target: 'Central AMC Composting Plant' },
    { name: 'Plastic (Baling / Polymers)', value: sb.Plastic ?? 0.93, unit: 'tonnes', pct: totalTons > 0 ? Math.round(((sb.Plastic ?? 0.93) / totalTons) * 100) : 22, color: '#2878C8', target: 'Ahmedabad MRF Unit 2' },
    { name: 'Paper & Cardboard', value: sb.Paper ?? 0.64, unit: 'tonnes', pct: totalTons > 0 ? Math.round(((sb.Paper ?? 0.64) / totalTons) * 100) : 15, color: '#E89A27', target: 'Pulp Recycling Facility' },
    { name: 'Glass Containers', value: sb.Glass ?? 0.38, unit: 'tonnes', pct: totalTons > 0 ? Math.round(((sb.Glass ?? 0.38) / totalTons) * 100) : 9, color: '#0D9488', target: 'Glass Remelt Depot' },
    { name: 'Scrap Metal & Cans', value: sb.Metal ?? 0.21, unit: 'tonnes', pct: totalTons > 0 ? Math.round(((sb.Metal ?? 0.21) / totalTons) * 100) : 5, color: '#66736C', target: 'Secondary Smelting Hub' },
    { name: 'Non-Recyclable Residue', value: sb.Other ?? 0.26, unit: 'tonnes', pct: totalTons > 0 ? Math.round(((sb.Other ?? 0.26) / totalTons) * 100) : 6, color: '#D64545', target: 'Pirana Engineered Landfill' },
  ];

  const trendData = [
    { day: 'Mon', diversion: 58, tons: 3.8 },
    { day: 'Tue', diversion: 61, tons: 4.0 },
    { day: 'Wed', diversion: 59, tons: 3.9 },
    { day: 'Thu', diversion: 64, tons: 4.2 },
    { day: 'Fri', diversion: 63, tons: 4.1 },
    { day: 'Sat', diversion: 66, tons: 4.5 },
    { day: 'Sun', diversion: Math.round(analytics?.landfill_diversion_percentage || 64), tons: totalTons },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto bg-pattern-recycling min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#17201B] flex items-center gap-2">
              <Recycle className="w-7 h-7 text-[#16845B]" />
              Recycling Intelligence & Landfill Diversion
            </h1>
            <span className="px-3 py-1 text-xs font-bold bg-[#DCFCE7] text-[#0B5D3B] border border-[#BBF7D0] rounded-full">
              Circularity Index & Environmental Metrics
            </span>
          </div>
          <p className="text-[#66736C] text-xs sm:text-sm mt-1">
            Track material recovery streams, quantify Pirana landfill diversion, and measure net carbon offset metrics across Ahmedabad.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#F1F6F3] px-3.5 py-1.5 rounded-2xl border border-[#E3EAE6] text-xs text-[#17201B] font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#16845B]" />
          <span>Simulated Operational Circularity</span>
        </div>
      </div>

      {/* TOP CIRCULARITY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Landfill Diversion Score */}
        <div className="bg-white border border-[#BBF7D0] p-6 rounded-3xl shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#66736C] uppercase tracking-wider">Landfill Diversion</span>
            <Recycle className="w-5 h-5 text-[#16845B]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-[#16845B] font-mono">{analytics?.landfill_diversion_percentage ?? 63.9}%</span>
            <span className="text-xs text-[#0B5D3B] font-bold flex items-center">
              <TrendingUp className="w-3.5 h-3.5" /> +4.2%
            </span>
          </div>
          <p className="text-xs text-[#66736C] mt-2">
            {analytics?.potentially_recoverable_tonnes ?? 2.71} tonnes of {analytics?.total_waste_collected_tonnes ?? 4.24} tonnes diverted from landfill disposal today.
          </p>
        </div>

        {/* Distance Avoided */}
        <div className="bg-white border border-[#E3EAE6] p-6 rounded-3xl shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#66736C] uppercase tracking-wider">Distance Avoided</span>
            <Globe className="w-5 h-5 text-[#2878C8]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-[#17201B] font-mono">{analytics?.distance_optimized_km ?? 23.4} km</span>
            <span className="text-xs text-[#2878C8] font-bold">via AI TSP</span>
          </div>
          <p className="text-xs text-[#66736C] mt-2">
            Eliminated dead-head transit across AMC West Zone collection routes.
          </p>
        </div>

        {/* Diesel Fuel Saved */}
        <div className="bg-white border border-[#E3EAE6] p-6 rounded-3xl shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#66736C] uppercase tracking-wider">Diesel Saved</span>
            <Fuel className="w-5 h-5 text-[#E89A27]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-[#17201B] font-mono">{analytics?.fuel_saved_liters ?? 5.1} L</span>
            <span className="text-xs text-[#E89A27] font-bold">Estimated</span>
          </div>
          <p className="text-xs text-[#66736C] mt-2">
            Direct fuel savings from dynamic skipping of sub-threshold bins.
          </p>
        </div>

        {/* CO2e Offset */}
        <div className="bg-white border border-[#E3EAE6] p-6 rounded-3xl shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#66736C] uppercase tracking-wider">CO₂e Avoided</span>
            <Leaf className="w-5 h-5 text-[#0D9488]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-[#17201B] font-mono">{analytics?.co2e_emissions_avoided_kg ?? 12.4} kg</span>
            <span className="text-xs text-[#0D9488] font-bold">Today</span>
          </div>
          <p className="text-xs text-[#66736C] mt-2">
            Calculated at 2.68 kg CO₂ per liter of municipal diesel combustion.
          </p>
        </div>

      </div>

      {/* STREAM RECOVERY BREAKDOWN & DIVERSION TREND */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Stream Breakdown Cards */}
        <div className="lg:col-span-7 bg-white border border-[#E3EAE6] rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#E3EAE6] pb-4">
            <div>
              <h3 className="text-base font-extrabold text-[#17201B]">Ahmedabad Waste Stream Recovery Channels</h3>
              <p className="text-xs text-[#66736C]">Total {totalTons} tonnes collected today with designated circularity pathways</p>
            </div>
            <span className="text-xs font-mono font-bold bg-[#DCFCE7] text-[#0B5D3B] border border-[#BBF7D0] px-3 py-1 rounded-full">
              6 Fractions
            </span>
          </div>

          <div className="space-y-3">
            {streams.map((st, idx) => (
              <div key={idx} className="bg-[#F7FAF8] hover:bg-white p-4 rounded-2xl border border-[#E3EAE6] flex items-center justify-between transition-all shadow-card hover:shadow-card-hover">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                  <div>
                    <h4 className="text-xs font-bold text-[#17201B]">{st.name}</h4>
                    <span className="text-[11px] text-[#66736C] font-mono">Destination: {st.target}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-[#17201B] font-mono">{st.value} {st.unit}</span>
                  <span className="block text-[10px] text-[#66736C] font-semibold">{st.pct}% of stream</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Diversion Trend */}
        <div className="lg:col-span-5 bg-white border border-[#E3EAE6] rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="border-b border-[#E3EAE6] pb-4">
            <h3 className="text-base font-extrabold text-[#17201B]">7-Day Landfill Diversion Trend</h3>
            <p className="text-xs text-[#66736C]">Percentage of total municipal waste successfully recycled</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="diversionGradLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16845B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16845B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F6F3" />
                <XAxis dataKey="day" stroke="#66736C" fontSize={11} />
                <YAxis stroke="#66736C" fontSize={11} unit="%" domain={[50, 75]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E3EAE6', borderRadius: '0.75rem', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                  itemStyle={{ color: '#16845B' }}
                />
                <Area type="monotone" dataKey="diversion" stroke="#16845B" strokeWidth={2.5} fillOpacity={1} fill="url(#diversionGradLight)" name="Diversion %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-4 text-xs text-[#17201B] flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#16845B] shrink-0 mt-0.5" />
            <span>
              <strong>Circularity Milestone:</strong> Ahmedabad West Zone has maintained a &gt;60% diversion rate for 18 consecutive days.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
