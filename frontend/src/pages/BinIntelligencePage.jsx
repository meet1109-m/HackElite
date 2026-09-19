import React, { useState, useMemo } from 'react';
import { useWasteData } from '../context/WasteDataContext';
import OverflowCountdownBadge from '../components/Common/OverflowCountdownBadge';
import ProvenanceBadge from '../components/Common/ProvenanceBadge';
import { Search, Filter, ArrowUpDown, Trash2, Cpu, AlertTriangle, CheckCircle2, ChevronRight, Eye, RefreshCw, BarChart2 } from 'lucide-react';

export default function BinIntelligencePage() {
  const { bins, openDigitalTwin, refreshData, loading, showToast } = useWasteData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedStream, setSelectedStream] = useState('All');
  const [sortBy, setSortBy] = useState('priority_score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Extract unique zones and streams for filters
  const zones = useMemo(() => ['All', ...new Set(bins.map(b => b.zone))].sort(), [bins]);
  const streams = useMemo(() => ['All', ...new Set(bins.map(b => b.waste_stream))].sort(), [bins]);
  const statuses = ['All', 'Critical', 'Overflow Risk', 'High Priority', 'Filling', 'Healthy'];

  const filteredBins = useMemo(() => {
    return bins
      .filter(b => {
        const matchesSearch = b.bin_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              b.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              b.address.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesZone = selectedZone === 'All' || b.zone === selectedZone;
        const matchesStatus = selectedStatus === 'All' || b.status === selectedStatus;
        const matchesStream = selectedStream === 'All' || b.waste_stream === selectedStream;
        return matchesSearch && matchesZone && matchesStatus && matchesStream;
      })
      .sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        if (typeof valA === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [bins, searchQuery, selectedZone, selectedStatus, selectedStream, sortBy, sortOrder]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Critical':
      case 'Overflow Risk':
        return 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]';
      case 'High Priority':
        return 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]';
      case 'Filling':
        return 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]';
      default:
        return 'bg-[#DCFCE7] text-[#0B5D3B] border-[#BBF7D0]';
    }
  };

  const handleRefresh = async () => {
    await refreshData();
    showToast('✓ Telemetry and digital twins refreshed with latest sensor readings.', 'success');
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#17201B] flex items-center gap-2">
              <Trash2 className="w-7 h-7 text-[#16845B]" />
              Smart Bin Intelligence
            </h1>
            <span className="px-3 py-1 text-xs font-bold bg-[#DCFCE7] text-[#0B5D3B] border border-[#BBF7D0] rounded-full">
              {bins.length} Active Digital Twins
            </span>
          </div>
          <p className="text-[#66736C] text-xs sm:text-sm mt-1">
            Real-time telemetry, predictive fill forecasting, and explainable priority scores for all Ahmedabad municipal assets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#F1F6F3] text-[#17201B] text-xs font-bold rounded-xl border border-[#E3EAE6] transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </button>
          <div className="bg-[#F1F6F3] p-1 rounded-xl border border-[#E3EAE6] flex shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${viewMode === 'grid' ? 'bg-white text-[#17201B] shadow-sm font-extrabold' : 'text-[#66736C] hover:text-[#17201B]'}`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${viewMode === 'table' ? 'bg-white text-[#17201B] shadow-sm font-extrabold' : 'text-[#66736C] hover:text-[#17201B]'}`}
            >
              Table View
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-white border border-[#E3EAE6] p-5 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#66736C]" />
            <input
              type="text"
              placeholder="Search by Bin ID (e.g. AHM-104), Zone, or Location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F7FAF8] border border-[#E3EAE6] rounded-xl text-xs text-[#17201B] placeholder-[#94A39D] focus:outline-none focus:border-[#16845B] transition shadow-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#66736C] font-semibold">Zone:</span>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="bg-[#F7FAF8] border border-[#E3EAE6] text-xs text-[#17201B] font-medium py-2 px-3 rounded-xl focus:outline-none focus:border-[#16845B]"
              >
                {zones.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#66736C] font-semibold">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-[#F7FAF8] border border-[#E3EAE6] text-xs text-[#17201B] font-medium py-2 px-3 rounded-xl focus:outline-none focus:border-[#16845B]"
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#66736C] font-semibold">Stream:</span>
              <select
                value={selectedStream}
                onChange={(e) => setSelectedStream(e.target.value)}
                className="bg-[#F7FAF8] border border-[#E3EAE6] text-xs text-[#17201B] font-medium py-2 px-3 rounded-xl focus:outline-none focus:border-[#16845B]"
              >
                {streams.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#66736C] font-semibold">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#F7FAF8] border border-[#E3EAE6] text-xs text-[#17201B] font-medium py-2 px-3 rounded-xl focus:outline-none focus:border-[#16845B]"
              >
                <option value="priority_score">Priority Score</option>
                <option value="fill_percentage">Fill Level (%)</option>
                <option value="predicted_overflow_hours">Overflow Countdown</option>
                <option value="estimated_weight_kg">Weight (kg)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick stat chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#66736C] pt-3 border-t border-[#E3EAE6]">
          <span>Showing <strong className="text-[#17201B]">{filteredBins.length}</strong> of {bins.length} bins</span>
          <span>•</span>
          <span className="text-[#D64545] font-bold">{bins.filter(b => b.status === 'Critical' || b.status === 'Overflow Risk').length} Critical</span>
          <span>•</span>
          <span className="text-[#E89A27] font-bold">{bins.filter(b => b.status === 'High Priority').length} High Priority</span>
          <span>•</span>
          <span className="text-[#16845B] font-bold">{bins.filter(b => b.status === 'Healthy').length} Healthy</span>
        </div>
      </div>

      {/* Grid Mode */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBins.map(bin => {
            const isCritical = bin.priority_score >= 80;
            return (
              <div
                key={bin.id}
                onClick={() => openDigitalTwin(bin)}
                className="bg-white border border-[#E3EAE6] hover:border-[#16845B] rounded-3xl p-6 cursor-pointer transition-all duration-300 shadow-card hover:shadow-card-hover group relative flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-[#17201B] text-base group-hover:text-[#16845B] transition">
                          {bin.bin_code}
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(bin.status)}`}>
                          {bin.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#66736C] mt-0.5">{bin.zone}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-[#66736C] uppercase tracking-wider font-bold">Priority</div>
                      <div className={`text-xl font-black font-mono ${isCritical ? 'text-[#D64545]' : 'text-[#16845B]'}`}>
                        {bin.priority_score}
                        <span className="text-xs text-[#66736C] font-normal">/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Fill progress bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#17201B] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#16845B]"></span>
                        Fill Level
                      </span>
                      <span className={bin.fill_percentage >= 80 ? 'text-[#D64545] font-black' : 'text-[#17201B] font-bold'}>
                        {bin.fill_percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-[#E3EAE6] rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          bin.fill_percentage >= 80 ? 'bg-[#D64545]' :
                          bin.fill_percentage >= 60 ? 'bg-[#E89A27]' :
                          'bg-[#16845B]'
                        }`}
                        style={{ width: `${Math.min(100, bin.fill_percentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Telemetry Metrics */}
                  <div className="grid grid-cols-2 gap-2 bg-[#F7FAF8] p-3 rounded-2xl border border-[#E3EAE6] mb-3 text-xs">
                    <div>
                      <span className="text-[#66736C] block text-[10px] uppercase font-bold tracking-wider">Weight / Cap</span>
                      <span className="font-bold text-[#17201B] font-mono">{bin.estimated_weight_kg} kg / {bin.capacity_kg} kg</span>
                    </div>
                    <div>
                      <span className="text-[#66736C] block text-[10px] uppercase font-bold tracking-wider">Stream</span>
                      <span className="font-semibold text-[#17201B] truncate block">{bin.waste_stream}</span>
                    </div>
                  </div>

                  {/* Overflow badge & Provenance */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#66736C] font-medium">Overflow In:</span>
                      <OverflowCountdownBadge hours={bin.predicted_overflow_hours} text={bin.predicted_overflow_text} size="sm" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#66736C] font-medium">Source:</span>
                      <ProvenanceBadge source={bin.composition?.source || 'AI Estimated'} confidence={bin.composition?.confidence} />
                    </div>
                  </div>
                </div>

                {/* Card Footer CTA */}
                <div className="pt-3 border-t border-[#E3EAE6] flex items-center justify-between text-xs text-[#16845B] font-extrabold group-hover:text-[#0B5D3B]">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    Open Digital Twin
                  </span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table Mode */
        <div className="bg-white border border-[#E3EAE6] rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7FAF8] text-[#66736C] uppercase tracking-wider border-b border-[#E3EAE6] font-bold">
                <tr>
                  <th className="p-4 cursor-pointer hover:text-[#17201B]" onClick={() => toggleSort('bin_code')}>
                    <div className="flex items-center gap-1">Bin ID <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-[#17201B]" onClick={() => toggleSort('zone')}>
                    <div className="flex items-center gap-1">Zone <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-[#17201B]" onClick={() => toggleSort('status')}>
                    <div className="flex items-center gap-1">Status <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-[#17201B]" onClick={() => toggleSort('fill_percentage')}>
                    <div className="flex items-center gap-1">Fill Level <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="p-4">Weight</th>
                  <th className="p-4 cursor-pointer hover:text-[#17201B]" onClick={() => toggleSort('predicted_overflow_hours')}>
                    <div className="flex items-center gap-1">Predicted Overflow <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-[#17201B]" onClick={() => toggleSort('priority_score')}>
                    <div className="flex items-center gap-1">Priority <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EAE6] text-[#17201B]">
                {filteredBins.map(bin => (
                  <tr key={bin.id} className="hover:bg-[#F0FDF4] transition">
                    <td className="p-4 font-mono font-bold text-[#17201B] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#16845B]"></span>
                      {bin.bin_code}
                    </td>
                    <td className="p-4 font-medium">{bin.zone}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${getStatusColor(bin.status)}`}>
                        {bin.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-[#E3EAE6] rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#16845B] h-full rounded-full"
                            style={{ width: `${Math.min(100, bin.fill_percentage)}%` }}
                          />
                        </div>
                        <span className="font-bold font-mono">{bin.fill_percentage}%</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-medium">{bin.estimated_weight_kg} kg</td>
                    <td className="p-4">
                      <OverflowCountdownBadge hours={bin.predicted_overflow_hours} text={bin.predicted_overflow_text} size="sm" />
                    </td>
                    <td className="p-4">
                      <span className={`font-black font-mono text-sm ${bin.priority_score >= 80 ? 'text-[#D64545]' : 'text-[#16845B]'}`}>
                        {bin.priority_score}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openDigitalTwin(bin)}
                        className="px-3.5 py-1.5 bg-[#DCFCE7] hover:bg-[#BBF7D0] text-[#0B5D3B] border border-[#BBF7D0] rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        Inspect Twin
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
