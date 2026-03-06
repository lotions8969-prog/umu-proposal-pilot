"use client";

import { useState, useEffect } from "react";
import {
  X, Settings, Save, RotateCcw, Plus, Trash2, ChevronDown, ChevronUp,
  Building2, DollarSign, Zap, BookOpen, MessageSquare, Shield, Info,
  GripVertical, Check,
} from "lucide-react";
import { loadUMUConfig, saveUMUConfig, resetUMUConfig, DEFAULT_UMU_CONFIG } from "@/lib/umuConfig";
import type { UMUConfig, UMUStrength, UMUSuccessCase, UMUCompetitorRow, UMUOption } from "@/types/umuConfig";
import { v4 as uuidv4 } from "uuid";

interface UMUSettingsPanelProps {
  onConfigChange: (config: UMUConfig) => void;
}

type TabId = "product" | "pricing" | "strengths" | "cases" | "copy" | "competitors";

const TABS: { id: TabId; label: string; icon: React.ElementType; color: string }[] = [
  { id: "product", label: "製品基本情報", icon: Building2, color: "text-blue-400" },
  { id: "pricing", label: "価格マスター", icon: DollarSign, color: "text-green-400" },
  { id: "strengths", label: "強み・機能", icon: Zap, color: "text-yellow-400" },
  { id: "cases", label: "成功事例", icon: BookOpen, color: "text-purple-400" },
  { id: "copy", label: "コピーライティング", icon: MessageSquare, color: "text-orange-400" },
  { id: "competitors", label: "競合比較", icon: Shield, color: "text-red-400" },
];

function InputField({
  label, value, onChange, type = "text", placeholder = "", rows, hint,
}: {
  label: string; value: string | number; onChange: (v: string) => void;
  type?: string; placeholder?: string; rows?: number; hint?: string;
}) {
  return (
    <div>
      <label className="label-dark">{label}</label>
      {rows ? (
        <textarea
          className="input-dark resize-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <input
          type={type}
          className="input-dark"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
      {hint && <p className="text-xs text-slate-600 mt-1">{hint}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-800">
      {children}
    </h3>
  );
}

function CollapsibleItem({
  title, subtitle, onDelete, children,
}: {
  title: string; subtitle?: string; onDelete?: () => void; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-800/30 hover:bg-slate-800/60 transition-colors">
        <GripVertical size={12} className="text-slate-600 flex-shrink-0" />
        <button className="flex-1 flex items-center justify-between text-left" onClick={() => setOpen(!open)}>
          <div>
            <p className="text-sm font-medium text-slate-200">{title}</p>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          {open ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
        </button>
        {onDelete && (
          <button onClick={onDelete} className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0 p-1">
            <Trash2 size={13} />
          </button>
        )}
      </div>
      {open && <div className="p-3 space-y-3 border-t border-slate-800">{children}</div>}
    </div>
  );
}

/* ===== Tab Content Components ===== */

function ProductTab({ config, update }: { config: UMUConfig; update: (p: Partial<UMUConfig["product"]>) => void }) {
  const p = config.product;
  return (
    <div className="space-y-4">
      <SectionTitle>製品・会社基本情報</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <InputField label="製品名" value={p.name} onChange={(v) => update({ name: v })} placeholder="UMU（ユーム）" />
        <InputField label="Webサイト" value={p.website} onChange={(v) => update({ website: v })} placeholder="https://umu.com" />
      </div>
      <InputField label="タグライン" value={p.tagline} onChange={(v) => update({ tagline: v })} placeholder="学習の科学で、人と組織を変える" />
      <InputField label="キーメッセージ" value={p.keyMessage} onChange={(v) => update({ keyMessage: v })} placeholder="「知っている」から「できる」へ" />
      <InputField label="製品説明" value={p.description} onChange={(v) => update({ description: v })} rows={4} placeholder="製品の概要説明..." />
      <InputField label="ターゲット市場" value={p.targetMarket} onChange={(v) => update({ targetMarket: v })} placeholder="従業員100名以上の法人..." />
      <div className="grid grid-cols-2 gap-3">
        <InputField label="ユーザー数" value={p.userCount} onChange={(v) => update({ userCount: v })} placeholder="700万人以上" />
        <InputField label="展開国数" value={p.countries} onChange={(v) => update({ countries: v })} placeholder="150カ国以上" />
      </div>
    </div>
  );
}

function PricingTab({ config, updatePricing }: { config: UMUConfig; updatePricing: (p: Partial<UMUConfig["pricing"]>) => void }) {
  const pr = config.pricing;

  const updatePlan = (pt: "premium" | "standard" | "light", field: string, val: string | number) => {
    updatePricing({ plans: { ...pr.plans, [pt]: { ...pr.plans[pt], [field]: val } } });
  };

  const addOption = () => {
    const newOpt: UMUOption = {
      id: uuidv4(), name: "新オプション", description: "", priceType: "flat", price: 0, defaultFor: [],
    };
    updatePricing({ options: [...pr.options, newOpt] });
  };

  const updateOption = (id: string, field: string, val: unknown) => {
    updatePricing({ options: pr.options.map((o) => o.id === id ? { ...o, [field]: val } : o) });
  };

  const removeOption = (id: string) => {
    updatePricing({ options: pr.options.filter((o) => o.id !== id) });
  };

  const toggleDefaultFor = (id: string, pt: "premium" | "standard" | "light") => {
    const opt = pr.options.find((o) => o.id === id);
    if (!opt) return;
    const newDefault = opt.defaultFor.includes(pt)
      ? opt.defaultFor.filter((p) => p !== pt)
      : [...opt.defaultFor, pt];
    updateOption(id, "defaultFor", newDefault);
  };

  const updateVolumeDiscount = (i: number, field: string, val: number | string) => {
    const updated = pr.volumeDiscounts.map((d, idx) => idx === i ? { ...d, [field]: val } : d);
    updatePricing({ volumeDiscounts: updated });
  };

  const updateContractDiscount = (i: number, field: string, val: number | string) => {
    const updated = pr.contractDiscounts.map((d, idx) => idx === i ? { ...d, [field]: val } : d);
    updatePricing({ contractDiscounts: updated });
  };

  return (
    <div className="space-y-6">
      {/* Plan prices */}
      <div>
        <SectionTitle>プラン別単価</SectionTitle>
        <div className="space-y-3">
          {(["premium", "standard", "light"] as const).map((pt) => {
            const plan = pr.plans[pt];
            const colors = { premium: "text-purple-400", standard: "text-blue-400", light: "text-green-400" };
            return (
              <div key={pt} className="card-dark p-3">
                <p className={`text-xs font-bold uppercase ${colors[pt]} mb-3`}>{plan.label}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-dark">単価（円/ID/月）</label>
                    <input type="number" className="input-dark" value={plan.unitPrice}
                      onChange={(e) => updatePlan(pt, "unitPrice", parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="label-dark">初期費用（円）</label>
                    <input type="number" className="input-dark" value={plan.initialFee}
                      onChange={(e) => updatePlan(pt, "initialFee", parseInt(e.target.value) || 0)} />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="label-dark">プラン説明</label>
                  <input type="text" className="input-dark" value={plan.description}
                    onChange={(e) => updatePlan(pt, "description", e.target.value)} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Options */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>オプション</SectionTitle>
          <button onClick={addOption}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs hover:bg-blue-500/30 transition-all">
            <Plus size={11} />追加
          </button>
        </div>
        <div className="space-y-2">
          {pr.options.map((opt) => (
            <CollapsibleItem
              key={opt.id}
              title={opt.name}
              subtitle={`${opt.priceType === "per_id" ? `¥${opt.price.toLocaleString()}/ID` : `¥${opt.price.toLocaleString()} 固定`}`}
              onDelete={() => removeOption(opt.id)}
            >
              <InputField label="オプション名" value={opt.name} onChange={(v) => updateOption(opt.id, "name", v)} />
              <InputField label="説明" value={opt.description} onChange={(v) => updateOption(opt.id, "description", v)} rows={2} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-dark">価格タイプ</label>
                  <select className="input-dark" value={opt.priceType} onChange={(e) => updateOption(opt.id, "priceType", e.target.value)}>
                    <option value="per_id">ID単価（/ID/月）</option>
                    <option value="flat">固定額（一括）</option>
                  </select>
                </div>
                <div>
                  <label className="label-dark">価格（円）</label>
                  <input type="number" className="input-dark" value={opt.price}
                    onChange={(e) => updateOption(opt.id, "price", parseInt(e.target.value) || 0)} />
                </div>
              </div>
              <div>
                <label className="label-dark">デフォルト適用プラン</label>
                <div className="flex gap-2 mt-1">
                  {(["premium", "standard", "light"] as const).map((pt) => {
                    const selected = opt.defaultFor.includes(pt);
                    return (
                      <button key={pt} onClick={() => toggleDefaultFor(opt.id, pt)}
                        className={`px-2 py-1 rounded-lg text-xs transition-all border ${
                          selected ? "bg-blue-500/30 border-blue-500/50 text-blue-300" : "border-slate-700 text-slate-500 hover:border-slate-600"
                        }`}>
                        {pt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CollapsibleItem>
          ))}
        </div>
      </div>

      {/* Volume discounts */}
      <div>
        <SectionTitle>ボリュームディスカウント</SectionTitle>
        <div className="space-y-2">
          {pr.volumeDiscounts.map((d, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 items-center">
              <div>
                <label className="label-dark">最低ID数</label>
                <input type="number" className="input-dark" value={d.minIDs}
                  onChange={(e) => updateVolumeDiscount(i, "minIDs", parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label className="label-dark">割引率（%）</label>
                <input type="number" className="input-dark" value={Math.round(d.rate * 100)}
                  onChange={(e) => updateVolumeDiscount(i, "rate", (parseInt(e.target.value) || 0) / 100)} />
              </div>
              <div>
                <label className="label-dark">ラベル</label>
                <input type="text" className="input-dark" value={d.label}
                  onChange={(e) => updateVolumeDiscount(i, "label", e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contract discounts */}
      <div>
        <SectionTitle>長期契約ディスカウント</SectionTitle>
        <div className="space-y-2">
          {pr.contractDiscounts.map((d, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 items-center">
              <div>
                <label className="label-dark">契約期間（月）</label>
                <input type="number" className="input-dark" value={d.months}
                  onChange={(e) => updateContractDiscount(i, "months", parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label className="label-dark">割引率（%）</label>
                <input type="number" className="input-dark" value={Math.round(d.rate * 100)}
                  onChange={(e) => updateContractDiscount(i, "rate", (parseInt(e.target.value) || 0) / 100)} />
              </div>
              <div>
                <label className="label-dark">ラベル</label>
                <input type="text" className="input-dark" value={d.label}
                  onChange={(e) => updateContractDiscount(i, "label", e.target.value)} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <label className="label-dark">最大割引率（%）</label>
          <input type="number" className="input-dark w-32" value={Math.round(pr.maxTotalDiscount * 100)}
            onChange={(e) => updatePricing({ maxTotalDiscount: (parseInt(e.target.value) || 0) / 100 })} />
        </div>
      </div>

      <InputField label="価格に関する注意事項" value={pr.notes} onChange={(v) => updatePricing({ notes: v })} rows={2} />
    </div>
  );
}

function StrengthsTab({ config, updateStrengths }: { config: UMUConfig; updateStrengths: (s: UMUStrength[]) => void }) {
  const { strengths } = config;

  const add = () => {
    updateStrengths([...strengths, { id: uuidv4(), title: "新しい強み", description: "", evidence: "", category: "機能" }]);
  };

  const update = (id: string, field: string, val: string) => {
    updateStrengths(strengths.map((s) => s.id === id ? { ...s, [field]: val } : s));
  };

  const remove = (id: string) => updateStrengths(strengths.filter((s) => s.id !== id));

  const CATEGORIES = ["AI機能", "エンゲージメント", "コンテンツ作成", "効果測定", "実績・信頼性", "サポート", "その他"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle>製品強み・機能一覧</SectionTitle>
        <button onClick={add}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/20 text-yellow-400 text-xs hover:bg-yellow-500/30 transition-all">
          <Plus size={11} />追加
        </button>
      </div>
      <div className="space-y-2">
        {strengths.map((s) => (
          <CollapsibleItem key={s.id} title={s.title} subtitle={`[${s.category}] ${s.evidence.slice(0, 40)}...`} onDelete={() => remove(s.id)}>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="タイトル" value={s.title} onChange={(v) => update(s.id, "title", v)} />
              <div>
                <label className="label-dark">カテゴリ</label>
                <select className="input-dark" value={s.category} onChange={(e) => update(s.id, "category", e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <InputField label="説明" value={s.description} onChange={(v) => update(s.id, "description", v)} rows={2} />
            <InputField label="根拠データ・エビデンス" value={s.evidence} onChange={(v) => update(s.id, "evidence", v)}
              placeholder="例: 従来比87%向上（UMU社内調査）" />
          </CollapsibleItem>
        ))}
      </div>
    </div>
  );
}

function CasesTab({ config, updateCases }: { config: UMUConfig; updateCases: (c: UMUSuccessCase[]) => void }) {
  const { successCases } = config;

  const add = () => {
    updateCases([...successCases, {
      id: uuidv4(), industry: "業界", company: "企業名", size: "", challenge: "", solution: "", result: "", quote: "", roi: "", planType: "Standard",
    }]);
  };

  const update = (id: string, field: string, val: string) => {
    updateCases(successCases.map((c) => c.id === id ? { ...c, [field]: val } : c));
  };

  const remove = (id: string) => updateCases(successCases.filter((c) => c.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle>成功事例データベース</SectionTitle>
        <button onClick={add}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-xs hover:bg-purple-500/30 transition-all">
          <Plus size={11} />追加
        </button>
      </div>
      <div className="space-y-2">
        {successCases.map((c) => (
          <CollapsibleItem key={c.id} title={c.company} subtitle={`[${c.industry}] ROI: ${c.roi} - ${c.planType}`} onDelete={() => remove(c.id)}>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="業界" value={c.industry} onChange={(v) => update(c.id, "industry", v)} />
              <InputField label="企業名（仮名OK）" value={c.company} onChange={(v) => update(c.id, "company", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="企業規模" value={c.size} onChange={(v) => update(c.id, "size", v)} placeholder="例: 従業員5,000名" />
              <div>
                <label className="label-dark">適用プラン</label>
                <select className="input-dark" value={c.planType} onChange={(e) => update(c.id, "planType", e.target.value)}>
                  <option value="Premium">Premium</option>
                  <option value="Standard">Standard</option>
                  <option value="Light">Light</option>
                </select>
              </div>
            </div>
            <InputField label="課題" value={c.challenge} onChange={(v) => update(c.id, "challenge", v)} rows={2} />
            <InputField label="解決策" value={c.solution} onChange={(v) => update(c.id, "solution", v)} rows={2} />
            <InputField label="成果（数値を含む）" value={c.result} onChange={(v) => update(c.id, "result", v)} rows={2} />
            <InputField label="ROI" value={c.roi} onChange={(v) => update(c.id, "roi", v)} placeholder="例: 312%（3年間）" />
            <InputField label="担当者コメント（引用）" value={c.quote} onChange={(v) => update(c.id, "quote", v)} rows={2} placeholder="「...」（役職名）" />
          </CollapsibleItem>
        ))}
      </div>
    </div>
  );
}

function CopyTab({ config, updateCopy }: { config: UMUConfig; updateCopy: (c: Partial<UMUConfig["copywriting"]>) => void }) {
  const cp = config.copywriting;

  const updatePhrases = (key: keyof typeof cp, value: string) => {
    const arr = value.split("\n").filter((l) => l.trim() !== "");
    updateCopy({ [key]: arr });
  };

  return (
    <div className="space-y-4">
      <SectionTitle>キャッチコピー・フレーズ集</SectionTitle>
      <div className="space-y-3">
        {[
          { key: "openingPhrases" as const, label: "開口フレーズ（顧客の関心を掴む）", color: "text-blue-400" },
          { key: "transformationPhrases" as const, label: "変革フレーズ（価値を伝える）", color: "text-green-400" },
          { key: "roiPhrases" as const, label: "ROIフレーズ（投資対効果を強調）", color: "text-yellow-400" },
          { key: "urgencyPhrases" as const, label: "緊急性フレーズ（行動を促す）", color: "text-orange-400" },
          { key: "closingPhrases" as const, label: "クロージングフレーズ", color: "text-purple-400" },
        ].map(({ key, label, color }) => (
          <div key={key}>
            <label className={`label-dark ${color}`}>{label}</label>
            <textarea
              className="input-dark resize-none"
              rows={4}
              value={(cp[key] as string[]).join("\n")}
              onChange={(e) => updatePhrases(key, e.target.value)}
              placeholder="1行1フレーズで入力"
            />
            <p className="text-xs text-slate-600 mt-1">{(cp[key] as string[]).length}フレーズ登録中</p>
          </div>
        ))}
      </div>

      <SectionTitle>プラン別タグライン</SectionTitle>
      <InputField label="Premium タグライン" value={cp.premiumTagline} onChange={(v) => updateCopy({ premiumTagline: v })} />
      <InputField label="Standard タグライン" value={cp.standardTagline} onChange={(v) => updateCopy({ standardTagline: v })} />
      <InputField label="Light タグライン" value={cp.lightTagline} onChange={(v) => updateCopy({ lightTagline: v })} />
    </div>
  );
}

function CompetitorsTab({ config, updateCompetitors }: { config: UMUConfig; updateCompetitors: (c: UMUCompetitorRow[]) => void }) {
  const { competitors } = config;

  const add = () => {
    updateCompetitors([...competitors, { id: uuidv4(), feature: "比較項目", umuValue: "", competitorValue: "" }]);
  };

  const update = (id: string, field: string, val: string) => {
    updateCompetitors(competitors.map((c) => c.id === id ? { ...c, [field]: val } : c));
  };

  const remove = (id: string) => updateCompetitors(competitors.filter((c) => c.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle>競合比較データ</SectionTitle>
        <button onClick={add}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30 transition-all">
          <Plus size={11} />追加
        </button>
      </div>
      <div className="space-y-2">
        {competitors.map((c) => (
          <CollapsibleItem key={c.id} title={c.feature} subtitle={`UMU: ${c.umuValue.slice(0, 30)}...`} onDelete={() => remove(c.id)}>
            <InputField label="比較項目" value={c.feature} onChange={(v) => update(c.id, "feature", v)} />
            <InputField label="UMUの強み" value={c.umuValue} onChange={(v) => update(c.id, "umuValue", v)} rows={2} placeholder="UMUが提供できる価値・機能" />
            <InputField label="競合他社の課題" value={c.competitorValue} onChange={(v) => update(c.id, "competitorValue", v)} rows={2} placeholder="競合他社の弱点・制限" />
          </CollapsibleItem>
        ))}
      </div>
    </div>
  );
}

/* ===== Main Panel ===== */

export default function UMUSettingsPanel({ onConfigChange }: UMUSettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("product");
  const [config, setConfig] = useState<UMUConfig>(DEFAULT_UMU_CONFIG);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) setConfig(loadUMUConfig());
  }, [isOpen]);

  const updateConfig = (partial: Partial<UMUConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  };

  const handleSave = () => {
    saveUMUConfig(config);
    onConfigChange(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm("設定をデフォルトに戻しますか？")) {
      const def = resetUMUConfig();
      setConfig(def);
      onConfigChange(def);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-500 text-xs text-slate-400 hover:text-slate-200 transition-all"
      >
        <Settings size={13} />
        <span>UMU情報設定</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          {/* Panel */}
          <div className="relative z-10 ml-auto w-full max-w-4xl flex flex-col bg-[#0D1117] border-l border-slate-800 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center">
                  <Settings size={14} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white">UMU製品情報設定</h2>
                  <p className="text-xs text-slate-500">ここで設定した情報が提案書生成に反映されます</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-all border border-slate-700">
                  <RotateCcw size={12} />デフォルトに戻す
                </button>
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    saved ? "bg-green-600 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"
                  }`}
                >
                  {saved ? <><Check size={12} />保存済み</> : <><Save size={12} />保存する</>}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 text-slate-500 hover:text-slate-200 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left nav */}
              <div className="w-44 flex-shrink-0 border-r border-slate-800 bg-slate-950/50 py-3">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-all ${
                        isActive ? "bg-slate-800/80 text-white border-r-2 border-blue-500" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
                      }`}
                    >
                      <Icon size={14} className={isActive ? tab.color : ""} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}

                {/* Additional context */}
                <div className="mt-4 px-3 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2">
                    <Info size={11} />
                    <span>追加コンテキスト</span>
                  </div>
                  <textarea
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-slate-500 resize-none"
                    rows={5}
                    placeholder="AIへの追加情報（競合状況、特殊要件など）..."
                    value={config.additionalContext}
                    onChange={(e) => updateConfig({ additionalContext: e.target.value })}
                  />
                </div>
              </div>

              {/* Right content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === "product" && (
                  <ProductTab config={config} update={(p) => updateConfig({ product: { ...config.product, ...p } })} />
                )}
                {activeTab === "pricing" && (
                  <PricingTab config={config} updatePricing={(p) => updateConfig({ pricing: { ...config.pricing, ...p } })} />
                )}
                {activeTab === "strengths" && (
                  <StrengthsTab config={config} updateStrengths={(s) => updateConfig({ strengths: s })} />
                )}
                {activeTab === "cases" && (
                  <CasesTab config={config} updateCases={(c) => updateConfig({ successCases: c })} />
                )}
                {activeTab === "copy" && (
                  <CopyTab config={config} updateCopy={(c) => updateConfig({ copywriting: { ...config.copywriting, ...c } })} />
                )}
                {activeTab === "competitors" && (
                  <CompetitorsTab config={config} updateCompetitors={(c) => updateConfig({ competitors: c })} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
