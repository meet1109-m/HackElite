import React from 'react';
import { 
  Trash2, 
  AlertTriangle, 
  Truck, 
  Recycle, 
  Clock, 
  TrendingUp, 
  ArrowRight, 
  MapPin, 
  CheckCircle,
  BarChart2,
  Sparkles,
  Zap,
  Activity
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { useWasteData } from '../context/WasteDataContext';
import OverflowCountdownBadge from '../components/Common/OverflowCountdownBadge';

export const CommandCenterPage = ({ onNavigate, onNavigateTab }) => {
  const navigate = onNavigate || onNavigateTab;
  const { bins, vehicles, analytics, setSelectedBin } = useWasteData();

  const criticalBins = bins.filter(b => b.status === 'Critical' || b.status === 'Overflow Risk')
    .sort((a, b) => b.priority_score - a.priority_score);

  const under4hCount = bins.filter(b => b.predicted_overflow_hours <= 4.0).length;

  // 7-day forecast mock data
  const forecastData = [
    { day: 'Mon', actual: 3.8, predicted: 3.9 },
    { day: 'Tue', actual: 4.1, predicted: 4.0 },
    { day: 'Wed', actual: 3.9, predicted: 4.1 },
    { day: 'Thu', actual: 4.3, predicted: 4.2 },
    { day: 'Fri', actual: 4.7, predicted: 4.6 },
    { day: 'Sat', actual: 5.4, predicted: 5.3 },
    { day: 'Sun', actual: null, predicted: 5.8 },
  ];

  // Stream breakdown pie data
  const compositionData = [
    { name: 'Organic (Compost)', value: 43, color: '#10b981' },
    { name: 'Plastic Recyclables', value: 24, color: '#06b6d4' },
    { name: 'Paper & Cardboard', value: 16, color: '#f59e0b' },
    { name: 'Glass & Metal', value: 11, color: '#6366f1' },
    { name: 'Inert / Non-Recyclable', value: 6, color: '#64748b' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white font-mono">Ahmedabad AI Command Center</h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs font-bold">
              LIVE SYSTEM
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Decision support operations across 12 AMC zones • Automated dispatch & circularity tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('routes')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Truck className="w-3.5 h-3.5 text-sky-400" />
            <span>Active Fleet ({vehicles.length})</span>
          </button>
          <button
            onClick={() => onNavigateTab('operations')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 transition-colors"
          >
            <span>Open Live Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 6 Top KPI Cards (Module 31) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Bins</span>
            <Trash2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">120</div>
          <span className="text-[10px] text-slate-400 mt-1 block">1,250 City Scale Equiv</span>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Critical Bins</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-rose-400">{criticalBins.length}</div>
          <span className="text-[10px] text-rose-300/80 mt-1 block">Needs Action</span>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-sky-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Fleet</span>
            <Truck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">{vehicles.length}</div>
          <span className="text-[10px] text-sky-400 mt-1 block">71% Avg Utilization</span>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-teal-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Waste Today</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">4.24 <span className="text-xs text-slate-400 font-normal">t</span></div>
          <span className="text-[10px] text-emerald-400 mt-1 block">2.71 t Recoverable</span>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Diversion Rate</span>
            <Recycle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">63.9%</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Target: &gt;60%</span>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Overflow &lt;4h</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-400">{under4hCount}</div>
          <span className="text-[10px] text-amber-300/80 mt-1 block">Immediate Dispatch</span>
        </div>
      </div>

      {/* Main Grid: Priority Queue & Live Map Quickview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Highest Priority Queue */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Highest Priority Collection Queue
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('bins')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <span>View All 120</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {criticalBins.slice(0, 5).map(bin => (
              <div
                key={bin.id}
                onClick={() => setSelectedBin(bin)}
                className="p-3.5 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-emerald-500/50 rounded-xl cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg font-mono font-bold text-xs ${
                    bin.priority_score >= 88 ? 'bg-rose-950 text-rose-300 border border-rose-700' : 'bg-amber-950 text-amber-300 border border-amber-700'
                  }`}>
                    {bin.bin_code}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{bin.zone}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {bin.waste_stream}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate max-w-[280px] mt-0.5">
                      {bin.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Fill: <strong>{bin.fill_percentage}%</strong> ({bin.estimated_weight_kg}kg)</span>
                    <OverflowCountdownBadge hours={bin.predicted_overflow_hours} text={bin.predicted_overflow_text} size="sm" />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Priority</span>
                    <span className="text-sm font-mono font-extrabold text-emerald-400">{bin.priority_score}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: AI Strategic Recommendations */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              AI Operational Recommendations
            </h3>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                <span>Dispatch Vehicle V-01</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700">Immediate</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Assign <strong>V-01 (Ramesh Patel)</strong> to <strong>AHM-104</strong> and <strong>AHM-118</strong>. Both bins are projected to overflow within 4h 18m.
              </p>
              <button
                onClick={() => onNavigateTab('routes')}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 mt-1"
              >
                <span>Optimize Dispatch Sequence</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-3.5 bg-amber-950/30 border border-amber-800/40 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                <span>Zone C Surge Alert (+82%)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 border border-amber-700">Warning</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Bodakdev & Sindhu Bhavan</strong> generating abnormal packaging volume. Switch frequency from 24h to 12h.
              </p>
            </div>

            <div className="p-3.5 bg-blue-950/30 border border-blue-800/40 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-blue-400">
                <span>Recyclable Stream Purity</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 border border-blue-700">Insight</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                PET bottle recovery purity at <strong>Riverfront Promenade</strong> reached <strong>88.5%</strong> today, enabling direct flaking.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Charts Grid: 7-Day Forecast & Stream Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7-Day Generation Forecast Chart */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-400" /> 7-Day Waste Generation Forecast (Tonnes)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Historical generation vs AI predictive trend</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-300"><span className="w-3 h-3 rounded bg-emerald-500"></span> Actual</span>
              <span className="flex items-center gap-1 text-slate-300"><span className="w-3 h-3 rounded bg-sky-400"></span> Predicted</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" name="Actual (t)" />
                <Area type="monotone" dataKey="predicted" stroke="#38bdf8" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorPred)" name="AI Forecast (t)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stream Composition Donut */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 mb-1">
              <Recycle className="w-4 h-4 text-emerald-400" /> City Waste Stream Composition
            </h3>
            <p className="text-xs text-slate-400 mb-4">Material fractions across active collections</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={compositionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {compositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mt-2">
            {compositionData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="truncate text-[11px]">{item.name}: <strong>{item.value}%</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenterPage;
