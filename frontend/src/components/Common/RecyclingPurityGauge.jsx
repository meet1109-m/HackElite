import React from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';

export const RecyclingPurityGauge = ({ score = 75, stream = "Plastic & Recyclables", alert = null, showDetails = true }) => {
  const isHighPurity = score >= 75;
  const isModerate = score >= 50 && score < 75;
  
  let strokeColor = "#10b981"; // Emerald
  let textColor = "text-emerald-400";
  let tierLabel = "High Recovery Grade";

  if (!isHighPurity && isModerate) {
    strokeColor = "#f59e0b"; // Amber
    textColor = "text-amber-400";
    tierLabel = "Secondary Sorting Required";
  } else if (score < 50) {
    strokeColor = "#ef4444"; // Red
    textColor = "text-rose-400";
    tierLabel = "High Contamination Stream";
  }

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center bg-slate-900/60 p-4 rounded-xl border border-slate-800">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#1e293b"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={strokeColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-2xl font-extrabold font-mono ${textColor}`}>{score}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">/ 100</span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <div className="text-xs font-bold text-slate-200">Recycling Purity Score</div>
        <div className={`text-[11px] font-medium mt-0.5 ${textColor}`}>{tierLabel}</div>
      </div>

      {alert && (
        <div className="mt-3 w-full p-2.5 bg-rose-950/70 border border-rose-800/80 rounded-lg flex items-start gap-2 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-snug">{alert}</span>
        </div>
      )}
    </div>
  );
};

export default RecyclingPurityGauge;
