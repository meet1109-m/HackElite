import React, { useState } from 'react';
import { useWasteData } from '../context/WasteDataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Flame, AlertTriangle, TrendingUp, Clock, Sparkles, Filter, ShieldCheck, ChevronRight, HelpCircle } from 'lucide-react';

export default function AnalyticsHotspotsPage() {
  const { zones } = useWasteData();
  const [timeRange, setTimeRange] = useState('7d'); // 'today' | '7d' | '30d'

  // Dynamic Zone Generation vs Baseline comparison dataset based on time range
  const zoneChartData = {
    today: [
      { name: 'Sabarmati', current: 780, baseline: 520, status: 'Hotspot', surge: '+50%' },
      { name: 'Navrangpura', current: 840, baseline: 610, status: 'Hotspot', surge: '+37.7%' },
      { name: 'Maninagar', current: 620, baseline: 580, status: 'Normal', surge: '+6.9%' },
      { name: 'Vastrapur', current: 590, baseline: 550, status: 'Normal', surge: '+7.2%' },
      { name: 'Bodakdev', current: 480, baseline: 510, status: 'Low', surge: '-5.8%' },
      { name: 'Paldi', current: 430, baseline: 470, status: 'Low', surge: '-8.5%' },
    ],
    '7d': [
      { name: 'Sabarmati', current: 5460, baseline: 3640, status: 'Hotspot', surge: '+50%' },
      { name: 'Navrangpura', current: 5880, baseline: 4270, status: 'Hotspot', surge: '+37.7%' },
      { name: 'Maninagar', current: 4340, baseline: 4060, status: 'Normal', surge: '+6.9%' },
      { name: 'Vastrapur', current: 4130, baseline: 3850, status: 'Normal', surge: '+7.2%' },
      { name: 'Bodakdev', current: 3360, baseline: 3570, status: 'Low', surge: '-5.8%' },
      { name: 'Paldi', current: 3010, baseline: 3290, status: 'Low', surge: '-8.5%' },
    ],
    '30d': [
      { name: 'Sabarmati', current: 23400, baseline: 15600, status: 'Hotspot', surge: '+50%' },
      { name: 'Navrangpura', current: 25200, baseline: 18300, status: 'Hotspot', surge: '+37.7%' },
      { name: 'Maninagar', current: 18600, baseline: 17400, status: 'Normal', surge: '+6.9%' },
      { name: 'Vastrapur', current: 17700, baseline: 16500, status: 'Normal', surge: '+7.2%' },
      { name: 'Bodakdev', current: 14400, baseline: 15300, status: 'Low', surge: '-5.8%' },
      { name: 'Paldi', current: 12900, baseline: 14100, status: 'Low', surge: '-8.5%' },
    ]
  };

  const currentChartData = zoneChartData[timeRange] || zoneChartData['7d'];

  // Frequency optimizer recommendations
  const frequencyRecommendations = [
    {
      zone: 'Zone C (Sabarmati Riverfront)',
      currentFreq: 'Every 24 hours',
      recommendedFreq: 'Every 12 hours',
      urgency: 'HIGH',
      reason: 'Generation is +50% above baseline with recurring 4-hour overflow risk in evening promenade peak hours.',
      estimatedSavings: 'Zero overflow spills'
    },
    {
      zone: 'Zone B (Navrangpura Commercial)',
      currentFreq: 'Every 24 hours',
      recommendedFreq: 'Every 16 hours',
      urgency: 'MEDIUM',
      reason: 'Commercial packaging surge on weekdays drives rapid plastic and carton accumulation.',
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
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#17201B] flex items-center gap-2">
              <Flame className="w-7 h-7 text-[#E89A27]" />
              Hotspots, Anomaly & Frequency Intelligence
            </h1>
            <span className="px-3 py-1 text-xs font-bold bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] rounded-full">
              Ahmedabad Heatmap Analytics
            </span>
          </div>
          <p className="text-[#66736C] text-xs sm:text-sm mt-1">
            Detect generation anomalies, evaluate causal hypotheses, and dynamically adjust collection cadences across Ahmedabad.
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex bg-[#F1F6F3] p-1 rounded-2xl border border-[#E3EAE6] shadow-sm">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${timeRange === 'today' ? 'bg-white text-[#17201B] shadow-sm font-extrabold' : 'text-[#66736C] hover:text-[#17201B]'}`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${timeRange === '7d' ? 'bg-white text-[#17201B] shadow-sm font-extrabold' : 'text-[#66736C] hover:text-[#17201B]'}`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${timeRange === '30d' ? 'bg-white text-[#17201B] shadow-sm font-extrabold' : 'text-[#66736C] hover:text-[#17201B]'}`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* ANOMALY DETECTION SECTION */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-[#17201B] flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#D64545]" />
          Active Waste Generation Anomalies
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {anomalies.map(anom => (
            <div key={anom.id} className="bg-white border border-[#FECACA] rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] px-2.5 py-0.5 rounded-full">
                    {anom.type} • {anom.severity}
                  </span>
                  <h3 className="text-base font-black text-[#17201B] mt-1.5">{anom.zone}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-[#D64545] font-mono">{anom.delta}</span>
                  <span className="block text-[10px] text-[#66736C] font-semibold">above baseline</span>
                </div>
              </div>

              {/* Baseline vs Current metrics */}
              <div className="grid grid-cols-2 gap-3 bg-[#F7FAF8] p-3 rounded-2xl border border-[#E3EAE6] text-xs">
                <div>
                  <span className="text-[#66736C] block text-[10px] uppercase font-bold">Historical Baseline</span>
                  <span className="font-mono font-bold text-[#17201B]">{anom.baseline}</span>
                </div>
                <div>
                  <span className="text-[#66736C] block text-[10px] uppercase font-bold">Observed Current</span>
                  <span className="font-mono font-black text-[#D64545]">{anom.current}</span>
                </div>
              </div>

              {/* Contributing Factors / Hypotheses */}
              <div className="space-y-1.5 pt-2">
                <span className="text-xs font-bold text-[#17201B] flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#E89A27]" />
                  Plausible Contributing Factors (Hypotheses):
                </span>
                <ul className="space-y-1 text-xs text-[#66736C] pl-5 list-disc">
                  {anom.hypotheses.map((h, idx) => (
                    <li key={idx} className="leading-relaxed">{h}</li>
                  ))}
                </ul>
              </div>

              <div className="text-[11px] text-[#94A39D] italic pt-1 border-t border-[#E3EAE6]">
                * Note: Factors are AI-generated correlative hypotheses; verification recommended via field supervisors.
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ZONE GENERATION VS BASELINE CHART */}
      <div className="bg-white border border-[#E3EAE6] rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E3EAE6] pb-4">
          <div>
            <h3 className="text-base font-extrabold text-[#17201B]">Ahmedabad Zonal Waste Volume vs Historical Baseline</h3>
            <p className="text-xs text-[#66736C]">Comparing current generation ({timeRange === 'today' ? 'kg/day' : 'total kg'}) against baseline</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-[#16845B] font-bold">
              <span className="w-3 h-3 rounded bg-[#16845B]"></span> Observed Generation
            </span>
            <span className="flex items-center gap-1.5 text-[#66736C] font-semibold">
              <span className="w-3 h-3 rounded bg-[#CBD8D2]"></span> Historical Baseline
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={currentChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F6F3" />
              <XAxis dataKey="name" stroke="#66736C" fontSize={11} />
              <YAxis stroke="#66736C" fontSize={11} unit="kg" />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E3EAE6', borderRadius: '0.75rem', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                itemStyle={{ color: '#17201B' }}
              />
              <Bar dataKey="current" fill="#16845B" radius={[6, 6, 0, 0]} name="Observed (kg)" />
              <Bar dataKey="baseline" fill="#CBD8D2" radius={[6, 6, 0, 0]} name="Baseline (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* COLLECTION FREQUENCY OPTIMIZER */}
      <div className="bg-white border border-[#E3EAE6] rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[#E3EAE6] pb-4">
          <div>
            <h3 className="text-base font-extrabold text-[#17201B] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#16845B]" />
              AI Collection Frequency Optimizer
            </h3>
            <p className="text-xs text-[#66736C]">Cadence adjustment recommendations to eliminate overflow while minimizing fuel burn</p>
          </div>
          <span className="text-xs font-mono font-bold bg-[#DCFCE7] text-[#0B5D3B] border border-[#BBF7D0] px-3 py-1 rounded-full">
            Autonomous Cadence Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {frequencyRecommendations.map((rec, idx) => (
            <div key={idx} className="bg-[#F7FAF8] border border-[#E3EAE6] p-5 rounded-2xl space-y-3 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-extrabold text-[#17201B] text-sm">{rec.zone}</h4>
                  <div className="flex items-center gap-2 text-xs text-[#66736C] mt-1">
                    <span>Current: <strong className="text-[#17201B]">{rec.currentFreq}</strong></span>
                    <span>→</span>
                    <span>Target: <strong className="text-[#16845B]">{rec.recommendedFreq}</strong></span>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                  rec.urgency === 'HIGH' ? 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]' :
                  rec.urgency === 'MEDIUM' ? 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]' :
                  'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]'
                }`}>
                  {rec.urgency}
                </span>
              </div>

              <p className="text-xs text-[#66736C] leading-relaxed bg-white p-3 rounded-xl border border-[#E3EAE6]">
                {rec.reason}
              </p>

              <div className="flex items-center justify-between text-[11px] text-[#16845B] font-bold pt-1">
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
