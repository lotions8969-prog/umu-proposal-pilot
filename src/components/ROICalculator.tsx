"use client";

import { TrendingUp, DollarSign, Clock, BarChart3 } from "lucide-react";
import type { ROIData } from "@/types";
import { formatCurrency } from "@/lib/pricing";

interface ROICalculatorProps {
  roi: ROIData;
  planColor: string;
}

export default function ROICalculator({ roi, planColor }: ROICalculatorProps) {
  const colorMap: Record<string, string> = {
    purple: "text-purple-400",
    blue: "text-blue-400",
    green: "text-green-400",
  };
  const textColor = colorMap[planColor] || "text-blue-400";

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <TrendingUp size={14} className={textColor} />
        ROI試算（投資対効果）
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={12} className="text-red-400" />
            <span className="text-xs text-slate-500">現状の年間教育コスト</span>
          </div>
          <p className="text-lg font-bold text-red-300">{formatCurrency(roi.currentAnnualCost)}</p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={12} className="text-green-400" />
            <span className="text-xs text-slate-500">年間削減見込み額</span>
          </div>
          <p className="text-lg font-bold text-green-300">{formatCurrency(roi.projectedSavings)}</p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={12} className="text-blue-400" />
            <span className="text-xs text-slate-500">生産性向上率</span>
          </div>
          <p className="text-lg font-bold text-blue-300">+{roi.productivityGainPercent}%</p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={12} className="text-yellow-400" />
            <span className="text-xs text-slate-500">投資回収期間</span>
          </div>
          <p className="text-lg font-bold text-yellow-300">{roi.paybackMonths}ヶ月</p>
        </div>
      </div>

      {/* 3-year ROI highlight */}
      <div className={`relative overflow-hidden rounded-xl p-4 border ${{
        purple: "border-purple-500/30 bg-purple-500/10",
        blue: "border-blue-500/30 bg-blue-500/10",
        green: "border-green-500/30 bg-green-500/10",
      }[planColor] ?? "border-blue-500/30 bg-blue-500/10"}`}>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-200">3年間累積ROI</span>
            <span className={`text-3xl font-black ${textColor}`}>{roi.threeYearROIPercent}%</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">{roi.roiNarrative}</p>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10"
             style={{ background: "radial-gradient(circle, white, transparent)" }} />
      </div>

      {/* ROI bar chart visual */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 w-16 text-right">Year 1</span>
          <div className="flex-1 bg-slate-800 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-red-500 to-yellow-500 transition-all"
              style={{ width: `${Math.min(roi.threeYearROIPercent / 3, 100)}%` }}
            />
          </div>
          <span className="text-xs text-slate-400 w-12">{Math.round(roi.threeYearROIPercent / 3)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 w-16 text-right">Year 2</span>
          <div className="flex-1 bg-slate-800 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-yellow-500 to-green-500 transition-all"
              style={{ width: `${Math.min((roi.threeYearROIPercent / 3) * 1.5, 100)}%` }}
            />
          </div>
          <span className="text-xs text-slate-400 w-12">{Math.round((roi.threeYearROIPercent / 3) * 1.5)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 w-16 text-right">Year 3</span>
          <div className="flex-1 bg-slate-800 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500 transition-all"
              style={{ width: `${Math.min(roi.threeYearROIPercent, 100)}%` }}
            />
          </div>
          <span className="text-xs text-slate-400 w-12">{roi.threeYearROIPercent}%</span>
        </div>
      </div>
    </div>
  );
}
