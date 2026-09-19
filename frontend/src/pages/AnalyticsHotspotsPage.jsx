import React, { useState } from 'react';
import { useWasteData } from '../context/WasteDataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Flame, AlertTriangle, TrendingUp, Clock, Sparkles, Filter, ShieldCheck, ChevronRight, HelpCircle } from 'lucide-react';

export default function AnalyticsHotspotsPage() {
  const { zones } = useWasteData();
  const [timeRange, setTimeRange] = useState('7d'); // 'today' | '7d' | '30d'

  // Zone Generation vs Baseline comparison dataset
  const zoneChartData = [
    { name: 'Sabarmati', current: 780, baseline: 520, status: 'Hotspot', surge: '+50%' },
    { name: 'Navrangpura', current: 840, baseline: 610, status: 'Hotspot', surge: '+37.7%' },
    { name: 'Maninagar', current: 620, baseline: 580, status: 'Normal', surge: '+6.9%' },
    { name: 'Vastrapur', current: 590, baseline: 550, status: 'Normal', surge: '+7.2%' },
    { name: 'Bodakdev', current: 480, baseline: 510, status: 'Low', surge: '-5.8%' },
    { name: 'Prahlad Nagar', current: 510, baseline: 490, status: 'Normal', surge: '+4.1%' },
    { name: 'Paldi', current: 430, baseline: 470, status: 'Low', surge: '-8.5%' },
    { name: 'Satellite', current: 530, baseline: 520, status: 'Normal', surge: '+1.9%' },
  ];

  // Frequency optimizer recommendations
  const frequencyRecommendations = [
    {
      zone: 'Zone C (Sabarmati Riverfront)',
      currentFreq: 'Every 24 hours',
      recommendedFreq: 'Every 12 hours',
      urgency: 'HIGH',
      reason: 'Generation is +50% above baseline with recurring 4-hour overflow risk in evening peak hours.',
      estimatedSavings: 'Zero overflow spills'
    },
    {
      zone: 'Zone B (Navrangpura Commercial)',
      currentFreq: 'Every 24 hours',
      recommendedFreq: 'Every 16 hours',
      urgency: 'MEDIUM',
      reason: 'Commercial packaging surge on weekdays drives fast plastic accumulation.',
      estimatedSavings: 'Prevents midday overflow'
    },
    {
      zone: 'Zone E (Bodakdev Residential)',
      currentFreq: 'Every 24 hours',
      recommendedFreq: 'Every 36 hours',
      urgency: 'OPTIMIZE',
      reason: 'Average bin fill consistently remains below 62% at 24h marks.',
      estimatedSavings: 'Saves 14.2 km vehicle transit/week'
    },
    {
      zone: 'Zone G (Paldi West)',
      currentFreq: 'Every 24 hours',
      recommendedFreq: 'Every 36 hours',
      urgency: 'OPTIMIZE',
      reason: 'Generation is 8.5% below baseline with high segregation compliance.',
      estimatedSavings: 'Saves 11.5 km vehicle transit/week'
    }
  ];

  const anomalies = [
    {
      id: 'ANOM-01',
      zone: 'Sabarmati Riverfront (Zone C)',
      type: 'Generation Surge',
      delta: '+50.0%',
      baseline: '520 kg/day',
      current: '780 kg/day',
      severity: 'Critical',
      hypotheses: [
        'Evening food festival / riverfront walkway weekend influx',
        'Seasonal tourism cluster near Atal Foot Bridge',
        'Commercial vendor packaging disposal surge'
      ]
    },
    {
      id: 'ANOM-02',
      zone: 'Navrangpura CG Road (Zone B)',
      type: 'Plastic Packaging Spike',
      delta: '+37.7%',
      baseline: '610 kg/day',
      current: '840 kg/day',
      severity: 'Warning',
      hypotheses: [
        'Commercial retail unboxing hours (14:00 - 18:00)',
        'Delivery hub consolidated packaging disposal'
      ]
    }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Flame className="w-8 h-8 text-amber-400" />
              Hotspots, Anomaly & Frequency Intelligence
            </h1>
            <span className="px-3 py-1 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
              Ahmedabad City-Wide Heatmap Engine
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Detect generation anomalies, evaluate non-prescriptive causal hypotheses, and dynamically adjust collection cadences.
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${timeRange === 'today' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${timeRange === '7d' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${timeRange === '30d' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* ANOMALY DETECTION SECTION */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Active Waste Generation Anomalies
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {anomalies.map(anom => (
            <div key={anom.id} className="bg-slate-900/80 border border-red-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-4 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40 px-2.5 py-0.5 rounded-full">
                    {anom.type} • {anom.severity}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5">{anom.zone}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-red-400 font-mono">{anom.delta}</span>
                  <span className="block text-[10px] text-slate-400">above baseline</span>
                </div>
              </div>

              {/* Baseline vs Current metrics */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Historical Baseline</span>
                  <span className="font-mono font-semibold text-slate-300">{anom.baseline}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Observed Current</span>
                  <span className="font-mono font-bold text-red-400">{anom.current}</span>
                </div>
              </div>

              {/* Contributing Factors / Hypotheses */}
              <div className="space-y-1.5 pt-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  Plausible Contributing Factors (Hypotheses):
                </span>
                <ul className="space-y-1 text-xs text-slate-400 pl-5 list-disc">
                  {anom.hypotheses.map((h, idx) => (
                    <li key={idx} className="leading-relaxed">{h}</li>
                  ))}
                </ul>
              </div>

              <div className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-800/80">
                * Note: Factors are AI-generated correlative hypotheses; verification recommended via field supervisors.
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ZONE GENERATION VS BASELINE CHART */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white">Ahmedabad Zonal Waste Volume vs Historical Baseline</h3>
            <p className="text-xs text-slate-400">Comparing current telemetry generation (kg/day) against standard expected baseline</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-3 h-3 rounded bg-emerald-400"></span> Current Generation
            </span>
            <span className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <span className="w-3 h-3 rounded bg-slate-600"></span> Historical Baseline
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={zoneChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} unit="kg" />
              <Tooltip
                contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="current" fill="#10b981" radius={[4, 4, 0, 0]} name="Current (kg)" />
              <Bar dataKey="baseline" fill="#475569" radius={[4, 4, 0, 0]} name="Baseline (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* COLLECTION FREQUENCY OPTIMIZER */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              AI Collection Frequency Optimizer
            </h3>
            <p className="text-xs text-slate-400">Dynamic cadence adjustment recommendations to eliminate overflow while minimizing fuel burn</p>
          </div>
          <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">
            Autonomous Cadence Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {frequencyRecommendations.map((rec, idx) => (
            <div key={idx} className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{rec.zone}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>Current: <strong className="text-slate-300">{rec.currentFreq}</strong></span>
                    <span>→</span>
                    <span>AI Target: <strong className="text-emerald-400">{rec.recommendedFreq}</strong></span>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                  rec.urgency === 'HIGH' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                  rec.urgency === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                  'bg-blue-500/20 text-blue-400 border-blue-500/40'
                }`}>
                  {rec.urgency}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                {rec.reason}
              </p>

              <div className="flex items-center justify-between text-[11px] text-emerald-400 font-semibold pt-1">
                <span>Expected Impact: {rec.estimatedSavings}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
