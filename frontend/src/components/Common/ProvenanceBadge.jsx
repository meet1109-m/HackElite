import React from 'react';
import { Camera, Sparkles, Cpu, Radio } from 'lucide-react';

export const ProvenanceBadge = ({ source, confidence }) => {
  const isDetected = source && source.toLowerCase().includes('detected');
  const isEstimated = source && source.toLowerCase().includes('estimated');

  if (isDetected) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#DCFCE7] text-[#0B5D3B] border border-[#BBF7D0] shadow-sm">
        <Camera className="w-3.5 h-3.5 text-[#16845B]" />
        <span>AI Detected from Image</span>
        {confidence && <span className="opacity-75 text-[10px] ml-0.5">({confidence}%)</span>}
      </span>
    );
  }

  if (isEstimated) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-[#2878C8]" />
        <span>AI Estimated from Telemetry</span>
        {confidence && <span className="opacity-75 text-[10px] ml-0.5">({confidence}%)</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F1F6F3] text-[#17201B] border border-[#E3EAE6]">
      <Radio className="w-3.5 h-3.5 text-[#66736C]" />
      <span>Sensor Measured</span>
    </span>
  );
};

export default ProvenanceBadge;
