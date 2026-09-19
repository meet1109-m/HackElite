import React from 'react';
import { Camera, Sparkles, Cpu, Radio } from 'lucide-react';

export const ProvenanceBadge = ({ source, confidence }) => {
  const isDetected = source && source.toLowerCase().includes('detected');
  const isEstimated = source && source.toLowerCase().includes('estimated');

  if (isDetected) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm">
        <Camera className="w-3 h-3 text-emerald-400" />
        <span>AI Detected from Image</span>
        {confidence && <span className="opacity-75 text-[10px] ml-0.5">({confidence}%)</span>}
      </span>
    );
  }

  if (isEstimated) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-500/40 shadow-sm">
        <Sparkles className="w-3 h-3 text-blue-400" />
        <span>AI Estimated from Telemetry</span>
        {confidence && <span className="opacity-75 text-[10px] ml-0.5">({confidence}%)</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
      <Radio className="w-3 h-3 text-slate-400" />
      <span>Sensor Measured</span>
    </span>
  );
};

export default ProvenanceBadge;
