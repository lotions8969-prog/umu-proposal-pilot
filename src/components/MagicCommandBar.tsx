"use client";

import { useState } from "react";
import { Wand2, ChevronRight, Sparkles } from "lucide-react";

interface MagicCommandBarProps {
  onCommand: (command: string) => void;
  isLoading: boolean;
  disabled: boolean;
}

const PRESET_COMMANDS = [
  { label: "熱量UP", command: "もっと情熱的で感情に訴えるトーンに変更してください" },
  { label: "役員向け", command: "役員・CFO向けに定量データとROIを前面に出した内容に変更してください" },
  { label: "図解重視", command: "図解・ビジュアル表現を増やし、視覚的にわかりやすい内容に変更してください" },
  { label: "簡潔に", command: "より簡潔で要点を絞った内容に変更してください" },
  { label: "競合強調", command: "競合他社との差別化ポイントをより強く打ち出した内容に変更してください" },
  { label: "緊急性↑", command: "導入を急ぐべき理由と緊急性をより強調した内容に変更してください" },
  { label: "事例追加", command: "より具体的な成功事例と数値データを追加してください" },
  { label: "現場向け", command: "現場担当者が共感しやすい言葉とユースケースに変更してください" },
];

export default function MagicCommandBar({ onCommand, isLoading, disabled }: MagicCommandBarProps) {
  const [command, setCommand] = useState("");
  const [showPresets, setShowPresets] = useState(false);

  const handleSubmit = () => {
    if (!command.trim() || isLoading || disabled) return;
    onCommand(command.trim());
    setCommand("");
  };

  const handlePreset = (preset: string) => {
    setCommand(preset);
    setShowPresets(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-slate-800 bg-slate-950/80 backdrop-blur-sm">
      {/* Preset commands */}
      {showPresets && (
        <div className="px-4 pt-3 pb-2 flex flex-wrap gap-2">
          {PRESET_COMMANDS.map((p) => (
            <button
              key={p.label}
              onClick={() => handlePreset(p.command)}
              className="px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs hover:bg-purple-500/30 transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => setShowPresets(!showPresets)}
          disabled={disabled}
          className={`flex-shrink-0 p-2 rounded-lg transition-all ${
            showPresets
              ? "bg-purple-500/30 text-purple-300"
              : "bg-slate-800 text-slate-400 hover:text-slate-200"
          } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
          title="プリセットコマンド"
        >
          <Sparkles size={16} />
        </button>

        <div className="flex-1 flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/30 transition-all">
          <Wand2 size={14} className="text-purple-400 flex-shrink-0" />
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isLoading}
            placeholder={
              disabled
                ? "まず提案書を生成してください"
                : "マジック・コマンド: 「もっと情熱的なトーンに」「役員向けに定量データ重視で」..."
            }
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none disabled:cursor-not-allowed"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!command.trim() || isLoading || disabled}
          className={`flex-shrink-0 p-2 rounded-xl transition-all ${
            command.trim() && !isLoading && !disabled
              ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-500 hover:to-purple-400 shadow-lg"
              : "bg-slate-800 text-slate-600 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <ChevronRight size={16} />
          )}
        </button>
      </div>

      {!disabled && (
        <p className="text-xs text-slate-700 px-4 pb-2">
          Enterで送信 • 抽象的な指示でもAIが反映します
        </p>
      )}
    </div>
  );
}
