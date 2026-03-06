"use client";

import { ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import type { BeforeState, AfterState } from "@/types";

interface BeforeAfterVisualizerProps {
  before: BeforeState;
  after: AfterState;
  planColor: string;
}

export default function BeforeAfterVisualizer({ before, after, planColor }: BeforeAfterVisualizerProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full bg-${planColor}-400`} />
        Before / After 比較
      </h3>

      <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-start">
        {/* Before */}
        <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={14} className="text-red-400" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Before</span>
          </div>
          <p className="text-xs text-slate-300 mb-3 leading-relaxed">{before.description}</p>

          {before.metrics.length > 0 && (
            <div className="space-y-2 mb-3">
              {before.metrics.map((m, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">{m.label}</span>
                  <span className="text-xs font-bold text-red-300">{m.value}</span>
                </div>
              ))}
            </div>
          )}

          {before.painPoints && before.painPoints.length > 0 && (
            <ul className="space-y-1">
              {before.painPoints.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="text-red-500 mt-0.5 flex-shrink-0">✕</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center justify-center pt-8 gap-1">
          <ArrowRight size={20} className="text-blue-400" />
          <span className="text-xs text-blue-400 font-bold writing-vertical-lr">UMU</span>
        </div>

        {/* After */}
        <div className="bg-green-950/30 border border-green-900/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={14} className="text-green-400" />
            <span className="text-xs font-bold text-green-400 uppercase tracking-wider">After</span>
          </div>
          <p className="text-xs text-slate-300 mb-3 leading-relaxed">{after.description}</p>

          {after.metrics.length > 0 && (
            <div className="space-y-2 mb-3">
              {after.metrics.map((m, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">{m.label}</span>
                  <span className="text-xs font-bold text-green-300">{m.value}</span>
                </div>
              ))}
            </div>
          )}

          {after.achievements && after.achievements.length > 0 && (
            <ul className="space-y-1">
              {after.achievements.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
