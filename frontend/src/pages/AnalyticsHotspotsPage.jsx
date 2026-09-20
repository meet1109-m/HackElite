import React, { useState } from 'react';
import { useWasteData } from '../context/WasteDataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Flame, AlertTriangle, TrendingUp, Clock, Sparkles, Filter, ShieldCheck, ChevronRight, HelpCircle } from 'lucide-react';

export default function AnalyticsHotspotsPage() {
  const { zones, hotspots, anomalies: backendAnomalies } = useWasteData();
  const [timeRange, setTimeRange] = useState('7d'); // 'today' | '7d' | '30d'

  // Dynamic Zone Generation vs Baseline comparison dataset based on live hotspots or zones
  const mult = timeRange === 'today' ? 1 : (timeRange === '7d' ? 7 : 30);
  const dataSource = (hotspots && hotspots.length > 0) ? hotspots : (zones || []);

  const currentChartData = dataSource.map(z => {
    const name = z.zone_name || z.name || 'Zone';
    const current = Math.round((z.current_generation_kg || z.waste_generation || 750) * mult);
    const baseline = Math.round((z.baseline_generation_kg || z.baseline_generation || 750) * mult);
    const diff = current - baseline;
    const surgePct = Math.round((diff / Math.max(1, baseline)) * 100);
    const surge = `${surgePct >= 0 ? '+' : ''}${surgePct}%`;
    const status = surgePct >= 40 ? 'Hotspot' : (surgePct <= -5 ? 'Low' : 'Normal');
    return { name, current, baseline, status, surge };
  }).sort((a, b) => b.current - a.current);

  // Frequency optimizer recommendations dynamically generated from live zone surge metrics
  const dynamicFrequencyRecs = dataSource.map(z => {
    const name = z.zone_name || z.name || 'Zone';
    const current = z.current_generation_kg || z.waste_generation || 750;
    const baseline = z.baseline_generation_kg || z.baseline_generation || 750;
    const surgePct = Math.round(((current - baseline) / Math.max(1, baseline)) * 100);

    if (surgePct >= 40) {
      return {
        zone: `${name} (${surgePct >= 70 ? 'Zone E' : 'High Surge'})`,
        currentFreq: 'Every 24 hours',
        recommendedFreq: 'Every 12 hours',
        urgency: 'HIGH',
        reason: `Generation is +${surgePct}% above baseline with recurring overflow risk along commercial dining corridor.`,
        estimatedSavings: 'Zero overflow spills & odor mitigation'
      };
    } else if (surgePct >= 15) {
      return {
        zone: `${name} (Commercial Corridor)`,
        currentFreq: 'Every 24 hours',
        recommendedFreq: 'Every 16 hours',
        urgency: 'MEDIUM',
        reason: `Commercial packaging and transit hub surge (+${surgePct}%) drives rapid waste accumulation.`,
        estimatedSavings: 'Prevents midday bin overflow'
      };
    } else if (surgePct <= 5) {
      return {
        zone: `${name} (West)`,
        currentFreq: 'Every 24 hours',
        recommendedFreq: 'Every 36 hours',
        urgency: 'OPTIMIZE',
        reason: 'Generation is stable at baseline with high segregation compliance and low fill velocity.',
        estimatedSavings: 'Saves 11.5 km vehicle transit/week'
      };
    }
    return null;
  }).filter(Boolean);

  const frequencyRecommendations = dynamicFrequencyRecs.length >= 2 ? dynamicFrequencyRecs.slice(0, 4) : [
    {
      zone: 'Zone E (Bodakdev Commercial Corridor)',
      currentFreq: 'Every 24 hours',
      recommendedFreq: 'Every 12 hours',
      urgency: 'HIGH',
      reason: 'Generation is +82% above baseline with recurring overflow risk along Sindhu Bhavan dining corridor.',
      estimatedSavings: 'Zero overflow spills & odor mitigation'
    },
    {
      zone: 'Zone SG (SG Highway Corridor)',
      currentFreq: 'Every 24 hours',
      recommendedFreq: 'Every 16 hours',
      urgency: 'MEDIUM',
      reason: 'IT park cafeterias and banquet halls generate +31.8% surge during weekday evening peaks.',
      estimatedSavings: 'Prevents midday bin overflow'
    },
    {
      zone: 'Zone B (Navrangpura Commercial)',
      currentFreq: 'Every 24 hours',
      recommendedFreq: 'Every 18 hours',
      urgency: 'MEDIUM',
      reason: 'Commercial packaging and university hub surge (+22.7%) drives rapid dry recyclable accumulation.',
      estimatedSavings: 'Maintains recyclable stream purity'
    },
    {
      zone: 'Zone G (Paldi West)',
      currentFreq: 'Every 24 hours',
      recommendedFreq: 'Every 36 hours',
      urgency: 'OPTIMIZE',
      reason: 'Generation is stable at baseline with high segregation compliance and low fill velocity.',
      estimatedSavings: 'Saves 11.5 km vehicle transit/week'
    }
  ];

  const anomalies = (backendAnomalies && backendAnomalies.length > 0)
    ? backendAnomalies.map((a, idx) => ({
        id: `ANOM-0${idx + 1}`,
        zone: `${a.zone_name} (Zone)`,
        type: a.increase_pct >= 50 ? 'Severe Generation Surge' : 'Generation Surge',
        delta: `+${a.increase_pct}%`,
        baseline: `${Math.round(a.baseline_generation_kg)} kg/day`,
        current: `${Math.round(a.current_generation_kg)} kg/day`,
        severity: a.severity || (a.increase_pct >= 50 ? 'Critical' : 'Warning'),
        hypotheses: a.hypotheses || [
          'Commercial dining and restaurant waste surge along Sindhu Bhavan Road.',
          'High packaging waste from quick-commerce fulfillment hubs.'
        ]
      }))
    : [
        {
          id: 'ANOM-01',
          zone: 'Bodakdev Sindhu Bhavan (Zone E)',
          type: 'Critical Generation Surge',
          delta: '+82.0%',
          baseline: '900 kg/day',
          current: '1,638 kg/day',
          severity: 'Critical',
          hypotheses: [
            'Commercial dining and restaurant waste surge along Sindhu Bhavan Road / Judges Bungalow',
            'High packaging waste from quick-commerce fulfillment hubs',
            'Corporate park bulk disposal and event catering waste'
          ]
        },
        {
          id: 'ANOM-02',
          zone: 'SG Highway Corridor',
          type: 'Commercial Packaging Surge',
          delta: '+31.8%',
          baseline: '1,100 kg/day',
          current: '1,450 kg/day',
          severity: 'Warning',
          hypotheses: [
            'Weekend transit and IT corridor cafeteria bulk waste surge',
            'Hospitality sector and banquet hall wedding event concentration',
            'Automobile showroom and dealership promotional events'
          ]
        },
        {
          id: 'ANOM-03',
          zone: 'Navrangpura CG Road (Zone B)',
          type: 'Plastic Packaging Spike',
          delta: '+22.7%',
          baseline: '750 kg/day',
          current: '920 kg/day',
          severity: 'Warning',
          hypotheses: [
            'College festival or university youth convention at Gujarat University / LD Engineering',
            'Commercial retail unboxing hours (14:00 - 18:00)',
            'Delivery hub consolidated packaging disposal'
          ]
        }
      ];

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto bg-pattern-analytics min-h-full">
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
