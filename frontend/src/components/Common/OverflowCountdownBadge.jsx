import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, Flame } from 'lucide-react';

export const OverflowCountdownBadge = ({ hours, text, size = "md" }) => {
  let bgColor = "bg-emerald-950/80 text-emerald-400 border-emerald-700/60";
  let icon = <CheckCircle2 className="w-3.5 h-3.5" />;
  let label = "Healthy";
  let pulse = false;

  if (hours <= 4.0) {
    bgColor = "bg-rose-950/90 text-rose-300 border-rose-600/80 shadow-lg shadow-rose-900/30";
    icon = <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />;
    label = "CRITICAL OVERFLOW RISK";
    pulse = true;
  } else if (hours <= 12.0) {
    bgColor = "bg-amber-950/90 text-amber-300 border-amber-600/80";
    icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
    label = "High Risk";
  } else if (hours <= 24.0) {
    bgColor = "bg-sky-950/80 text-sky-300 border-sky-700/60";
    icon = <Clock className="w-3.5 h-3.5 text-sky-400" />;
    label = "Moderate";
  }

  const sizeClasses = size === "lg" 
    ? "px-4 py-2 text-base font-bold tracking-wider" 
    : (size === "sm" ? "px-2 py-0.5 text-xs font-semibold" : "px-3 py-1.5 text-xs font-semibold");

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border ${bgColor} ${sizeClasses} ${pulse ? 'animate-pulse-slow' : ''}`}>
      {icon}
      <span className="font-mono tracking-tight">{text || `${hours}h`}</span>
      {size === "lg" && <span className="text-xs opacity-75 font-normal ml-1">until predicted overflow</span>}
    </div>
  );
};

export default OverflowCountdownBadge;
