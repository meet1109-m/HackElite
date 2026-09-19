import React from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';

export const RecyclingPurityGauge = ({ score = 75, stream = "Plastic & Recyclables", alert = null }) => {
  const isHighPurity = score >= 75;
  const isModerate = score >= 50 && score < 75;
  
  let strokeColor = "#16845B"; // Green
  let textColor = "text-[#16845B]";
  let tierLabel = "High Recovery Grade";

  if (!isHighPurity && isModerate) {
    strokeColor = "#E89A27"; // Amber
    textColor = "text-[#E89A27]";
    tierLabel = "Secondary Sorting Required";
  } else if (score < 50) {
    strokeColor = "#D64545"; // Red
    textColor = "text-[#D64545]";
    tierLabel = "High Contamination Stream";
  }

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-2xl border border-[#E3EAE6] shadow-sm">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#E3EAE6"
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
          <span className={`text-2xl font-black font-mono ${textColor}`}>{score}</span>
          <span className="text-[10px] text-[#66736C] uppercase tracking-widest font-bold">/ 100</span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <div className="text-xs font-bold text-[#17201B]">Recycling Purity Score</div>
        <div className={`text-[11px] font-semibold mt-0.5 ${textColor}`}>{tierLabel}</div>
      </div>

      {alert && (
        <div className="mt-3 w-full p-2.5 bg-[#FEE2E2] border border-[#FECACA] rounded-xl flex items-start gap-2 text-[#991B1B] text-xs">
          <AlertCircle className="w-4 h-4 text-[#D64545] shrink-0 mt-0.5" />
          <span className="leading-snug">{alert}</span>
        </div>
      )}
    </div>
  );
};

export default RecyclingPurityGauge;
