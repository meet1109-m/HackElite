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
  const { eventMode, toggleEventMode, binPlacements } = useWasteData();
  const [selectedEvent, setSelectedEvent] = useState(AHMEDABAD_EVENTS[0]);
  const [activeEventId, setActiveEventId] = useState(eventMode ? 'navratri_gmdc' : null);

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

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Calendar className="w-8 h-8 text-emerald-400" />
              Ahmedabad Event Mode & AI Bin Placement
            </h1>
            <span className="px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              Festival Surge Intelligence & GIS Placement
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Pre-empt high-density festival surges and discover optimal geographic coordinates for permanent or temporary smart bins.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Simulated AMC Event Management</span>
        </div>
      </div>

      {/* SECTION 1: AHMEDABAD FESTIVAL / EVENT MODE */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Ahmedabad Event & Surge Activator
            </h2>
            <p className="text-xs text-slate-400">Select an active city event to trigger automated resource staging and collection multipliers</p>
          </div>

          {activeEventId && (
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full text-xs font-bold animate-pulse flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Event Mode Active: {AHMEDABAD_EVENTS.find(e => e.id === activeEventId)?.name}
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
                    ? 'bg-amber-950/20 border-amber-500/60 ring-1 ring-amber-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">{ev.zone}</span>
                      <h3 className="text-base font-bold text-white mt-0.5">{ev.name}</h3>
                    </div>
                    <span className="text-xs font-black font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      +{ev.wasteSurgePct}% Waste
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{ev.description}</p>

                  <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Footfall</span>
                      <span className="font-bold text-slate-200">{ev.expectedFootfall}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Temp Bins</span>
                      <span className="font-bold text-emerald-400">+{ev.suggestedTemporaryBins} Bins</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Cadence</span>
                      <span className="font-bold text-blue-400">{ev.collectionCyclesPerDay}x / Day</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Stream: <strong className="text-slate-300">{ev.primaryStream}</strong></span>
                  <button
                    onClick={() => handleToggleEvent(ev)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
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
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              AI Bin Placement & Capacity Optimization Recommendations
            </h2>
            <p className="text-xs text-slate-400">Spatial Poisson analysis combining overflow frequency, footfall density, and nearest-bin distance</p>
          </div>
          <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">
            GIS Spatial Optimizer
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {binPlacements.map(place => (
            <div key={place.id} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">{place.zone}</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{place.location_name}</h3>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                    place.priority === 'HIGH'
                      ? 'bg-red-500/20 text-red-400 border-red-500/40'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  }`}>
                    {place.priority} PRIORITY
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between font-mono text-[11px] bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Coordinates:</span>
                    <span className="text-emerald-400 font-bold">{place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[11px] bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Distance to Nearest Bin:</span>
                    <span className="text-white font-bold">{place.distance_to_nearest_bin_m} meters</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Placement Justification</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{place.reason}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>Expected Impact: -38% overflow spills</span>
                <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[11px]">
                  Submit to AMC GIS
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
