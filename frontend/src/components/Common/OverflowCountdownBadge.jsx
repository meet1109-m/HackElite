import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, Flame } from 'lucide-react';

export const OverflowCountdownBadge = ({ hours, text, size = "md" }) => {
  let bgColor = "bg-[#DCFCE7] text-[#0B5D3B] border-[#BBF7D0]";
  let icon = <CheckCircle2 className="w-3.5 h-3.5 text-[#16845B]" />;
  let label = "Healthy";
  let pulse = false;

  if (hours <= 4.0) {
    bgColor = "bg-[#FEE2E2] text-[#991B1B] border-[#FECACA] shadow-sm";
    icon = <Flame className="w-3.5 h-3.5 text-[#D64545] animate-pulse" />;
    label = "CRITICAL OVERFLOW RISK";
    pulse = true;
  } else if (hours <= 12.0) {
    bgColor = "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]";
    icon = <AlertTriangle className="w-3.5 h-3.5 text-[#E89A27]" />;
    label = "High Risk";
  } else if (hours <= 24.0) {
    bgColor = "bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]";
    icon = <Clock className="w-3.5 h-3.5 text-[#2878C8]" />;
    label = "Moderate";
  }

  const sizeClasses = size === "lg" 
    ? "px-4 py-2 text-base font-bold tracking-wider" 
    : (size === "sm" ? "px-2.5 py-0.5 text-xs font-semibold" : "px-3 py-1.5 text-xs font-semibold");

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border ${bgColor} ${sizeClasses} ${pulse ? 'animate-pulse-slow' : ''}`}>
      {icon}
      <span className="font-mono tracking-tight font-bold">{text || `${hours}h`}</span>
      {size === "lg" && <span className="text-xs opacity-80 font-normal ml-1">until overflow</span>}
    </div>
  );
};

export default OverflowCountdownBadge;
