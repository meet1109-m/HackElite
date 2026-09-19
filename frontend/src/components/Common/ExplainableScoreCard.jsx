import React from 'react';
import { HelpCircle, ArrowUpRight, CheckCircle, Zap } from 'lucide-react';

export const ExplainableScoreCard = ({ explanation, binCode }) => {
  if (!explanation) return null;

  const { score, tier, breakdown, ai_recommendation } = explanation;

  let badgeColor = "bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]";
  if (tier === "HIGH") badgeColor = "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]";
  if (tier === "MEDIUM") badgeColor = "bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]";
  if (tier === "LOW") badgeColor = "bg-[#DCFCE7] text-[#0B5D3B] border-[#BBF7D0]";

  return (
    <div className="bg-[#F7FAF8] border border-[#E3EAE6] rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#E3EAE6] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#16845B]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#17201B]">
            Why is {binCode || 'this bin'} {tier}?
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeColor}`}>
            {tier}
          </span>
          <span className="font-mono text-base font-black text-[#17201B]">
            {score}<span className="text-xs text-[#66736C] font-normal">/100</span>
          </span>
        </div>
      </div>

      {/* Factor Breakdown List */}
      <div className="space-y-2 mb-4">
        {breakdown && breakdown.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-white border border-[#E3EAE6] hover:border-[#16845B] transition-colors shadow-sm">
            <div className="flex flex-col">
              <span className="font-bold text-[#17201B]">{item.factor}</span>
              <span className="text-[11px] text-[#66736C]">{item.description}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-3">
              <span className="text-[11px] font-mono text-[#66736C]">({item.raw_value})</span>
              <span className="font-mono font-bold text-[#0B5D3B] bg-[#DCFCE7] px-2 py-0.5 rounded-md border border-[#BBF7D0]">
                +{item.points}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* AI Recommendation */}
      <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl">
        <div className="text-[11px] font-bold text-[#0B5D3B] uppercase tracking-wider mb-1 flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5 text-[#16845B]" /> AI Recommendation
        </div>
        <p className="text-xs text-[#17201B] leading-relaxed font-medium">
          {ai_recommendation}
        </p>
      </div>
    </div>
  );
};

export default ExplainableScoreCard;
