import React from 'react';
import { HelpCircle, ArrowUpRight, CheckCircle, Zap } from 'lucide-react';

export const ExplainableScoreCard = ({ explanation, binCode }) => {
  if (!explanation) return null;

  const { score, tier, breakdown, ai_recommendation } = explanation;

  let badgeColor = "bg-rose-950 text-rose-300 border-rose-600";
  if (tier === "HIGH") badgeColor = "bg-amber-950 text-amber-300 border-amber-600";
  if (tier === "MEDIUM") badgeColor = "bg-blue-950 text-blue-300 border-blue-600";
  if (tier === "LOW") badgeColor = "bg-emerald-950 text-emerald-300 border-emerald-600";

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Why is {binCode || 'this bin'} {tier}?
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeColor}`}>
            {tier}
          </span>
          <span className="font-mono text-base font-extrabold text-white">
            {score}<span className="text-xs text-slate-400 font-normal">/100</span>
          </span>
        </div>
      </div>

      {/* Factor Breakdown List */}
      <div className="space-y-2 mb-4">
        {breakdown && breakdown.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/50 transition-colors">
            <div className="flex flex-col">
              <span className="font-medium text-slate-200">{item.factor}</span>
              <span className="text-[11px] text-slate-400">{item.description}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-3">
              <span className="text-[11px] font-mono text-slate-400">({item.raw_value})</span>
              <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
                +{item.points}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* AI Recommendation */}
      <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-lg">
        <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> AI Recommendation
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-medium">
          {ai_recommendation}
        </p>
      </div>
    </div>
  );
};

export default ExplainableScoreCard;
