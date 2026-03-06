"use client";

import { useState } from "react";
import { Zap, AlertCircle } from "lucide-react";
import HearingForm from "@/components/HearingForm";
import ProposalDisplay from "@/components/ProposalDisplay";
import MagicCommandBar from "@/components/MagicCommandBar";
import VersionHistory from "@/components/VersionHistory";
import { saveVersion } from "@/lib/versions";
import type { HearingData, GeneratedProposal } from "@/types";

export default function Home() {
  const [proposal, setProposal] = useState<GeneratedProposal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (hearingData: HearingData, command?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hearingData,
          command,
          currentProposal: command && proposal ? { plans: proposal.plans } : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "生成に失敗しました");
        return;
      }

      const newProposal: GeneratedProposal = data.proposal;
      setProposal(newProposal);
      saveVersion(newProposal, command);
    } catch (err) {
      setError("ネットワークエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = (hearingData: HearingData) => {
    generate(hearingData);
  };

  const handleCommand = (command: string) => {
    if (!proposal) return;
    generate(proposal.hearingData, command);
  };

  const handleRestore = (restoredProposal: GeneratedProposal) => {
    setProposal(restoredProposal);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0A0E1A]">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-tight">UMU Proposal Pilot</h1>
            <p className="text-xs text-slate-500">AI提案書生成システム</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {proposal && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400">生成完了</span>
            </div>
          )}
          <VersionHistory onRestore={handleRestore} currentId={proposal?.id} />
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="flex-shrink-0 mx-4 mt-3 p-3 rounded-xl bg-red-950/50 border border-red-800/50 flex items-start gap-2">
          <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-red-300">エラーが発生しました</p>
            <p className="text-xs text-red-400/80 mt-0.5">{error}</p>
            {error.includes("APIキー") && (
              <p className="text-xs text-slate-500 mt-1">
                .env.local に ANTHROPIC_API_KEY を設定してください
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Hearing Form */}
        <div className="w-80 flex-shrink-0 border-r border-slate-800/60 p-4 overflow-hidden flex flex-col">
          <HearingForm onGenerate={handleGenerate} isLoading={isLoading} />
        </div>

        {/* Right panel - Proposal Display */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden p-4">
            {!proposal && !isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-400/10 border border-blue-500/20 flex items-center justify-center mb-6">
                  <Zap size={36} className="text-blue-400/50" />
                </div>
                <h2 className="text-2xl font-black text-slate-300 mb-3">
                  ヒアリング情報を入力して
                  <br />
                  <span className="gradient-text">3プランを瞬時に生成</span>
                </h2>
                <p className="text-sm text-slate-500 max-w-md leading-relaxed mb-6">
                  左のフォームに顧客情報を入力し「3プラン同時生成」をクリック。
                  AIが Premium / Standard / Light の提案書を自動作成します。
                </p>
                <div className="grid grid-cols-3 gap-4 max-w-sm">
                  {[
                    { icon: "👑", label: "Premium", desc: "全機能+専任CS" },
                    { icon: "⚡", label: "Standard", desc: "コスパ最優先" },
                    { icon: "🌱", label: "Light", desc: "小さく始める" },
                  ].map((p) => (
                    <div key={p.label} className="card-dark p-3 text-center">
                      <div className="text-2xl mb-1">{p.icon}</div>
                      <p className="text-xs font-bold text-slate-300">{p.label}</p>
                      <p className="text-xs text-slate-600">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isLoading && !proposal && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap size={20} className="text-blue-400" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-200 mb-2">AI生成中...</h3>
                <p className="text-sm text-slate-500">
                  3プランの提案書を同時に生成しています。<br />
                  30〜60秒お待ちください。
                </p>
                <div className="mt-6 space-y-2 text-xs text-slate-600">
                  <p>📊 成功事例DBを参照中...</p>
                  <p>💡 課題解決ロジックを構築中...</p>
                  <p>💰 ROI試算を計算中...</p>
                </div>
              </div>
            )}

            {proposal && (
              <div className="h-full relative">
                {isLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm rounded-xl">
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-300">コマンドを適用中...</p>
                    </div>
                  </div>
                )}
                <ProposalDisplay proposal={proposal} />
              </div>
            )}
          </div>

          {/* Magic Command Bar */}
          <MagicCommandBar
            onCommand={handleCommand}
            isLoading={isLoading}
            disabled={!proposal}
          />
        </div>
      </div>
    </div>
  );
}
