"use client";

import { useState, useEffect } from "react";
import { Zap, AlertCircle, Settings, ArrowRight, Upload, BookOpen, DollarSign } from "lucide-react";
import HearingForm from "@/components/HearingForm";
import ProposalDisplay from "@/components/ProposalDisplay";
import MagicCommandBar from "@/components/MagicCommandBar";
import VersionHistory from "@/components/VersionHistory";
import UMUSettingsPanel from "@/components/UMUSettingsPanel";
import { saveVersion } from "@/lib/versions";
import { loadUMUConfig, isUserConfigured } from "@/lib/umuConfig";
import type { HearingData, GeneratedProposal } from "@/types";
import type { UMUConfig } from "@/types/umuConfig";

export default function Home() {
  const [proposal, setProposal] = useState<GeneratedProposal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [umuConfig, setUmuConfig] = useState<UMUConfig | null>(null);
  const [configured, setConfigured] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const config = loadUMUConfig();
    setUmuConfig(config);
    setConfigured(isUserConfigured());
  }, []);

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
          umuConfig,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "生成に失敗しました"); return; }
      const newProposal: GeneratedProposal = data.proposal;
      setProposal(newProposal);
      saveVersion(newProposal, command);
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = (hearingData: HearingData) => generate(hearingData);
  const handleCommand = (command: string) => { if (!proposal) return; generate(proposal.hearingData, command); };
  const handleRestore = (p: GeneratedProposal) => setProposal(p);
  const handleConfigChange = (config: UMUConfig) => {
    setUmuConfig(config);
    setConfigured(true);
  };

  // Accurate counts from actual config (0 when not set)
  const strengthsCount = umuConfig?.strengths.length ?? 0;
  const casesCount = umuConfig?.successCases.length ?? 0;
  const competitorsCount = umuConfig?.competitors.length ?? 0;
  const hasPricing = (umuConfig?.pricing.plans.premium.unitPrice ?? 0) > 0;

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

        <div className="flex items-center gap-2">
          {/* Accurate status — only shows when actually configured */}
          {configured && (
            <div className="hidden sm:flex items-center gap-3 mr-2 text-xs border-r border-slate-800 pr-3">
              <span className={strengthsCount > 0 ? "text-yellow-400" : "text-slate-700"}>
                強み {strengthsCount}件
              </span>
              <span className={casesCount > 0 ? "text-purple-400" : "text-slate-700"}>
                事例 {casesCount}件
              </span>
              <span className={competitorsCount > 0 ? "text-red-400" : "text-slate-700"}>
                競合 {competitorsCount}件
              </span>
              {hasPricing && <span className="text-green-400">価格設定済み</span>}
            </div>
          )}

          {proposal && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400">生成完了</span>
            </div>
          )}

          <VersionHistory onRestore={handleRestore} currentId={proposal?.id} />

          {/* Settings button */}
          <button
            onClick={() => setSettingsOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              configured
                ? "bg-slate-800/50 border-slate-700 hover:border-slate-500 text-slate-300"
                : "bg-blue-600 border-blue-500 text-white hover:bg-blue-500 animate-pulse"
            }`}
          >
            <Settings size={13} />
            {configured ? "製品情報を編集" : "製品情報を設定する"}
          </button>
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
              <p className="text-xs text-slate-500 mt-1">.env.local に ANTHROPIC_API_KEY を設定してください</p>
            )}
          </div>
        </div>
      )}

      {/* Setup banner — shown when not yet configured */}
      {!configured && (
        <div className="flex-shrink-0 mx-4 mt-3 p-4 rounded-xl bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-blue-800/50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
              <Settings size={18} className="text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white mb-1">まず最初に：UMUの製品情報を登録してください</p>
              <p className="text-xs text-slate-400 mb-3">
                価格表・製品資料・成功事例などを登録することで、AIが顧客に合わせた高精度な提案書を生成できます。
                資料をコピー＆ペーストするだけでAIが自動で読み取ります。
              </p>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {[
                  { icon: Upload, text: "資料を貼り付けてAI自動抽出" },
                  { icon: DollarSign, text: "価格マスターを登録" },
                  { icon: BookOpen, text: "成功事例を追加" },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Icon size={12} className="text-blue-400" />
                    {text}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setSettingsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg"
              >
                <Settings size={14} />
                製品情報を設定する（まずここから）
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel */}
        <div className="w-80 flex-shrink-0 border-r border-slate-800/60 p-4 overflow-hidden flex flex-col">
          <HearingForm onGenerate={handleGenerate} isLoading={isLoading} />
        </div>

        {/* Right panel */}
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
                  左のフォームに顧客情報を入力して「3プラン同時生成」をクリック。
                  {!configured && <span className="text-blue-400"> まず右上の「製品情報を設定する」から製品情報を登録すると、より精度の高い提案書が生成されます。</span>}
                </p>

                {/* Config status cards */}
                <div className="grid grid-cols-4 gap-3 max-w-lg mb-6">
                  {[
                    { label: "価格", value: hasPricing ? "設定済" : "未設定", color: hasPricing ? "text-green-400" : "text-slate-600", icon: DollarSign },
                    { label: "強み", value: `${strengthsCount}件`, color: strengthsCount > 0 ? "text-yellow-400" : "text-slate-600", icon: Zap },
                    { label: "成功事例", value: `${casesCount}件`, color: casesCount > 0 ? "text-purple-400" : "text-slate-600", icon: BookOpen },
                    { label: "競合比較", value: `${competitorsCount}件`, color: competitorsCount > 0 ? "text-red-400" : "text-slate-600", icon: Settings },
                  ].map(({ label, value, color, icon: Icon }) => (
                    <div key={label} className="card-dark p-3 text-center cursor-pointer hover:border-slate-600 transition-all" onClick={() => setSettingsOpen(true)}>
                      <Icon size={14} className={`mx-auto mb-1 ${color}`} />
                      <p className={`text-sm font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {!configured && (
                  <button onClick={() => setSettingsOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-300 text-sm font-semibold hover:bg-blue-600/30 transition-all mb-4">
                    <Settings size={14} />製品情報を登録する（推奨）<ArrowRight size={14} />
                  </button>
                )}

                <div className="grid grid-cols-3 gap-4 max-w-sm mt-2">
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
                <p className="text-sm text-slate-500">3プランの提案書を同時に生成しています。<br />30〜60秒お待ちください。</p>
                <div className="mt-6 space-y-2 text-xs text-slate-600">
                  {strengthsCount > 0 && <p>💡 登録済み強み（{strengthsCount}件）をもとに課題解決ロジックを構築中...</p>}
                  {casesCount > 0 && <p>📊 成功事例DB（{casesCount}件）から類似事例を参照中...</p>}
                  {hasPricing && <p>💰 登録済み価格マスターでROI試算を計算中...</p>}
                  {!configured && <p>⚡ 製品情報未設定のため汎用情報で生成中...</p>}
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
                <ProposalDisplay proposal={proposal} umuConfig={umuConfig ?? undefined} />
              </div>
            )}
          </div>

          <MagicCommandBar onCommand={handleCommand} isLoading={isLoading} disabled={!proposal} />
        </div>
      </div>

      {/* Settings Panel */}
      <UMUSettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onConfigChange={handleConfigChange}
      />
    </div>
  );
}
