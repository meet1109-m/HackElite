import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Truck, 
  Layers, 
  Filter, 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Maximize2, 
  Compass, 
  Search, 
  Radio,
  Globe,
  Sliders
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Tooltip as LeafletTooltip } from 'react-leaflet';
import L from 'leaflet';
import { useWasteData } from '../context/WasteDataContext';
import OverflowCountdownBadge from '../components/Common/OverflowCountdownBadge';
import ProvenanceBadge from '../components/Common/ProvenanceBadge';

// Custom SVG map icons
const createCustomIcon = (color, text, isCritical = false) => {
  return L.divIcon({
    className: 'custom-bin-pin',
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background-color: ${color};
        color: white;
        font-weight: 800;
        font-size: 10px;
        font-family: monospace;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.6);
        ${isCritical ? 'animation: pulse 1.5s infinite;' : ''}
      ">
        ${text}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const createVehicleIcon = (code) => {
  return L.divIcon({
    className: 'custom-vehicle-pin',
    html: `
      <div style="
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 4px 8px;
        background-color: #0284c7;
        color: white;
        font-weight: 800;
        font-size: 10px;
        font-family: monospace;
        border-radius: 8px;
        border: 2px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.6);
      ">
        🚚 ${code}
      </div>
    `,
    iconSize: [54, 26],
    iconAnchor: [27, 13],
    popupAnchor: [0, -13]
  });
};

export const LiveOperationsPage = ({ onNavigateTab }) => {
  const { bins, vehicles, zones, setSelectedBin, activeRoute } = useWasteData();
  
  // Layer Toggles
  const [showBins, setShowBins] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);
  const [showHeatmaps, setShowHeatmaps] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [filterCriticalOnly, setFilterCriticalOnly] = useState(false);
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Map Provider View Toggle: Leaflet Dark GIS vs Google Maps Embed Satellite View
  const [mapMode, setMapMode] = useState('leaflet'); // 'leaflet' or 'google_embed'

  const filteredBins = bins.filter(b => {
    if (filterCriticalOnly && b.status !== 'Critical' && b.status !== 'Overflow Risk') return false;
    if (selectedZoneFilter !== 'all' && b.zone !== selectedZoneFilter) return false;
    if (searchQuery && !b.bin_code.toLowerCase().includes(searchQuery.toLowerCase()) && !b.address.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden bg-slate-950">
      {/* Top Map Control Bar */}
      <div className="p-3 bg-slate-900/95 border-b border-slate-800 z-10 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Filters & Search */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search Bin Code or Landmark..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-48 sm:w-60"
            />
          </div>

          <select
            value={selectedZoneFilter}
            onChange={e => setSelectedZoneFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Ahmedabad Zones ({zones.length})</option>
            {zones.map(z => (
              <option key={z.id} value={z.name}>{z.name}</option>
            ))}
          </select>

          <button
            onClick={() => setFilterCriticalOnly(prev => !prev)}
            className={`px-3 py-1.5 rounded-lg font-bold border transition-colors flex items-center gap-1.5 ${
              filterCriticalOnly 
                ? 'bg-rose-950 text-rose-300 border-rose-600 shadow-md shadow-rose-950' 
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Critical Only</span>
          </button>
        </div>

        {/* Right: Layer Toggles & Map View Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-slate-300">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={showBins} onChange={e => setShowBins(e.target.checked)} className="rounded text-emerald-500" />
              <span>Bins ({filteredBins.length})</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={showVehicles} onChange={e => setShowVehicles(e.target.checked)} className="rounded text-sky-500" />
              <span>Vehicles ({vehicles.length})</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={showHeatmaps} onChange={e => setShowHeatmaps(e.target.checked)} className="rounded text-amber-500" />
              <span>Hotspots</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={showRoutes} onChange={e => setShowRoutes(e.target.checked)} className="rounded text-indigo-500" />
              <span>Routes</span>
            </label>
          </div>

          {/* Map Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setMapMode('leaflet')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                mapMode === 'leaflet' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              GIS Dark Map
            </button>
            <button
              onClick={() => setMapMode('google_embed')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                mapMode === 'google_embed' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Google Map Embed
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="flex-1 w-full h-full relative">
        {mapMode === 'leaflet' ? (
          <MapContainer
            center={[23.0300, 72.5500]}
            zoom={13}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            {/* Dark GIS Carto Map Tiles */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              maxZoom={19}
            />

            {/* Zone Surge Heatmap Circles */}
            {showHeatmaps && zones.map(z => {
              const isHigh = z.delta_percentage >= 50.0;
              const isMed = z.delta_percentage >= 20.0;
              const circleColor = isHigh ? '#ef4444' : (isMed ? '#f59e0b' : '#10b981');
              return (
                <Circle
                  key={z.id}
                  center={[z.center_lat, z.center_lng]}
                  radius={1100}
                  pathOptions={{
                    color: circleColor,
                    fillColor: circleColor,
                    fillOpacity: isHigh ? 0.25 : 0.12,
                    weight: isHigh ? 2 : 1,
                    dashArray: isHigh ? '4 4' : null
                  }}
                >
                  <LeafletTooltip direction="top" opacity={0.9}>
                    <div className="text-xs p-1">
                      <strong>{z.name}</strong><br />
                      Generation: {z.current_generation_kg} kg/day ({z.delta_percentage > 0 ? `+${z.delta_percentage}%` : `${z.delta_percentage}%`})
                    </div>
                  </LeafletTooltip>
                </Circle>
              );
            })}

            {/* Active Route Polylines */}
            {showRoutes && activeRoute && activeRoute.polyline_coords && (
              <Polyline
                positions={activeRoute.polyline_coords}
                pathOptions={{ color: '#10b981', weight: 4, opacity: 0.85, dashArray: '6 6' }}
              />
            )}

            {/* Smart Bins Markers */}
            {showBins && filteredBins.map(b => {
              let color = '#10b981'; // Green (Healthy)
              let isCrit = false;
              if (b.status === 'Critical' || b.status === 'Overflow Risk') {
                color = '#ef4444'; // Red
                isCrit = true;
              } else if (b.status === 'High Priority') {
                color = '#f97316'; // Orange
              } else if (b.status === 'Filling') {
                color = '#eab308'; // Yellow
              }

              const icon = createCustomIcon(color, b.bin_code.replace('AHM-', ''), isCrit);

              return (
                <Marker
                  key={b.id}
                  position={[b.latitude, b.longitude]}
                  icon={icon}
                  eventHandlers={{
                    click: () => setSelectedBin(b)
                  }}
                >
                  <Popup>
                    <div className="p-1 space-y-2 min-w-[200px] text-slate-100 font-sans">
                      <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                        <span className="font-mono font-bold text-sm text-white">{b.bin_code}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                          {b.waste_stream}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300">
                        <div><strong>Zone:</strong> {b.zone}</div>
                        <div><strong>Fill:</strong> {b.fill_percentage}% ({b.estimated_weight_kg} kg)</div>
                        <div className="mt-1">
                          <OverflowCountdownBadge hours={b.predicted_overflow_hours} text={b.predicted_overflow_text} size="sm" />
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedBin(b)}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-colors mt-2"
                      >
                        Open Digital Twin
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Collection Vehicle Markers */}
            {showVehicles && vehicles.map(v => (
              <Marker
                key={v.id}
                position={[v.latitude, v.longitude]}
                icon={createVehicleIcon(v.vehicle_code)}
              >
                <Popup>
                  <div className="p-1 space-y-2 min-w-[220px] text-slate-100 font-sans">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                      <span className="font-mono font-bold text-sm text-white">{v.vehicle_code}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 font-bold border border-sky-700">
                        {v.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1">
                      <div><strong>Driver:</strong> {v.driver_name} ({v.driver_phone})</div>
                      <div><strong>Type:</strong> {v.vehicle_type}</div>
                      <div><strong>Load:</strong> {v.current_load_kg} / {v.capacity_kg} kg ({v.utilization_percentage}%)</div>
                      <div><strong>Free Capacity:</strong> <span className="text-emerald-400 font-bold">{v.available_capacity_kg} kg</span></div>
                    </div>
                    <button
                      onClick={() => onNavigateTab('routes')}
                      className="w-full py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-bold transition-colors mt-2"
                    >
                      Assign in Route Optimizer
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          /* Google Map Embed Mode */
          <div className="w-full h-full relative">
            <iframe
              title="Ahmedabad Urban Operations Google Map"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
              loading="lazy"
              allowFullScreen
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117502.89981881792!2d72.48624641666497!3d23.020497793132644!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e848aba5bd449%3A0x4fcedd11614f6516!2sAhmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            ></iframe>
            <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow-xl max-w-sm text-xs text-slate-300">
              <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                <Globe className="w-4 h-4 text-emerald-400" /> Google Map Satellite Embed
              </div>
              <p className="text-[11px] text-slate-400">
                Displaying Ahmedabad geographic corridor. Switch back to 'GIS Dark Map' for interactive pin telemetry and layer inspection.
              </p>
            </div>
          </div>
        )}

        {/* Floating Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 rounded-xl shadow-xl text-xs space-y-2 hidden md:block">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Map Marker Legend
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Healthy</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-400"></span> Filling</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500"></span> High Priority</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span> Critical Overflow</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-sky-500"></span> Truck</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveOperationsPage;
