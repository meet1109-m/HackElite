import React, { useState } from 'react';
import { useWasteData } from '../context/WasteDataContext';
import { Calendar, MapPin, Sparkles, AlertCircle, CheckCircle2, PlusCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const AHMEDABAD_EVENTS = [
  {
    id: 'navratri_gmdc',
    name: 'Navratri Mahotsav at GMDC Ground',
    zone: 'Navrangpura / GMDC',
    expectedFootfall: '45,000 visitors/day',
    wasteSurgePct: 48,
    primaryStream: 'Food Scraps & PET Beverage Bottles',
    suggestedTemporaryBins: 6,
    additionalVehicles: 2,
    collectionCyclesPerDay: 4,
    description: 'Massive evening Garba gatherings generate concentrated food container and beverage waste between 20:00 - 02:00.'
  },
  {
    id: 'riverfront_flowershow',
    name: 'Sabarmati Riverfront Flower Show',
    zone: 'Sabarmati Riverfront (Zone C)',
    expectedFootfall: '30,000 visitors/day',
    wasteSurgePct: 35,
    primaryStream: 'Single-Use Packaging & Bio-Waste',
    suggestedTemporaryBins: 4,
    additionalVehicles: 1,
    collectionCyclesPerDay: 3,
    description: 'Promenade pedestrian traffic leads to high bin fill rates along the East & West lower promenades.'
  },
  {
    id: 'kankaria_carnival',
    name: 'Kankaria Lake Carnival',
    zone: 'Maninagar (Zone D)',
    expectedFootfall: '55,000 visitors/day',
    wasteSurgePct: 58,
    primaryStream: 'Street Food Wrappers & Cups',
    suggestedTemporaryBins: 8,
    additionalVehicles: 2,
    collectionCyclesPerDay: 4,
    description: 'Lake perimeter food stalls and nighttime light shows create rapid bin saturation around gates 1 to 4.'
  },
  {
    id: 'motera_cricket',
    name: 'T20 Match at Narendra Modi Stadium',
    zone: 'Motera / Sabarmati',
    expectedFootfall: '90,000 spectators',
    wasteSurgePct: 72,
    primaryStream: 'Snack Cartons, Flags & Cans',
    suggestedTemporaryBins: 12,
    additionalVehicles: 3,
    collectionCyclesPerDay: 5,
    description: 'High-density influx along Metro station corridors and stadium entry concourses during match ingress/egress.'
  }
];

export default function EventPlacementPage() {
  const { eventMode, toggleEventMode, binPlacements, showToast } = useWasteData();
  const [selectedEvent, setSelectedEvent] = useState(AHMEDABAD_EVENTS[0]);
  const [activeEventId, setActiveEventId] = useState(eventMode ? eventMode.id : null);

  const handleToggleEvent = (event) => {
    setSelectedEvent(event);
    if (activeEventId === event.id) {
      setActiveEventId(null);
      toggleEventMode(null);
    } else {
      setActiveEventId(event.id);
      toggleEventMode(event);
    }
  };

  const handleGisSubmit = (place) => {
    showToast(`✓ Recommendation for ${place.location_name} submitted to AMC GIS Planning Queue.`, 'success');
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto bg-pattern-events min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#17201B] flex items-center gap-2">
              <Calendar className="w-7 h-7 text-[#16845B]" />
              Ahmedabad Event Mode & AI Bin Placement
            </h1>
            <span className="px-3 py-1 text-xs font-bold bg-[#DCFCE7] text-[#0B5D3B] border border-[#BBF7D0] rounded-full">
              Festival Surge Intelligence & GIS Placement
            </span>
          </div>
          <p className="text-[#66736C] text-xs sm:text-sm mt-1">
            Pre-empt high-density festival surges and discover optimal geographic coordinates for permanent or temporary smart bins.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-2xl border border-[#E3EAE6] text-xs text-[#17201B] font-semibold shadow-sm">
          <ShieldCheck className="w-4 h-4 text-[#16845B]" />
          <span>Simulated AMC Event Management</span>
        </div>
      </div>

      {/* SECTION 1: AHMEDABAD FESTIVAL / EVENT MODE */}
      <div className="bg-white border border-[#E3EAE6] rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3EAE6] pb-4">
          <div>
            <h2 className="text-base font-extrabold text-[#17201B] flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#E89A27]" />
              Ahmedabad Event & Surge Activator
            </h2>
            <p className="text-xs text-[#66736C]">Select an active city event to trigger automated resource staging and collection multipliers</p>
          </div>

          {activeEventId && (
            <span className="px-3 py-1 bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] rounded-full text-xs font-bold animate-pulse flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#E89A27]"></span>
              Active: {AHMEDABAD_EVENTS.find(e => e.id === activeEventId)?.name}
            </span>
          )}
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AHMEDABAD_EVENTS.map(ev => {
            const isActive = activeEventId === ev.id;
            return (
              <div
                key={ev.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-[#FFFBEB] border-[#FDE68A] ring-2 ring-[#E89A27]/20 shadow-sm'
                    : 'bg-[#F7FAF8] border-[#E3EAE6] hover:border-[#CBD8D2]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#66736C]">{ev.zone}</span>
                      <h3 className="text-base font-bold text-[#17201B] mt-0.5">{ev.name}</h3>
                    </div>
                    <span className="text-xs font-black font-mono px-2 py-0.5 rounded bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]">
                      +{ev.wasteSurgePct}% Waste
                    </span>
                  </div>

                  <p className="text-xs text-[#66736C] leading-relaxed">{ev.description}</p>

                  <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-[#E3EAE6] text-[11px] font-mono shadow-sm">
                    <div>
                      <span className="text-[#66736C] block text-[9px] uppercase font-bold">Footfall</span>
                      <span className="font-bold text-[#17201B]">{ev.expectedFootfall}</span>
                    </div>
                    <div>
                      <span className="text-[#66736C] block text-[9px] uppercase font-bold">Temp Bins</span>
                      <span className="font-bold text-[#16845B]">+{ev.suggestedTemporaryBins} Bins</span>
                    </div>
                    <div>
                      <span className="text-[#66736C] block text-[9px] uppercase font-bold">Cadence</span>
                      <span className="font-bold text-[#2878C8]">{ev.collectionCyclesPerDay}x / Day</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E3EAE6] flex items-center justify-between">
                  <span className="text-xs text-[#66736C]">Stream: <strong className="text-[#17201B]">{ev.primaryStream}</strong></span>
                  <button
                    onClick={() => handleToggleEvent(ev)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition shadow-sm ${
                      isActive
                        ? 'bg-[#E89A27] text-white hover:bg-[#D97706]'
                        : 'bg-white text-[#17201B] border border-[#E3EAE6] hover:bg-[#F1F6F3]'
                    }`}
                  >
                    {isActive ? 'Deactivate Surge' : 'Activate Event Mode'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: AI BIN PLACEMENT RECOMMENDATION */}
      <div className="bg-white border border-[#E3EAE6] rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[#E3EAE6] pb-4">
          <div>
            <h2 className="text-base font-extrabold text-[#17201B] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#16845B]" />
              AI Bin Placement & Capacity Optimization Recommendations
            </h2>
            <p className="text-xs text-[#66736C]">Spatial Poisson analysis combining overflow frequency, footfall density, and nearest-bin distance</p>
          </div>
          <span className="text-xs font-mono font-bold bg-[#DCFCE7] text-[#0B5D3B] border border-[#BBF7D0] px-3 py-1 rounded-full">
            GIS Spatial Optimizer
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {binPlacements.map(place => (
            <div key={place.id} className="bg-[#F7FAF8] border border-[#E3EAE6] rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-sm">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#66736C]">{place.zone}</span>
                    <h3 className="text-sm font-bold text-[#17201B] mt-0.5">{place.location_name}</h3>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                    place.priority === 'HIGH'
                      ? 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]'
                      : 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'
                  }`}>
                    {place.priority} PRIORITY
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[#17201B]">
                  <div className="flex justify-between font-mono text-[11px] bg-white p-2.5 rounded-xl border border-[#E3EAE6]">
                    <span className="text-[#66736C]">Coordinates:</span>
                    <span className="text-[#16845B] font-bold">{place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[11px] bg-white p-2.5 rounded-xl border border-[#E3EAE6]">
                    <span className="text-[#66736C]">Nearest Bin Margin:</span>
                    <span className="text-[#17201B] font-bold">{place.distance_to_nearest_bin_m} meters</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#E3EAE6] space-y-1 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-[#66736C] block">Placement Justification</span>
                  <p className="text-xs text-[#66736C] leading-relaxed">{place.reason}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E3EAE6] flex items-center justify-between text-xs font-bold text-[#16845B]">
                <span>-38% overflow risk</span>
                <button
                  onClick={() => handleGisSubmit(place)}
                  className="px-3 py-1.5 bg-[#DCFCE7] hover:bg-[#BBF7D0] text-[#0B5D3B] border border-[#BBF7D0] rounded-xl text-[11px] font-bold transition shadow-sm"
                >
                  Submit to AMC GIS
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
