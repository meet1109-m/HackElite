import React, { useState, useMemo } from 'react';
import { useWasteData } from '../context/WasteDataContext';
import OverflowCountdownBadge from '../components/Common/OverflowCountdownBadge';
import ProvenanceBadge from '../components/Common/ProvenanceBadge';
import { Search, Filter, ArrowUpDown, Trash2, Cpu, AlertTriangle, CheckCircle2, ChevronRight, Eye, RefreshCw, BarChart2 } from 'lucide-react';

export default function BinIntelligencePage() {
  const { bins, openDigitalTwin, refreshData, loading } = useWasteData();
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
                              b.id.toLowerCase().includes(searchQuery.toLowerCase());
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
      case 'Critical': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'Overflow Risk': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'High Priority': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'Filling': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Trash2 className="w-8 h-8 text-emerald-400" />
              Smart Bin Intelligence
            </h1>
            <span className="px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              {bins.length} Active Digital Twins
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Real-time telemetry, predictive fill forecasting, and explainable priority scores for all Ahmedabad municipal assets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </button>
          <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${viewMode === 'grid' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${viewMode === 'table' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Table View
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Bin ID (e.g. AHM-104), Zone name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Zone:</span>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 py-2 px-3 rounded-xl focus:outline-none focus:border-emerald-500"
              >
                {zones.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 py-2 px-3 rounded-xl focus:outline-none focus:border-emerald-500"
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Stream:</span>
              <select
                value={selectedStream}
                onChange={(e) => setSelectedStream(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 py-2 px-3 rounded-xl focus:outline-none focus:border-emerald-500"
              >
                {streams.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 py-2 px-3 rounded-xl focus:outline-none focus:border-emerald-500"
              >
                <option value="priority_score">Priority Score</option>
                <option value="fill_percentage">Fill Level (%)</option>
                <option value="predicted_overflow_hours">Overflow Time</option>
                <option value="estimated_weight_kg">Weight (kg)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick stat chips */}
        <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
          <span>Showing <strong className="text-white">{filteredBins.length}</strong> of {bins.length} bins</span>
          <span className="text-slate-600">•</span>
          <span className="text-red-400 font-semibold">{bins.filter(b => b.status === 'Critical').length} Critical</span>
          <span className="text-slate-600">•</span>
          <span className="text-amber-400 font-semibold">{bins.filter(b => b.status === 'Overflow Risk').length} Overflow Risk</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-semibold">{bins.filter(b => b.status === 'Healthy').length} Healthy</span>
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
                className="bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-emerald-950/20 group relative flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base group-hover:text-emerald-400 transition">
                          {bin.bin_code}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(bin.status)}`}>
                          {bin.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{bin.zone}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-400">Priority</div>
                      <div className={`text-xl font-black ${isCritical ? 'text-red-400' : 'text-emerald-400'}`}>
                        {bin.priority_score}
                        <span className="text-xs text-slate-500 font-normal">/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Fill progress bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        Fill Level
                      </span>
                      <span className={bin.fill_percentage > 80 ? 'text-red-400 font-bold' : 'text-slate-200'}>
                        {bin.fill_percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          bin.fill_percentage > 85 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                          bin.fill_percentage > 65 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                          'bg-gradient-to-r from-emerald-500 to-teal-400'
                        }`}
                        style={{ width: `${Math.min(100, bin.fill_percentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Telemetry Metrics */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Weight / Cap</span>
                      <span className="font-semibold text-slate-200">{bin.estimated_weight_kg} kg / {bin.capacity_kg} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Stream</span>
                      <span className="font-semibold text-slate-200">{bin.waste_stream}</span>
                    </div>
                  </div>

                  {/* Overflow badge & Provenance */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Predicted Overflow:</span>
                      <OverflowCountdownBadge hours={bin.predicted_overflow_hours} size="sm" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Data Source:</span>
                      <ProvenanceBadge source={bin.waste_composition?.source || 'AI Estimated'} confidence={bin.waste_composition?.confidence} />
                    </div>
                  </div>
                </div>

                {/* Card Footer CTA */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-semibold group-hover:text-emerald-300">
                  <span className="flex items-center gap-1">
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
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 text-slate-400 uppercase tracking-wider border-b border-slate-800 font-semibold">
                <tr>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => toggleSort('bin_code')}>
                    <div className="flex items-center gap-1">Bin ID <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => toggleSort('zone')}>
                    <div className="flex items-center gap-1">Zone <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => toggleSort('status')}>
                    <div className="flex items-center gap-1">Status <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => toggleSort('fill_percentage')}>
                    <div className="flex items-center gap-1">Fill Level <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="p-4">Weight</th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => toggleSort('predicted_overflow_hours')}>
                    <div className="flex items-center gap-1">Predicted Overflow <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => toggleSort('priority_score')}>
                    <div className="flex items-center gap-1">Priority <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredBins.map(bin => (
                  <tr key={bin.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      {bin.bin_code}
                    </td>
                    <td className="p-4">{bin.zone}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${getStatusColor(bin.status)}`}>
                        {bin.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-400 h-full rounded-full"
                            style={{ width: `${Math.min(100, bin.fill_percentage)}%` }}
                          />
                        </div>
                        <span className="font-semibold text-white">{bin.fill_percentage}%</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono">{bin.estimated_weight_kg} kg</td>
                    <td className="p-4">
                      <OverflowCountdownBadge hours={bin.predicted_overflow_hours} size="sm" />
                    </td>
                    <td className="p-4">
                      <span className={`font-black text-sm ${bin.priority_score >= 80 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {bin.priority_score}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openDigitalTwin(bin)}
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition"
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
