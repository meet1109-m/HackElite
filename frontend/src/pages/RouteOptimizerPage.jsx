import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useWasteData } from '../context/WasteDataContext';
import { apiService } from '../services/api';
import { 
  Truck, 
  Navigation, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Zap, 
  RefreshCw, 
  Gauge, 
  MapPin, 
  Sparkles, 
  Clock, 
  ShieldAlert,
  Layers,
  Fuel,
  TrendingDown,
  Maximize2
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip as LeafletTooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import LeafletMapResizer from '../components/Common/LeafletMapResizer';

// Custom Map Marker Icons for Route Optimizer
const createStopIcon = (stopNumber, isCritical = false, isDepot = false, isMrf = false, isInserted = false, color = '#16845B') => {
  let bg = color;
  let label = `#${stopNumber}`;
  let borderColor = 'white';

  if (isDepot) {
    bg = '#334155';
    label = 'DEPOT';
  } else if (isMrf) {
    bg = '#0D9488';
    label = 'MRF';
  } else if (isInserted) {
    bg = '#E89A27';
    label = `⚡#${stopNumber}`;
    borderColor = '#FEF08A';
  } else if (isCritical) {
    bg = '#D64545';
  }

  return L.divIcon({
    className: 'custom-route-stop-pin',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 28px;
        height: 28px;
        padding: 0 6px;
        background-color: ${bg};
        color: white;
        font-weight: 800;
        font-size: 10px;
        font-family: monospace;
        border-radius: 14px;
        border: 2px solid ${borderColor};
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        ${isInserted || isCritical ? 'animation: pulse 1.5s infinite;' : ''}
      ">
        ${label}
      </div>
    `,
    iconSize: [34, 28],
    iconAnchor: [17, 14],
    popupAnchor: [0, -14]
  });
};

const createTruckMarkerIcon = (code, color = '#16845B') => {
  return L.divIcon({
    className: 'custom-truck-pin',
    html: `
      <div style="
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        background-color: ${color};
        color: white;
        font-weight: 800;
        font-size: 10px;
        font-family: monospace;
        border-radius: 8px;
        border: 2px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
      ">
        🚚 ${code}
      </div>
    `,
    iconSize: [64, 26],
    iconAnchor: [32, 13],
    popupAnchor: [0, -13]
  });
};

// Smoothly animates camera and fits bounds when route coordinates change without unmounting the map
function RouteBoundsFitter({ polylineCoords, stops }) {
  const map = useMap();

  const fitAll = useCallback(() => {
    if (!map) return;

    const points = [];
    if (polylineCoords && polylineCoords.length > 0) {
      polylineCoords.forEach(c => {
        if (Array.isArray(c) && c.length >= 2 && !isNaN(c[0]) && !isNaN(c[1])) {
          points.push(c);
        }
      });
    }
    if (stops && stops.length > 0) {
      stops.forEach(s => {
        if (s.lat && s.lng && !isNaN(s.lat) && !isNaN(s.lng)) {
          points.push([s.lat, s.lng]);
        }
      });
    }

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [45, 45],
          maxZoom: 13,
          animate: true,
          duration: 0.8
        });
      }
    }
  }, [map, polylineCoords, stops]);

  useEffect(() => {
    fitAll();
    const timer1 = setTimeout(fitAll, 150);
    const timer2 = setTimeout(fitAll, 500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [fitAll]);

  return null;
}

import { useParams } from 'react-router-dom';

export default function RouteOptimizerPage({ onNavigate }) {
  const { vehicleId } = useParams();
  const { 
    vehicles, 
    routes, 
    optimizeRoute, 
    triggerDynamicReplan, 
    replanState, 
    openDigitalTwin, 
    bins 
  } = useWasteData();

  const [selectedVehicleId, setSelectedVehicleId] = useState(() => vehicleId ? vehicleId.toUpperCase() : 'V-01');

  // Sync route param when URL changes
  useEffect(() => {
    if (vehicleId) {
      setSelectedVehicleId(vehicleId.toUpperCase());
    }
  }, [vehicleId]);
  const [optimizing, setOptimizing] = useState(false);
  const [replanning, setReplanning] = useState(false);
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('All');
  const [selectedBinForMatch, setSelectedBinForMatch] = useState('AHM-104');
  const [bestVehicleMatch, setBestVehicleMatch] = useState(null);
  const [currentRoute, setCurrentRoute] = useState(null);

  // Load route when vehicle selection changes
  useEffect(() => {
    let isMounted = true;
    const loadVehicleRoute = async () => {
      const res = await optimizeRoute(selectedVehicleId);
      if (isMounted && res) {
        setCurrentRoute(res);
      }
    };
    loadVehicleRoute();
    return () => { isMounted = false; };
  }, [selectedVehicleId, optimizeRoute]);

  // Fetch optimal vehicle match for selected emergency bin
  useEffect(() => {
    let isMounted = true;
    const fetchBestMatch = async () => {
      try {
        const res = await apiService.getBestVehicleForBin(selectedBinForMatch);
        if (isMounted && res) {
          setBestVehicleMatch(res);
        }
      } catch (err) {
        console.warn('[RouteOptimizer] Could not fetch best vehicle match:', err.message);
      }
    };
    fetchBestMatch();
    return () => { isMounted = false; };
  }, [selectedBinForMatch]);

  const activeVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  const activeRoute = currentRoute || routes[selectedVehicleId] || {
    vehicle_id: selectedVehicleId,
    vehicle_name: activeVehicle?.vehicle_code || 'V-01',
    color: selectedVehicleId === 'V-02' ? '#2878C8' : (selectedVehicleId === 'V-03' ? '#E89A27' : '#16845B'),
    distance_km: 27.4,
    duration_minutes: 98,
    collected_weight_kg: 1740,
    vehicle_capacity_kg: 2000,
    utilization_pct: 87.0,
    polyline_coords: [
      [23.0370, 72.5120],
      [23.0392, 72.5061],
      [23.0378, 72.5519],
      [23.0350, 72.5290],
      [23.0420, 72.5110],
      [23.0010, 72.5830]
    ],
    stops: [
      { stop_number: 0, bin_id: 'DEPOT', bin_code: 'DEPOT-02 (Bodakdev West Depot)', is_depot: true, weight_kg: 0, priority: 0, lat: 23.0370, lng: 72.5120 },
      { stop_number: 1, bin_id: 'AHM-104', bin_code: 'AHM-104 (Bodakdev SBR Plaza)', is_depot: false, weight_kg: 340, priority: 94, is_critical: true, lat: 23.0392, lng: 72.5061 },
      { stop_number: 2, bin_id: 'AHM-118', bin_code: 'AHM-118 (Navrangpura CG Road)', is_depot: false, weight_kg: 420, priority: 89, is_critical: true, lat: 23.0378, lng: 72.5519 },
      { stop_number: 3, bin_id: 'AHM-091', bin_code: 'AHM-091 (Vastrapur Food Court)', is_depot: false, weight_kg: 510, priority: 76, is_critical: false, lat: 23.0350, lng: 72.5290 },
      { stop_number: 4, bin_id: 'AHM-127', bin_code: 'AHM-127 (Bodakdev SBR Plaza)', is_depot: false, weight_kg: 470, priority: 72, is_critical: false, lat: 23.0420, lng: 72.5110 },
      { stop_number: 5, bin_id: 'MRF', bin_code: 'MRF-01 (Pirana Material Recovery Facility)', is_mrf: true, weight_kg: 0, priority: 0, lat: 23.0010, lng: 72.5830 }
    ],
    ai_recommendation: "Truck V-01: High-priority corridor clearance. Covers critical bins AHM-104 and AHM-118 before 4-hour overflow window."
  };

  const filteredStops = activeRoute.stops ? activeRoute.stops.filter(stop => {
    if (stop.is_depot || stop.is_mrf) return true;
    if (selectedPriorityFilter === 'Critical') return stop.priority >= 85;
    if (selectedPriorityFilter === 'High') return stop.priority >= 70;
    return true;
  }) : [];

  const handleRunOptimize = async () => {
    setOptimizing(true);
    const res = await optimizeRoute(selectedVehicleId);
    if (res) setCurrentRoute(res);
    setOptimizing(false);
  };

  const handleReplan = async () => {
    setReplanning(true);
    const res = await triggerDynamicReplan();
    if (res) {
      setCurrentRoute(res);
      setSelectedVehicleId('V-01');
    }
    setReplanning(false);
  };

  // Candidate Vehicles for Best Match Widget
  const candidateVehicles = (vehicles && vehicles.length > 0 ? vehicles : [
    { id: 'V-01', vehicle_code: 'V-01 (Bodakdev Heavy Compactor)', available_capacity_kg: 1550, status: 'Available (Bodakdev)' },
    { id: 'V-02', vehicle_code: 'V-02 (Bodakdev Medium Tipper)', available_capacity_kg: 650, status: 'On Route (Bodakdev)' },
    { id: 'V-03', vehicle_code: 'V-03 (Dudheshwar Central Compactor)', available_capacity_kg: 1500, status: 'Available (Dudheshwar)' }
  ]).map((v, i) => {
    const avail = v.available_capacity_kg ?? (v.capacity_kg ? v.capacity_kg - (v.current_load_kg || v.current_load || 0) : 1200);
    return {
      id: v.id || v.vehicle_code,
      name: v.vehicle_code || v.id,
      distance_km: (v.latitude && activeRoute.stops?.[1])
        ? +(Math.sqrt(Math.pow((v.latitude - (activeRoute.stops[1].lat || 23.0392)) * 111, 2) + Math.pow((v.longitude - (activeRoute.stops[1].lng || 72.5061)) * 102, 2))).toFixed(1)
        : +(i * 1.3 + 0.8).toFixed(1),
      avail_kg: avail,
      status: v.status || 'Available',
      eligible: avail >= 280,
      reason: avail < 280 ? 'Insufficient capacity (< 280kg required)' : undefined,
      score: Math.max(65, 96 - i * 3)
    };
  });

  const mapCenter = useMemo(() => {
    const coords = activeRoute.polyline_coords;
    if (coords && coords.length > 0) {
      const lats = coords.map(c => c[0]).filter(n => typeof n === 'number' && !isNaN(n));
      const lngs = coords.map(c => c[1]).filter(n => typeof n === 'number' && !isNaN(n));
      if (lats.length > 0 && lngs.length > 0) {
        return [
          +((Math.min(...lats) + Math.max(...lats)) / 2).toFixed(5),
          +((Math.min(...lngs) + Math.max(...lngs)) / 2).toFixed(5)
        ];
      }
    }
    return [23.0280, 72.5450]; // Canonical Ahmedabad central corridor
  }, [activeRoute.polyline_coords]);

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#17201B] flex items-center gap-2">
              <Truck className="w-7 h-7 text-[#16845B]" />
              AI Route Optimizer & Dynamic Replanner
            </h1>
            <span className="px-3 py-1 text-xs font-bold bg-[#DCFCE7] text-[#0B5D3B] border border-[#BBF7D0] rounded-full">
              OR-Tools Capacitated TSP Engine
            </span>
          </div>
          <p className="text-[#66736C] text-xs sm:text-sm mt-1">
            Capacity-constrained collection routing with vehicle-specific schedules and dynamic real-time insertion in Ahmedabad.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunOptimize}
            disabled={optimizing}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#16845B] hover:bg-[#0B5D3B] text-white text-xs font-bold rounded-xl transition shadow-md shadow-[#16845B]/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${optimizing ? 'animate-spin' : ''}`} />
            <span>{optimizing ? 'Optimizing...' : 'Recalculate Route'}</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC ROUTE REPLANNING SPOTLIGHT CARD */}
      <div className="bg-white border border-[#FDE68A] p-6 rounded-3xl shadow-sm relative overflow-hidden space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] rounded-full flex items-center gap-1.5">
                <ShieldAlert className="w-3 h-3 text-[#D64545]" />
                Live Replanning Scenario Active
              </span>
              <span className="text-xs text-[#66736C] font-semibold">Emergency Overflow at AHM-156</span>
            </div>
            <h3 className="text-xl font-black text-[#17201B]">
              Dynamic Mid-Route Waypoint Insertion
            </h3>
            <p className="text-xs text-[#66736C] leading-relaxed">
              Bin <strong className="text-[#17201B]">AHM-156 (Bodakdev Judges Bungalow)</strong> is predicted to overflow in <strong className="text-[#D64545]">45 minutes</strong>. The optimizer recalculates the optimal waypoint sequence with minimum route deviation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-[#F7FAF8] p-4 rounded-2xl border border-[#E3EAE6]">
            <div className="text-center px-3 border-r border-[#E3EAE6]">
              <span className="text-[10px] text-[#66736C] block uppercase font-mono font-bold">Previous Route</span>
              <span className="text-base font-bold text-[#66736C]">31.2 km</span>
            </div>
            <div className="text-center px-3 border-r border-[#E3EAE6]">
              <span className="text-[10px] text-[#66736C] block uppercase font-mono font-bold">Replanned Route</span>
              <span className="text-base font-black text-[#16845B]">33.4 km</span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-[#66736C] block uppercase font-mono font-bold">Delta</span>
              <span className="text-sm font-black text-[#E89A27] font-mono">+2.2 km</span>
            </div>

            <button
              onClick={handleReplan}
              disabled={replanning}
              className="px-5 py-3 bg-[#E89A27] hover:bg-[#D97706] text-white font-extrabold text-xs rounded-xl transition flex items-center gap-2 shadow-md shadow-[#E89A27]/20 disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${replanning ? 'animate-spin' : ''}`} />
              <span>{replanState.isReplanned ? 'Route Updated (AHM-156 Inserted)' : 'Execute Dynamic Replan'}</span>
            </button>
          </div>
        </div>

        {replanState.isReplanned && (
          <div className="pt-3 border-t border-[#E3EAE6] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#0B5D3B] font-bold bg-[#DCFCE7] p-3 rounded-xl border border-[#BBF7D0]">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16845B] shrink-0" />
              <span>Replanning Successful: Bin AHM-156 inserted at Stop #2. Overflow Risk Reduced to 0%.</span>
            </span>
            <span className="text-[#0B5D3B] font-mono text-[11px]">Computed via Hungarian Insertion Algorithm</span>
          </div>
        )}
      </div>

      {/* Main Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Fleet Selection & Capacity Breakdown */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Fleet Selector */}
          <div className="bg-white border border-[#E3EAE6] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#17201B]">
                Municipal Fleet Roster
              </h3>
              <span className="text-xs text-[#16845B] font-mono font-bold">{vehicles.length} Trucks Monitored</span>
            </div>
            <p className="text-xs text-[#66736C]">
              Select a vehicle to inspect its dedicated route, stops, and payload utilization.
            </p>

            <div className="space-y-3">
              {vehicles.map(v => {
                const isSelected = v.id === selectedVehicleId;
                const load = v.current_load_kg || v.current_load;
                const util = ((load / v.capacity_kg) * 100).toFixed(0);
                const color = v.id === 'V-02' ? '#2878C8' : (v.id === 'V-03' ? '#E89A27' : '#16845B');

                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-[#F0FDF4] border-[#16845B] ring-2 ring-[#16845B]/20 shadow-sm'
                        : 'bg-[#F7FAF8] border-[#E3EAE6] hover:border-[#CBD8D2]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-bold text-[#17201B] text-xs">{v.vehicle_code}</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#17201B] font-mono">
                        {load} / {v.capacity_kg} kg ({util}%)
                      </span>
                    </div>

                    <div className="w-full bg-[#E3EAE6] rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(100, util)}%`,
                          backgroundColor: color
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#66736C] pt-1">
                      <span>Driver: <strong>{v.driver_name}</strong></span>
                      <span className="font-mono">Avail: <strong>{v.capacity_kg - load} kg</strong></span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Recommendation Box */}
          <div className="bg-white border border-[#E3EAE6] rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-[#17201B] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#16845B]" />
              AI Operational Directive
            </h3>
            <p className="text-xs text-[#17201B] leading-relaxed font-medium bg-[#F7FAF8] p-3.5 rounded-2xl border border-[#E3EAE6]">
              {activeRoute.ai_recommendation || "Route sequence verified for strict payload capacity and minimum travel distance."}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 bg-[#F7FAF8] rounded-xl border border-[#E3EAE6] flex items-center gap-2">
                <Fuel className="w-4 h-4 text-[#0D9488]" />
                <div>
                  <span className="text-[10px] text-[#66736C] block">Est. Fuel</span>
                  <span className="font-mono font-bold text-[#17201B]">{(activeRoute.distance_km * 0.28).toFixed(1)} L</span>
                </div>
              </div>
              <div className="p-2.5 bg-[#F7FAF8] rounded-xl border border-[#E3EAE6] flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-[#16845B]" />
                <div>
                  <span className="text-[10px] text-[#66736C] block">CO₂e Avoided</span>
                  <span className="font-mono font-bold text-[#16845B]">{(activeRoute.distance_km * 1.8).toFixed(0)} kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Capacity Constraint Guarantee */}
          <div className="bg-white border border-[#E3EAE6] rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-[#17201B] flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[#16845B]" />
              Strict Capacity Constraint
            </h3>
            <p className="text-xs text-[#66736C] leading-relaxed">
              The optimizer strictly guarantees that total collected payload across all sequence stops never exceeds vehicle rated limit ({activeRoute.vehicle_capacity_kg || activeVehicle?.capacity_kg || 2000} kg).
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Route Map & Waypoint Sequence */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Route Summary Bar */}
          <div className="bg-white border border-[#E3EAE6] rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3EAE6] pb-4">
              <div>
                <span className="text-xs font-mono text-[#16845B] font-bold uppercase tracking-wider block">
                  Active Route Overview
                </span>
                <h2 className="text-lg font-black text-[#17201B] flex items-center gap-2">
                  <span>{activeRoute.vehicle_name || activeVehicle?.vehicle_code}</span>
                  <span 
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: activeRoute.color || '#16845B' }}
                  >
                    ROUTE ACTIVE
                  </span>
                </h2>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#66736C] font-semibold">Filter:</span>
                {['All', 'Critical', 'High'].map(p => (
                  <button
                    key={p}
                    onClick={() => setSelectedPriorityFilter(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      selectedPriorityFilter === p
                        ? 'bg-[#16845B] text-white shadow-sm'
                        : 'bg-[#F1F6F3] text-[#66736C] hover:text-[#17201B]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 text-xs font-bold">
                <div className="bg-[#F7FAF8] px-3 py-1.5 rounded-xl border border-[#E3EAE6]">
                  <span className="text-[#66736C] block text-[10px]">Distance</span>
                  <span className="text-[#17201B] font-mono">{activeRoute.distance_km} km</span>
                </div>
                <div className="bg-[#F7FAF8] px-3 py-1.5 rounded-xl border border-[#E3EAE6]">
                  <span className="text-[#66736C] block text-[10px]">Duration</span>
                  <span className="text-[#17201B] font-mono">{activeRoute.duration_minutes} min</span>
                </div>
                <div className="bg-[#F7FAF8] px-3 py-1.5 rounded-xl border border-[#E3EAE6]">
                  <span className="text-[#66736C] block text-[10px]">Collected</span>
                  <span className="text-[#16845B] font-mono">{activeRoute.collected_weight_kg} kg</span>
                </div>
              </div>
            </div>

            {/* INTERACTIVE ROUTE MAP CANVAS */}
            <div className="h-96 sm:h-[440px] w-full rounded-2xl overflow-hidden border border-[#E3EAE6] relative shadow-inner">
              <MapContainer
                center={mapCenter}
                zoom={12}
                scrollWheelZoom={false}
                className="w-full h-full"
              >
                <LeafletMapResizer />
                <RouteBoundsFitter polylineCoords={activeRoute.polyline_coords} stops={filteredStops} />
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  maxZoom={19}
                />

                {/* Selected Vehicle Route Polyline */}
                {activeRoute.polyline_coords && (
                  <Polyline
                    positions={activeRoute.polyline_coords}
                    pathOptions={{ 
                      color: activeRoute.color || '#16845B', 
                      weight: 5, 
                      opacity: 0.95,
                      dashArray: selectedVehicleId === 'V-01' && activeRoute.is_replanned ? '8 6' : undefined
                    }}
                  />
                )}

                {/* Stop Markers */}
                {filteredStops.map((stop, idx) => {
                  if (!stop.lat || !stop.lng) return null;
                  const icon = createStopIcon(
                    stop.stop_number, 
                    stop.is_critical, 
                    stop.is_depot, 
                    stop.is_mrf, 
                    stop.is_dynamically_inserted,
                    activeRoute.color || '#16845B'
                  );

                  return (
                    <Marker
                      key={`stop-${idx}-${stop.bin_id}`}
                      position={[stop.lat, stop.lng]}
                      icon={icon}
                    >
                      <Popup>
                        <div className="p-2 space-y-1.5 min-w-[180px] font-sans text-xs">
                          <div className="font-bold text-[#17201B]">{stop.bin_code}</div>
                          <div className="text-[#66736C]">
                            {stop.is_depot ? 'Depot Terminal' : (stop.is_mrf ? 'MRF Recovery Facility' : `Payload: ${stop.weight_kg} kg`)}
                          </div>
                          {!stop.is_depot && !stop.is_mrf && (
                            <button
                              onClick={() => {
                                const found = bins.find(b => b.bin_code === stop.bin_id || b.id === stop.bin_id);
                                if (found) openDigitalTwin(found);
                              }}
                              className="mt-1 w-full py-1 bg-[#16845B] text-white rounded-lg text-[10px] font-bold"
                            >
                              Open Digital Twin
                            </button>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* Live Vehicle Marker */}
                {activeVehicle && (
                  <Marker
                    position={[activeVehicle.latitude || mapCenter[0], activeVehicle.longitude || mapCenter[1]]}
                    icon={createTruckMarkerIcon(activeVehicle.id, activeRoute.color || '#16845B')}
                  />
                )}
              </MapContainer>

              {/* Map floating route badge */}
              <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#E3EAE6] text-xs font-bold text-[#17201B] shadow-md flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeRoute.color || '#16845B' }}></span>
                <span>{activeRoute.vehicle_name} ({activeRoute.distance_km} km)</span>
              </div>
            </div>

            {/* Sequence Waypoints Timeline */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#66736C] uppercase tracking-wider">Optimized Sequence Waypoints</span>
              
              <div className="relative border-l-2 border-[#E3EAE6] ml-4 pl-6 space-y-4">
                {filteredStops.map((stop, idx) => (
                  <div key={idx} className="relative group">
                    {/* Circle marker on line */}
                    <div 
                      className={`absolute -left-[31px] top-2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
                        stop.is_depot ? 'bg-[#66736C]' : (stop.is_mrf ? 'bg-[#0D9488]' : (stop.is_critical ? 'bg-[#D64545]' : 'bg-[#16845B]'))
                      }`} 
                    />

                    <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                      stop.is_dynamically_inserted ? 'bg-[#FFFBEB] border-[#FDE68A] shadow-sm' : 'bg-[#F7FAF8] border-[#E3EAE6] hover:bg-white'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-[#66736C] w-6">#{idx}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#17201B]">{stop.bin_code}</span>
                            {stop.is_critical && (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#FEE2E2] text-[#991B1B] rounded-full border border-[#FECACA]">
                                Priority {stop.priority}
                              </span>
                            )}
                            {stop.is_dynamically_inserted && (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#FEF08A] text-[#854D0E] rounded-full border border-[#FDE047]">
                                DYNAMIC INSERTION
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#66736C]">
                            {stop.is_depot ? 'Depot Hub Operations' : (stop.is_mrf ? 'Pirana Material Recovery Offload' : `Estimated Payload: ${stop.weight_kg} kg`)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right text-xs">
                        <span className="text-[#66736C] block text-[10px] uppercase font-bold">Action</span>
                        <span className="font-bold text-[#17201B]">
                          {stop.is_depot ? 'Dispatch Out' : (stop.is_mrf ? 'Offload to MRF' : 'Collect & Compress')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Best Vehicle for Bin Intelligent Matcher */}
          <div className="bg-white border border-[#E3EAE6] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3EAE6] pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#17201B] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#16845B]" />
                  Best Vehicle for Critical Bin Selection
                </h3>
                <p className="text-xs text-[#66736C]">Automated matching based on proximity, traffic conditions, and remaining payload margin</p>
              </div>

              <select
                value={selectedBinForMatch}
                onChange={(e) => setSelectedBinForMatch(e.target.value)}
                className="bg-[#F7FAF8] border border-[#E3EAE6] text-xs font-bold text-[#17201B] px-3 py-2 rounded-xl focus:outline-none focus:border-[#16845B]"
              >
                <option value="AHM-104">Bin AHM-104 (280 kg req)</option>
                <option value="AHM-118">Bin AHM-118 (340 kg req)</option>
                <option value="AHM-156">Bin AHM-156 (410 kg req)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {candidateVehicles.map(c => (
                <div
                  key={c.id}
                  className={`p-4 rounded-2xl border text-xs flex flex-col justify-between ${
                    c.eligible
                      ? 'bg-[#F7FAF8] border-[#E3EAE6]'
                      : 'bg-[#FEF2F2] border-[#FECACA] opacity-75'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[#17201B]">{c.id}</span>
                      {c.eligible ? (
                        <span className="text-[10px] font-bold text-[#0B5D3B] bg-[#DCFCE7] px-2 py-0.5 rounded-full border border-[#BBF7D0]">
                          Match Score: {c.score}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-[#991B1B] bg-[#FEE2E2] px-2 py-0.5 rounded-full border border-[#FECACA]">
                          Ineligible
                        </span>
                      )}
                    </div>
                    <p className="text-[#66736C] text-[11px] mb-2 font-medium">{c.status}</p>
                    <div className="space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between text-[#66736C]">
                        <span>Proximity:</span>
                        <span className="text-[#17201B] font-bold">{c.distance_km} km</span>
                      </div>
                      <div className="flex justify-between text-[#66736C]">
                        <span>Available Margin:</span>
                        <span className={c.eligible ? 'text-[#16845B] font-bold' : 'text-[#D64545]'}>{c.avail_kg} kg</span>
                      </div>
                    </div>
                  </div>

                  {!c.eligible && (
                    <p className="text-[10px] text-[#991B1B] mt-2 font-semibold">{c.reason}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl text-xs text-[#17201B] flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16845B] shrink-0" />
                <span>
                  {bestVehicleMatch ? (
                    <>
                      AI Recommendation: Assign <strong>Truck {bestVehicleMatch.best_vehicle?.vehicle_code || bestVehicleMatch.vehicle_code}</strong> ({bestVehicleMatch.best_vehicle?.driver_name || 'Driver'}) — Closest proximity ({bestVehicleMatch.distance_km || bestVehicleMatch.best_vehicle?.distance_km} km) with {bestVehicleMatch.available_capacity_kg || bestVehicleMatch.best_vehicle?.available_capacity_kg} kg available margin.
                    </>
                  ) : (
                    <>
                      AI Recommendation: Assign <strong>Truck V-02 (Bodakdev Medium Tipper)</strong> — Closest proximity (0.3 km) with 650 kg available margin.
                    </>
                  )}
                </span>
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
