import React, { useState, useMemo } from 'react';
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
  Sliders,
  ArrowRight
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Tooltip as LeafletTooltip } from 'react-leaflet';
import L from 'leaflet';
import { useWasteData } from '../context/WasteDataContext';
import OverflowCountdownBadge from '../components/Common/OverflowCountdownBadge';
import ProvenanceBadge from '../components/Common/ProvenanceBadge';

// Custom SVG map icons with light theme borders & clean styling
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
        box-shadow: 0 4px 10px rgba(0,0,0,0.25);
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
        gap: 3px;
        padding: 4px 8px;
        background-color: #0B5D3B;
        color: white;
        font-weight: 800;
        font-size: 10px;
        font-family: monospace;
        border-radius: 8px;
        border: 2px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      ">
        🚚 ${code.substring(0, 4)}
      </div>
    `,
    iconSize: [58, 26],
    iconAnchor: [29, 13],
    popupAnchor: [0, -13]
  });
};

export const LiveOperationsPage = ({ onNavigate, onNavigateTab }) => {
  const navigate = onNavigate || onNavigateTab;
  const { bins, vehicles, zones, openDigitalTwin, activeRoute } = useWasteData();
  
  // Layer Toggles
  const [showBins, setShowBins] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);
  const [showHeatmaps, setShowHeatmaps] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [filterCriticalOnly, setFilterCriticalOnly] = useState(false);
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Map Provider View Toggle: Leaflet Light GIS vs Google Maps Embed Satellite View
  const [mapMode, setMapMode] = useState('leaflet'); // 'leaflet' or 'google_embed'

  const filteredBins = useMemo(() => {
    return bins.filter(b => {
      if (filterCriticalOnly && b.status !== 'Critical' && b.status !== 'Overflow Risk') return false;
      if (selectedZoneFilter !== 'all' && b.zone !== selectedZoneFilter) return false;
      if (searchQuery && !b.bin_code.toLowerCase().includes(searchQuery.toLowerCase()) && !b.address.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [bins, filterCriticalOnly, selectedZoneFilter, searchQuery]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden bg-[#F7FAF8]">
      {/* Top Map Control Bar */}
      <div className="p-3.5 bg-white border-b border-[#E3EAE6] z-10 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        {/* Left: Filters & Search */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#66736C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Bin Code or Area..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#F7FAF8] border border-[#E3EAE6] rounded-xl text-xs text-[#17201B] placeholder-[#94A39D] focus:outline-none focus:border-[#16845B] w-48 sm:w-60 shadow-sm"
            />
          </div>

          <select
            value={selectedZoneFilter}
            onChange={e => setSelectedZoneFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#F7FAF8] border border-[#E3EAE6] rounded-xl text-xs text-[#17201B] font-medium focus:outline-none focus:border-[#16845B] shadow-sm"
          >
            <option value="all">All Ahmedabad Zones ({zones.length})</option>
            {zones.map(z => (
              <option key={z.id} value={z.name}>{z.name}</option>
            ))}
          </select>

          <button
            onClick={() => setFilterCriticalOnly(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl font-bold border transition-all flex items-center gap-1.5 shadow-sm ${
              filterCriticalOnly 
                ? 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]' 
                : 'bg-white text-[#66736C] border-[#E3EAE6] hover:text-[#17201B]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-[#D64545]" />
            <span>Critical Only</span>
          </button>
        </div>

        {/* Right: Layer Toggles & Map View Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-[#F7FAF8] rounded-xl border border-[#E3EAE6] text-[#17201B] text-xs font-semibold shadow-sm">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={showBins} onChange={e => setShowBins(e.target.checked)} className="rounded accent-[#16845B]" />
              <span>Bins ({filteredBins.length})</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={showVehicles} onChange={e => setShowVehicles(e.target.checked)} className="rounded accent-[#2878C8]" />
              <span>Trucks ({vehicles.length})</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={showHeatmaps} onChange={e => setShowHeatmaps(e.target.checked)} className="rounded accent-[#E89A27]" />
              <span>Hotspots</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={showRoutes} onChange={e => setShowRoutes(e.target.checked)} className="rounded accent-[#0B5D3B]" />
              <span>Routes</span>
            </label>
          </div>

          {/* Map Mode Switcher */}
          <div className="flex items-center bg-[#F1F6F3] p-1 rounded-xl border border-[#E3EAE6]">
            <button
              onClick={() => setMapMode('leaflet')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                mapMode === 'leaflet' ? 'bg-[#16845B] text-white shadow-sm' : 'text-[#66736C] hover:text-[#17201B]'
              }`}
            >
              GIS Light Map
            </button>
            <button
              onClick={() => setMapMode('google_embed')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                mapMode === 'google_embed' ? 'bg-[#16845B] text-white shadow-sm' : 'text-[#66736C] hover:text-[#17201B]'
              }`}
            >
              Satellite View
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
            {/* Crisp Light GIS CartoDB Voyager Tile Layer */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              maxZoom={19}
            />

            {/* Zone Surge Heatmap Circles */}
            {showHeatmaps && zones.map(z => {
              const isHigh = z.delta_percentage >= 40.0;
              const isMed = z.delta_percentage >= 15.0;
              const circleColor = isHigh ? '#D64545' : (isMed ? '#E89A27' : '#16845B');
              return (
                <Circle
                  key={z.id}
                  center={[z.center_lat, z.center_lng]}
                  radius={1200}
                  pathOptions={{
                    color: circleColor,
                    fillColor: circleColor,
                    fillOpacity: isHigh ? 0.22 : 0.10,
                    weight: isHigh ? 2 : 1.5,
                    dashArray: isHigh ? '4 4' : null
                  }}
                >
                  <LeafletTooltip direction="top" opacity={0.95}>
                    <div className="text-xs p-1 font-sans">
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
                pathOptions={{ color: '#16845B', weight: 4.5, opacity: 0.9, dashArray: '6 6' }}
              />
            )}

            {/* Smart Bins Markers */}
            {showBins && filteredBins.map(b => {
              let color = '#16845B'; // Green (Healthy)
              let isCrit = false;
              if (b.status === 'Critical' || b.status === 'Overflow Risk') {
                color = '#D64545'; // Red
                isCrit = true;
              } else if (b.status === 'High Priority') {
                color = '#E89A27'; // Orange
              } else if (b.status === 'Filling') {
                color = '#2878C8'; // Blue
              }

              const icon = createCustomIcon(color, b.bin_code.replace('AHM-', ''), isCrit);

              return (
                <Marker
                  key={b.id}
                  position={[b.latitude, b.longitude]}
                  icon={icon}
                  eventHandlers={{
                    click: () => openDigitalTwin(b)
                  }}
                >
                  <Popup>
                    <div className="p-2 space-y-2.5 min-w-[210px] text-[#17201B] font-sans">
                      <div className="flex items-center justify-between border-b border-[#E3EAE6] pb-1.5">
                        <span className="font-mono font-black text-sm text-[#17201B]">{b.bin_code}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#0B5D3B] font-bold border border-[#BBF7D0]">
                          {b.waste_stream}
                        </span>
                      </div>
                      <div className="text-xs text-[#66736C] space-y-1">
                        <div><strong>Zone:</strong> {b.zone}</div>
                        <div><strong>Fill:</strong> <span className="font-bold text-[#17201B]">{b.fill_percentage}%</span> ({b.estimated_weight_kg} kg)</div>
                        <div className="mt-1">
                          <OverflowCountdownBadge hours={b.predicted_overflow_hours} text={b.predicted_overflow_text} size="sm" />
                        </div>
                      </div>
                      <button
                        onClick={() => openDigitalTwin(b)}
                        className="w-full py-1.5 bg-[#16845B] hover:bg-[#0B5D3B] text-white rounded-xl text-xs font-bold transition-colors mt-2 shadow-sm"
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
                  <div className="p-2 space-y-2.5 min-w-[220px] text-[#17201B] font-sans">
                    <div className="flex items-center justify-between border-b border-[#E3EAE6] pb-1.5">
                      <span className="font-mono font-bold text-sm text-[#17201B]">{v.vehicle_code}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1E40AF] font-bold border border-[#BFDBFE]">
                        {v.status}
                      </span>
                    </div>
                    <div className="text-xs text-[#66736C] space-y-1">
                      <div><strong>Driver:</strong> {v.driver_name}</div>
                      <div><strong>Load:</strong> {v.current_load_kg || v.current_load} / {v.capacity_kg} kg ({v.utilization_percentage || ((v.current_load / v.capacity_kg)*100).toFixed(0)}%)</div>
                      <div><strong>Free Margin:</strong> <span className="text-[#16845B] font-bold">{v.available_capacity_kg || (v.capacity_kg - v.current_load)} kg</span></div>
                    </div>
                    {navigate && (
                      <button
                        onClick={() => navigate('routes')}
                        className="w-full py-1.5 bg-[#2878C8] hover:bg-[#1E40AF] text-white rounded-xl text-xs font-bold transition-colors mt-2 shadow-sm"
                      >
                        Assign in Route Optimizer
                      </button>
                    )}
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
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117502.89981881792!2d72.48624641666497!3d23.020497793132644!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e848aba5bd449%3A0x4fcedd11614f6516!2sAhmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            ></iframe>
            <div className="absolute top-4 left-4 bg-white/95 border border-[#E3EAE6] p-4 rounded-2xl shadow-xl max-w-sm text-xs text-[#17201B]">
              <div className="font-bold text-[#17201B] flex items-center gap-1.5 mb-1">
                <Globe className="w-4 h-4 text-[#16845B]" /> Google Map Satellite Embed
              </div>
              <p className="text-[11px] text-[#66736C]">
                Displaying Ahmedabad geographic corridor. Switch back to 'GIS Light Map' for interactive pin telemetry and layer inspection.
              </p>
            </div>
          </div>
        )}

        {/* Floating Map Legend Overlay */}
        <div className="absolute bottom-5 left-5 z-20 bg-white/95 backdrop-blur-md border border-[#E3EAE6] p-3.5 rounded-2xl shadow-lg text-xs space-y-2 hidden md:block">
          <span className="text-[10px] font-bold text-[#66736C] uppercase tracking-wider block">
            Map Marker Legend
          </span>
          <div className="flex items-center gap-4 text-[11px] text-[#17201B] font-medium">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#16845B]"></span> Healthy</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#2878C8]"></span> Filling</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#E89A27]"></span> High Priority</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#D64545] animate-pulse"></span> Critical Overflow</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#0B5D3B]"></span> Truck</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveOperationsPage;
