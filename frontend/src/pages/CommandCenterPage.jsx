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
  const { bins, vehicles, analytics, openDigitalTwin, showToast } = useWasteData();

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
    { name: 'Organic (Compost)', value: 43, color: '#16845B' },
    { name: 'Plastic Recyclables', value: 24, color: '#2878C8' },
    { name: 'Paper & Cardboard', value: 16, color: '#E89A27' },
    { name: 'Glass & Metal', value: 11, color: '#0D9488' },
    { name: 'Inert / Residue', value: 6, color: '#94A39D' },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#E3EAE6] p-5 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-[#17201B] tracking-tight">Ahmedabad AI Command Center</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#0B5D3B] border border-[#BBF7D0] text-xs font-bold">
              LIVE SYSTEM
            </span>
          </div>
          <p className="text-xs text-[#66736C] mt-1">
            Real-time municipal decision support across 12 AMC zones • Automated dispatch & circularity tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('routes')}
            className="px-4 py-2.5 bg-white hover:bg-[#F1F6F3] text-[#17201B] text-xs font-bold rounded-xl border border-[#E3EAE6] flex items-center gap-2 transition-all shadow-sm"
          >
            <Truck className="w-4 h-4 text-[#2878C8]" />
            <span>Active Fleet ({vehicles.length})</span>
          </button>
          <button
            onClick={() => navigate('operations')}
            className="px-4 py-2.5 bg-[#16845B] hover:bg-[#0B5D3B] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-[#16845B]/20 transition-all"
          >
            <span>Open Live Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6 Top KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-white border border-[#E3EAE6] rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-[#66736C] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Bins</span>
            <Trash2 className="w-4 h-4 text-[#16845B]" />
          </div>
          <div className="text-2xl font-black font-mono text-[#17201B]">120</div>
          <span className="text-[10px] text-[#66736C] mt-1 block font-medium">1,250 City Scale Equiv</span>
        </div>

        <div className="p-4 bg-white border border-[#FECACA] rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-[#D64545] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Critical Bins</span>
            <AlertTriangle className="w-4 h-4 text-[#D64545]" />
          </div>
          <div className="text-2xl font-black font-mono text-[#D64545]">{criticalBins.length}</div>
          <span className="text-[10px] text-[#991B1B] mt-1 block font-semibold">Immediate Action</span>
        </div>

        <div className="p-4 bg-white border border-[#E3EAE6] rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-[#2878C8] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Fleet</span>
            <Truck className="w-4 h-4 text-[#2878C8]" />
          </div>
          <div className="text-2xl font-black font-mono text-[#17201B]">{vehicles.length} Trucks</div>
          <span className="text-[10px] text-[#2878C8] mt-1 block font-semibold">71% Avg Utilization</span>
        </div>

        <div className="p-4 bg-white border border-[#E3EAE6] rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-[#0D9488] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Waste Today</span>
            <TrendingUp className="w-4 h-4 text-[#0D9488]" />
          </div>
          <div className="text-2xl font-black font-mono text-[#17201B]">4.24 <span className="text-xs text-[#66736C] font-normal">t</span></div>
          <span className="text-[10px] text-[#16845B] mt-1 block font-semibold">2.71 t Recoverable</span>
        </div>

        <div className="p-4 bg-white border border-[#BBF7D0] rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-[#16845B] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Diversion Rate</span>
            <Recycle className="w-4 h-4 text-[#16845B]" />
          </div>
          <div className="text-2xl font-black font-mono text-[#16845B]">63.9%</div>
          <span className="text-[10px] text-[#0B5D3B] mt-1 block font-semibold">Target: &gt;60% Met</span>
        </div>

        <div className="p-4 bg-white border border-[#FDE68A] rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-[#E89A27] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Overflow &lt;4h</span>
            <Clock className="w-4 h-4 text-[#E89A27]" />
          </div>
          <div className="text-2xl font-black font-mono text-[#E89A27]">{under4hCount}</div>
          <span className="text-[10px] text-[#92400E] mt-1 block font-semibold">Urgent Corridor</span>
        </div>
      </div>

      {/* Main Grid: Priority Queue & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Highest Priority Queue */}
        <div className="lg:col-span-7 bg-white border border-[#E3EAE6] rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#16845B]" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#17201B]">
                Highest Priority Collection Queue
              </h3>
            </div>
            <button
              onClick={() => navigate('bins')}
              className="text-xs text-[#16845B] hover:text-[#0B5D3B] font-bold flex items-center gap-1"
            >
              <span>View All 120 Bins</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {criticalBins.slice(0, 5).map(bin => (
              <div
                key={bin.id}
                onClick={() => openDigitalTwin(bin)}
                className="p-4 bg-[#F7FAF8] hover:bg-white border border-[#E3EAE6] hover:border-[#16845B] rounded-2xl cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-card hover:shadow-card-hover group"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl font-mono font-black text-xs ${
                    bin.priority_score >= 88 ? 'bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]' : 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]'
                  }`}>
                    {bin.bin_code}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#17201B]">{bin.zone}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-[#E3EAE6] text-[#66736C] font-semibold">
                        {bin.waste_stream}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#66736C] truncate max-w-[280px] mt-0.5">
                      {bin.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-[#66736C] block mb-0.5">Fill: <strong>{bin.fill_percentage}%</strong> ({bin.estimated_weight_kg}kg)</span>
                    <OverflowCountdownBadge hours={bin.predicted_overflow_hours} text={bin.predicted_overflow_text} size="sm" />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#66736C] block">Priority</span>
                    <span className="text-base font-mono font-black text-[#16845B]">{bin.priority_score}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: AI Operational Recommendations */}
        <div className="lg:col-span-5 bg-white border border-[#E3EAE6] rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2878C8]" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#17201B]">
              AI Operational Recommendations
            </h3>
          </div>

          <div className="space-y-3.5">
            <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#0B5D3B]">
                <span>Dispatch Vehicle V-01</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[#BBF7D0] font-bold text-[#16845B]">Immediate</span>
              </div>
              <p className="text-xs text-[#17201B] leading-relaxed">
                Assign <strong>V-01 (Ramesh Patel)</strong> to <strong>AHM-104</strong> and <strong>AHM-118</strong>. Both bins are projected to overflow within 4 hours.
              </p>
              <button
                onClick={() => navigate('routes')}
                className="text-xs text-[#16845B] hover:text-[#0B5D3B] font-extrabold flex items-center gap-1 pt-1"
              >
                <span>Optimize Dispatch Sequence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#92400E]">
                <span>Zone C Surge Alert (+50%)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[#FDE68A] font-bold text-[#E89A27]">Cadence Shift</span>
              </div>
              <p className="text-xs text-[#17201B] leading-relaxed">
                <strong>Sabarmati Riverfront Promenade</strong> generating abnormal volume. Switch frequency from 24h to 12h.
              </p>
              <button
                onClick={() => navigate('analytics')}
                className="text-xs text-[#E89A27] hover:text-[#92400E] font-extrabold flex items-center gap-1 pt-1"
              >
                <span>View Hotspots & Cadence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#1E40AF]">
                <span>Recyclable Stream Purity</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[#BFDBFE] font-bold text-[#2878C8]">High Grade</span>
              </div>
              <p className="text-xs text-[#17201B] leading-relaxed">
                PET bottle recovery purity at <strong>Riverfront Promenade</strong> reached <strong>88.5%</strong> today, enabling direct baling.
              </p>
              <button
                onClick={() => navigate('recycling')}
                className="text-xs text-[#2878C8] hover:text-[#1E40AF] font-extrabold flex items-center gap-1 pt-1"
              >
                <span>Inspect Circularity Metrics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Charts Grid: 7-Day Forecast & Stream Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7-Day Generation Forecast Chart */}
        <div className="lg:col-span-7 bg-white border border-[#E3EAE6] rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#17201B] flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#16845B]" /> 7-Day Waste Generation Forecast (Tonnes)
              </h3>
              <p className="text-xs text-[#66736C] mt-0.5">Historical generation vs AI predictive trend</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-[#17201B]"><span className="w-3 h-3 rounded bg-[#16845B]"></span> Actual</span>
              <span className="flex items-center gap-1.5 font-semibold text-[#66736C]"><span className="w-3 h-3 rounded bg-[#2878C8]"></span> AI Forecast</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActualLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16845B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#16845B" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPredLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2878C8" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2878C8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#66736C" fontSize={11} tickLine={false} />
                <YAxis stroke="#66736C" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E3EAE6', borderRadius: '0.75rem', color: '#17201B', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                />
                <Area type="monotone" dataKey="actual" stroke="#16845B" strokeWidth={2.5} fillOpacity={1} fill="url(#colorActualLight)" name="Actual (t)" />
                <Area type="monotone" dataKey="predicted" stroke="#2878C8" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorPredLight)" name="AI Forecast (t)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stream Composition Donut */}
        <div className="lg:col-span-5 bg-white border border-[#E3EAE6] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#17201B] flex items-center gap-2 mb-1">
              <Recycle className="w-4 h-4 text-[#16845B]" /> Waste Stream Composition
            </h3>
            <p className="text-xs text-[#66736C] mb-4">Material fractions across active Ahmedabad collections</p>
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
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E3EAE6', borderRadius: '0.75rem', color: '#17201B', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-[#17201B] mt-2">
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
