"use client";

import { useState } from "react";
import { Building2, Users, Target, DollarSign, Calendar, Briefcase, Star, FileText, ChevronDown, ChevronUp, Zap } from "lucide-react";
import type { HearingData } from "@/types";

interface HearingFormProps {
  onGenerate: (data: HearingData) => void;
  isLoading: boolean;
}

const DEFAULT_DATA: HearingData = {
  companyName: "",
  industry: "",
  employeeCount: 0,
  targetLearners: 0,
  currentChallenges: "",
  learningGoals: "",
  budget: "",
  timeline: "",
  competitorProducts: "",
  keyStakeholders: "",
  successMetrics: "",
  additionalNotes: "",
};

const DEMO_DATA: HearingData = {
  companyName: "株式会社サンプルテクノロジー",
  industry: "IT・SaaS",
  employeeCount: 1200,
  targetLearners: 400,
  currentChallenges: "急速な採用拡大（年200名）でオンボーディングが追いつかない。新人が戦力化するまで6ヶ月かかる。マネージャー研修も属人化しており、OJTの質がばらばら。",
  learningGoals: "新人オンボーディング期間を3ヶ月以内に短縮。管理職のマネジメントスキル標準化。全社的なDXリテラシー向上。",
  budget: "年間2,000〜3,000万円",
  timeline: "3ヶ月以内に導入開始",
  competitorProducts: "現在はConfluenceとYouTubeで自社運用",
  keyStakeholders: "CHRO、人事部長、IT部門長",
  successMetrics: "オンボーディング期間50%短縮、新人90日定着率90%以上、研修満足度85点以上",
  additionalNotes: "経営陣へのROI説明が重要。セキュリティ要件厳しい（ISO27001取得必須）。",
};

const INDUSTRY_OPTIONS = [
  "IT・テクノロジー", "製造業", "金融・保険", "小売・流通", "医療・ヘルスケア",
  "不動産・建設", "教育", "コンサルティング", "エネルギー", "食品・飲料", "その他",
];

const BUDGET_OPTIONS = [
  "500万円未満", "500〜1,000万円", "1,000〜2,000万円", "2,000〜5,000万円", "5,000万円以上",
];

const TIMELINE_OPTIONS = [
  "1ヶ月以内", "3ヶ月以内", "6ヶ月以内", "今期中", "来期以降", "未定",
];

export default function HearingForm({ onGenerate, isLoading }: HearingFormProps) {
  const [data, setData] = useState<HearingData>(DEFAULT_DATA);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = (field: keyof HearingData, value: string | number) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(data);
  };

  const loadDemo = () => {
    setData(DEMO_DATA);
    setShowAdvanced(true);
  };

  const isValid = data.companyName && data.industry && data.targetLearners > 0 && data.currentChallenges;

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          ヒアリング情報入力
        </h2>
        <button
          type="button"
          onClick={loadDemo}
          className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all border border-blue-500/30"
        >
          デモデータ
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {/* Basic Info */}
        <div className="card-dark p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={14} className="text-blue-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">基本情報</span>
          </div>

          <div>
            <label className="label-dark">会社名 *</label>
            <input
              type="text"
              className="input-dark"
              placeholder="例: 株式会社○○テクノロジー"
              value={data.companyName}
              onChange={(e) => update("companyName", e.target.value)}
            />
          </div>

          <div>
            <label className="label-dark">業界 *</label>
            <select
              className="input-dark"
              value={data.industry}
              onChange={(e) => update("industry", e.target.value)}
            >
              <option value="">選択してください</option>
              {INDUSTRY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-dark flex items-center gap-1">
                <Users size={11} /> 従業員数
              </label>
              <input
                type="number"
                className="input-dark"
                placeholder="1000"
                value={data.employeeCount || ""}
                onChange={(e) => update("employeeCount", parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="label-dark flex items-center gap-1">
                <Target size={11} /> 対象学習者数 *
              </label>
              <input
                type="number"
                className="input-dark"
                placeholder="200"
                value={data.targetLearners || ""}
                onChange={(e) => update("targetLearners", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        {/* Challenges & Goals */}
        <div className="card-dark p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Target size={14} className="text-orange-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">課題・目標</span>
          </div>

          <div>
            <label className="label-dark">現状の課題 *</label>
            <textarea
              className="input-dark resize-none"
              rows={4}
              placeholder="例: 研修コストが高い、効果が見えない、現場で活かされない..."
              value={data.currentChallenges}
              onChange={(e) => update("currentChallenges", e.target.value)}
            />
          </div>

          <div>
            <label className="label-dark">学習・研修の目標</label>
            <textarea
              className="input-dark resize-none"
              rows={3}
              placeholder="例: 新人オンボーディング期間50%短縮、管理職スキル標準化..."
              value={data.learningGoals}
              onChange={(e) => update("learningGoals", e.target.value)}
            />
          </div>
        </div>

        {/* Budget & Timeline */}
        <div className="card-dark p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className="text-green-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">予算・導入時期</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-dark">年間予算感</label>
              <select
                className="input-dark"
                value={data.budget}
                onChange={(e) => update("budget", e.target.value)}
              >
                <option value="">選択してください</option>
                {BUDGET_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-dark">導入希望時期</label>
              <select
                className="input-dark"
                value={data.timeline}
                onChange={(e) => update("timeline", e.target.value)}
              >
                <option value="">選択してください</option>
                {TIMELINE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Advanced */}
        <div className="card-dark overflow-hidden">
          <button
            type="button"
            className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <div className="flex items-center gap-2">
              <Briefcase size={14} />
              <span className="uppercase tracking-wider">詳細情報（任意）</span>
            </div>
            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showAdvanced && (
            <div className="px-4 pb-4 space-y-3 border-t border-slate-800">
              <div className="pt-3">
                <label className="label-dark">競合・現在のツール</label>
                <input
                  type="text"
                  className="input-dark"
                  placeholder="例: SuccessFactors、社内LMS、動画研修など"
                  value={data.competitorProducts}
                  onChange={(e) => update("competitorProducts", e.target.value)}
                />
              </div>

              <div>
                <label className="label-dark flex items-center gap-1">
                  <Star size={11} /> キーステークホルダー
                </label>
                <input
                  type="text"
                  className="input-dark"
                  placeholder="例: CHRO、人事部長、経営企画"
                  value={data.keyStakeholders}
                  onChange={(e) => update("keyStakeholders", e.target.value)}
                />
              </div>

              <div>
                <label className="label-dark">成功の定義・KPI</label>
                <textarea
                  className="input-dark resize-none"
                  rows={2}
                  placeholder="例: 研修完了率90%、新人戦力化3ヶ月以内..."
                  value={data.successMetrics}
                  onChange={(e) => update("successMetrics", e.target.value)}
                />
              </div>

              <div>
                <label className="label-dark flex items-center gap-1">
                  <FileText size={11} /> 補足・特記事項
                </label>
                <textarea
                  className="input-dark resize-none"
                  rows={2}
                  placeholder="例: セキュリティ要件、経営陣へのROI説明が重要..."
                  value={data.additionalNotes}
                  onChange={(e) => update("additionalNotes", e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generate Button */}
      <div className="mt-4 pt-4 border-t border-slate-800">
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
            ${isValid && !isLoading
              ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg glow-blue"
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>AI生成中...</span>
            </>
          ) : (
            <>
              <Zap size={16} />
              <span>3プラン同時生成</span>
            </>
          )}
        </button>
        {!isValid && (
          <p className="text-xs text-slate-600 text-center mt-2">
            * 会社名・業界・対象学習者数・課題は必須です
          </p>
        )}
      </div>
    </form>
  );
}
