"use client";

import { useState } from "react";
import { Crown, Layers, Leaf, Quote, ChevronRight, Star, Calendar } from "lucide-react";
import type { GeneratedProposal, ProposalPlan } from "@/types";
import type { UMUConfig } from "@/types/umuConfig";
import BeforeAfterVisualizer from "./BeforeAfterVisualizer";
import ROICalculator from "./ROICalculator";
import PricingTable from "./PricingTable";
import CompetitorTable from "./CompetitorTable";

interface ProposalDisplayProps {
  proposal: GeneratedProposal;
  umuConfig?: UMUConfig;
}

const PLAN_CONFIG = {
  Premium: {
    icon: Crown,
    color: "purple",
    gradient: "from-purple-600 to-purple-800",
    bg: "bg-purple-500/10",
    border: "border-purple-500/40",
    text: "text-purple-400",
    badge: "badge-premium",
    tabActive: "bg-purple-600 text-white",
    tabInactive: "text-purple-400 hover:bg-purple-500/10",
  },
  Standard: {
    icon: Layers,
    color: "blue",
    gradient: "from-blue-600 to-blue-800",
    bg: "bg-blue-500/10",
    border: "border-blue-500/40",
    text: "text-blue-400",
    badge: "badge-standard",
    tabActive: "bg-blue-600 text-white",
    tabInactive: "text-blue-400 hover:bg-blue-500/10",
  },
  Light: {
    icon: Leaf,
    color: "green",
    gradient: "from-green-600 to-green-800",
    bg: "bg-green-500/10",
    border: "border-green-500/40",
    text: "text-green-400",
    badge: "badge-light",
    tabActive: "bg-green-600 text-white",
    tabInactive: "text-green-400 hover:bg-green-500/10",
  },
};

type PlanType = "Premium" | "Standard" | "Light";

export default function ProposalDisplay({ proposal, umuConfig }: ProposalDisplayProps) {
  const [activeTab, setActiveTab] = useState<PlanType>("Premium");

  const activePlan = proposal.plans.find((p) => p.planType === activeTab);
  if (!activePlan) return null;

  const config = PLAN_CONFIG[activeTab];
  const Icon = config.icon;

  return (
    <div className="h-full flex flex-col">
      {/* Tab selector */}
      <div className="flex gap-2 mb-4">
        {(["Premium", "Standard", "Light"] as PlanType[]).map((planType) => {
          const plan = proposal.plans.find((p) => p.planType === planType);
          if (!plan) return null;
          const cfg = PLAN_CONFIG[planType];
          const PlanIcon = cfg.icon;
          const isActive = activeTab === planType;
          return (
            <button
              key={planType}
              onClick={() => setActiveTab(planType)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border
                ${isActive ? `${cfg.tabActive} border-transparent shadow-lg` : `${cfg.tabInactive} border-slate-800`}`}
            >
              <PlanIcon size={13} />
              <span>{planType}</span>
            </button>
          );
        })}
      </div>

      {/* Plan content */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-1 animate-fade-in">
        {/* Header */}
        <div className={`rounded-2xl p-5 ${config.bg} border ${config.border} relative overflow-hidden`}>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white ${config.badge}`}>
                <Icon size={11} />
                {activeTab} Plan
              </span>
            </div>
            <h2 className="text-xl font-black text-white leading-tight mb-1">{activePlan.title}</h2>
            <p className={`text-sm font-semibold ${config.text} mb-3`}>{activePlan.tagline}</p>

            {/* Killer phrase */}
            <div className={`${config.bg} border ${config.border} rounded-xl p-3 backdrop-blur-sm`}>
              <div className="flex items-start gap-2">
                <Quote size={14} className={`${config.text} flex-shrink-0 mt-0.5`} />
                <p className={`text-sm font-bold ${config.text} italic leading-relaxed`}>
                  {activePlan.killerPhrase}
                </p>
              </div>
            </div>
          </div>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
               style={{ background: "radial-gradient(circle, white, transparent)" }} />
        </div>

        {/* Executive Summary */}
        <div className="card-dark p-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Star size={12} className={config.text} />
            エグゼクティブサマリー
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">{activePlan.executiveSummary}</p>
        </div>

        {/* Before / After */}
        <div className="card-dark p-4">
          <BeforeAfterVisualizer
            before={activePlan.before}
            after={activePlan.after}
            planColor={config.color}
          />
        </div>

        {/* Key Features */}
        <div className="card-dark p-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ChevronRight size={14} className={config.text} />
            主要機能・提供価値
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {activePlan.keyFeatures.map((feature, i) => (
              <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-lg ${config.bg}`}>
                <span className={`w-5 h-5 rounded-full ${config.badge} flex items-center justify-center text-white text-xs flex-shrink-0 font-bold`}>
                  {i + 1}
                </span>
                <span className="text-sm text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ROI Calculator */}
        <div className="card-dark p-4">
          <ROICalculator roi={activePlan.roiAnalysis} planColor={config.color} />
        </div>

        {/* Pricing */}
        <div className="card-dark p-4">
          <PricingTable pricing={activePlan.pricing} planColor={config.color} umuConfig={umuConfig} />
        </div>

        {/* Implementation Timeline */}
        <div className="card-dark p-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Calendar size={14} className={config.text} />
            導入ロードマップ
          </h3>
          <div className="space-y-3">
            {activePlan.implementationTimeline.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full ${config.badge} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {item.month}
                  </div>
                  {i < activePlan.implementationTimeline.length - 1 && (
                    <div className="w-px flex-1 bg-slate-700 mt-1" />
                  )}
                </div>
                <div className="pb-3">
                  <p className="text-xs font-bold text-slate-200">{item.milestone}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Competitor Comparison */}
        {activePlan.competitorComparison && activePlan.competitorComparison.length > 0 && (
          <div className="card-dark p-4">
            <CompetitorTable rows={activePlan.competitorComparison} planColor={config.color} />
          </div>
        )}

        {/* Success Story */}
        <div className={`rounded-2xl p-5 ${config.bg} border ${config.border}`}>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Star size={12} className="text-yellow-400" />
            類似企業の成功事例
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${config.badge} text-white font-semibold`}>
                {activePlan.successStory.industry}
              </span>
              <span className="text-sm font-bold text-slate-200">{activePlan.successStory.company}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              <span className="text-slate-500">課題：</span>{activePlan.successStory.challenge}
            </p>
            <p className="text-xs text-green-300 font-semibold leading-relaxed">
              ▶ {activePlan.successStory.result}
            </p>
            <div className={`${config.bg} rounded-xl p-3 border ${config.border} mt-2`}>
              <div className="flex items-start gap-2">
                <Quote size={12} className={`${config.text} flex-shrink-0 mt-0.5`} />
                <p className="text-xs text-slate-300 italic leading-relaxed">{activePlan.successStory.quote}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
