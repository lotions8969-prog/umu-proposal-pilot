"use client";

import { useState, useEffect, useRef } from "react";
import {
  X, Settings, Save, RotateCcw, Plus, Trash2, ChevronDown, ChevronUp,
  Building2, DollarSign, Zap, BookOpen, MessageSquare, Shield,
  Upload, Sparkles, Check, AlertCircle, FileText, CheckCircle2,
  GripVertical, ArrowRight, Loader2,
} from "lucide-react";
import {
  loadUMUConfig, saveUMUConfig, resetUMUConfig,
  SAMPLE_UMU_CONFIG, EMPTY_UMU_CONFIG, getConfigCompleteness,
} from "@/lib/umuConfig";
import type { UMUConfig, UMUStrength, UMUSuccessCase, UMUCompetitorRow, UMUOption } from "@/types/umuConfig";
import { v4 as uuidv4 } from "uuid";

interface UMUSettingsPanelProps {
  onConfigChange: (config: UMUConfig) => void;
  isOpen: boolean;
  onClose: () => void;
}

type TabId = "upload" | "product" | "pricing" | "strengths" | "cases" | "copy" | "competitors";

/* ===== Helpers ===== */

function InputField({ label, value, onChange, type = "text", placeholder = "", rows, hint }: {
  label: string; value: string | number; onChange: (v: string) => void;
  type?: string; placeholder?: string; rows?: number; hint?: string;
}) {
  return (
    <div>
      <label className="label-dark">{label}</label>
      {rows ? (
        <textarea className="input-dark resize-none" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} />
      ) : (
        <input type={type} className="input-dark" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
      {hint && <p className="text-xs text-slate-600 mt-1">{hint}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-800">{children}</h3>;
}

function CollapsibleItem({ title, subtitle, onDelete, children }: {
  title: string; subtitle?: string; onDelete?: () => void; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-800/30">
        <GripVertical size={12} className="text-slate-600 flex-shrink-0" />
        <button className="flex-1 flex items-center justify-between text-left" onClick={() => setOpen(!open)}>
          <div>
            <p className="text-sm font-medium text-slate-200">{title}</p>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          {open ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
        </button>
        {onDelete && (
          <button onClick={onDelete} className="text-slate-600 hover:text-red-400 transition-colors p-1"><Trash2 size={13} /></button>
        )}
      </div>
      {open && <div className="p-3 space-y-3 border-t border-slate-800">{children}</div>}
    </div>
  );
}

/* ===== Upload & Extract Tab ===== */

function UploadTab({ config, onMerge }: { config: UMUConfig; onMerge: (extracted: Partial<UMUConfig>) => void }) {
  const [text, setText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  type ExtractSummary = { product: boolean; pricingFilled: boolean; strengthsCount: number; casesCount: number; competitorsCount: number; phrasesCount: number; };
  const [result, setResult] = useState<{ summary: ExtractSummary } | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setText(ev.target?.result as string);
    reader.readAsText(file, "utf-8");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setText(ev.target?.result as string);
    reader.readAsText(file, "utf-8");
  };

  const handleExtract = async () => {
    if (!text.trim()) return;
    setIsExtracting(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "抽出に失敗しました"); return; }
      setResult(data);
      onMerge(data.extracted);
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setIsExtracting(false);
    }
  };

  const completeness = getConfigCompleteness(config);
  const filledCount = Object.values(completeness).filter(Boolean).length;
  const totalCount = Object.values(completeness).length;

  return (
    <div className="space-y-6">
      {/* Current status */}
      <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">現在の設定状況</h3>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            filledCount === totalCount ? "bg-green-500/20 text-green-400" :
            filledCount > 0 ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"
          }`}>
            {filledCount}/{totalCount} 完了
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "product", label: "製品情報", icon: Building2 },
            { key: "pricing", label: "価格設定", icon: DollarSign },
            { key: "strengths", label: `強み (${config.strengths.length}件)`, icon: Zap },
            { key: "successCases", label: `成功事例 (${config.successCases.length}件)`, icon: BookOpen },
            { key: "copywriting", label: "フレーズ", icon: MessageSquare },
            { key: "competitors", label: `競合比較 (${config.competitors.length}件)`, icon: Shield },
          ].map(({ key, label, icon: Icon }) => {
            const ok = completeness[key as keyof typeof completeness];
            return (
              <div key={key} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs ${
                ok ? "bg-green-500/10 text-green-400" : "bg-slate-800 text-slate-500"
              }`}>
                {ok ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                <Icon size={10} />
                <span className="truncate">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Upload */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</div>
          <h3 className="text-sm font-bold text-white">製品資料を貼り付け or ファイルアップロード</h3>
        </div>
        <p className="text-xs text-slate-500 mb-3 ml-8">
          価格表・製品資料・機能説明・成功事例など、どんな形式のテキストでも構いません。
          PDFの場合はテキストをコピーして貼り付けてください。
        </p>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !text && fileRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-4 transition-all ${
            text ? "border-blue-500/50 bg-blue-500/5" : "border-slate-700 hover:border-slate-600 cursor-pointer"
          }`}
        >
          <input ref={fileRef} type="file" accept=".txt,.csv,.md,.text" className="hidden" onChange={handleFile} />
          {!text && (
            <div className="text-center py-4">
              <Upload size={28} className="mx-auto mb-2 text-slate-600" />
              <p className="text-sm text-slate-500">ここにファイルをドロップ</p>
              <p className="text-xs text-slate-600 mt-1">または クリックしてファイルを選択（.txt, .csv, .md）</p>
            </div>
          )}
          <textarea
            className="w-full bg-transparent text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none resize-none"
            rows={text ? 10 : 0}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="ここに製品資料のテキストを貼り付けてください..."
          />
          {text && (
            <div className="absolute top-2 right-2 flex gap-1">
              <button onClick={(e) => { e.stopPropagation(); setText(""); }} className="px-2 py-1 rounded bg-slate-700 text-slate-400 text-xs hover:bg-slate-600">クリア</button>
            </div>
          )}
        </div>

        {text && (
          <p className="text-xs text-slate-600 mt-1">{text.length.toLocaleString()}文字 入力済み</p>
        )}
      </div>

      {/* Step 2: Extract */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</div>
          <h3 className="text-sm font-bold text-white">AIで自動抽出</h3>
        </div>
        <p className="text-xs text-slate-500 mb-3 ml-8">
          ボタンを押すと、AIがテキストから価格・強み・事例・フレーズを自動で読み取ります。
        </p>

        <button
          onClick={handleExtract}
          disabled={!text.trim() || isExtracting}
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            text.trim() && !isExtracting
              ? "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-lg"
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
          }`}
        >
          {isExtracting ? (
            <><Loader2 size={16} className="animate-spin" />AIが情報を読み取り中...</>
          ) : (
            <><Sparkles size={16} />AIで自動抽出する</>
          )}
        </button>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-950/50 border border-red-800/50 flex items-center gap-2 text-xs text-red-300">
            <AlertCircle size={13} />{error}
          </div>
        )}

        {result && (
          <div className="mt-3 p-4 rounded-xl bg-green-950/30 border border-green-800/50">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={14} className="text-green-400" />
              <span className="text-sm font-bold text-green-300">抽出完了！以下の情報が設定に反映されました</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {result.summary.product && <div className="flex items-center gap-1.5 text-green-300"><Check size={11} />製品情報</div>}
              {result.summary.pricingFilled && <div className="flex items-center gap-1.5 text-green-300"><Check size={11} />価格情報</div>}
              {result.summary.strengthsCount > 0 && <div className="flex items-center gap-1.5 text-green-300"><Check size={11} />強み {result.summary.strengthsCount}件</div>}
              {result.summary.casesCount > 0 && <div className="flex items-center gap-1.5 text-green-300"><Check size={11} />成功事例 {result.summary.casesCount}件</div>}
              {result.summary.competitorsCount > 0 && <div className="flex items-center gap-1.5 text-green-300"><Check size={11} />競合比較 {result.summary.competitorsCount}件</div>}
              {result.summary.phrasesCount > 0 && <div className="flex items-center gap-1.5 text-green-300"><Check size={11} />フレーズ {result.summary.phrasesCount}個</div>}
            </div>
            <p className="text-xs text-slate-500 mt-2">各タブで内容を確認・編集してから「保存する」を押してください。</p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-slate-800" />
        <span className="text-xs text-slate-600">または</span>
        <div className="flex-1 border-t border-slate-800" />
      </div>

      {/* Sample data */}
      <div className="card-dark p-4">
        <div className="flex items-start gap-3">
          <FileText size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-white mb-1">サンプルデータを読み込む</p>
            <p className="text-xs text-slate-500 mb-3">
              UMUのサンプル製品情報（価格・強み・事例・フレーズ）を一括で読み込みます。
              実際のデータに合わせて後から編集してください。
            </p>
            <button
              onClick={() => onMerge(SAMPLE_UMU_CONFIG)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-semibold hover:bg-blue-500/30 transition-all"
            >
              <ArrowRight size={14} />
              サンプルデータを読み込む
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Product Tab ===== */
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
      <InputField label="キーメッセージ（提案書の核となるメッセージ）" value={p.keyMessage} onChange={(v) => update({ keyMessage: v })} placeholder="「知っている」から「できる」へ。" />
      <InputField label="製品説明" value={p.description} onChange={(v) => update({ description: v })} rows={4} placeholder="製品の概要説明..." />
      <InputField label="ターゲット市場" value={p.targetMarket} onChange={(v) => update({ targetMarket: v })} placeholder="従業員100名以上の法人..." />
      <div className="grid grid-cols-2 gap-3">
        <InputField label="ユーザー数" value={p.userCount} onChange={(v) => update({ userCount: v })} placeholder="700万人以上" />
        <InputField label="展開国数" value={p.countries} onChange={(v) => update({ countries: v })} placeholder="150カ国以上" />
      </div>
    </div>
  );
}

/* ===== Pricing Tab ===== */
function PricingTab({ config, updatePricing }: { config: UMUConfig; updatePricing: (p: Partial<UMUConfig["pricing"]>) => void }) {
  const pr = config.pricing;

  const updatePlan = (pt: "premium" | "standard" | "light", field: string, val: string | number) =>
    updatePricing({ plans: { ...pr.plans, [pt]: { ...pr.plans[pt], [field]: val } } });

  const addOption = () => {
    const newOpt: UMUOption = { id: uuidv4(), name: "新オプション", description: "", priceType: "flat", price: 0, defaultFor: [] };
    updatePricing({ options: [...pr.options, newOpt] });
  };

  const updateOption = (id: string, field: string, val: unknown) =>
    updatePricing({ options: pr.options.map((o) => o.id === id ? { ...o, [field]: val } : o) });

  const removeOption = (id: string) => updatePricing({ options: pr.options.filter((o) => o.id !== id) });

  const toggleDefaultFor = (id: string, pt: "premium" | "standard" | "light") => {
    const opt = pr.options.find((o) => o.id === id);
    if (!opt) return;
    const newDefault = opt.defaultFor.includes(pt) ? opt.defaultFor.filter((p) => p !== pt) : [...opt.defaultFor, pt];
    updateOption(id, "defaultFor", newDefault);
  };

  return (
    <div className="space-y-6">
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
                    <label className="label-dark">ID単価（円/ID/月）</label>
                    <input type="number" className="input-dark" value={plan.unitPrice || ""} placeholder="例: 6800"
                      onChange={(e) => updatePlan(pt, "unitPrice", parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="label-dark">初期費用（円）</label>
                    <input type="number" className="input-dark" value={plan.initialFee || ""} placeholder="例: 680000"
                      onChange={(e) => updatePlan(pt, "initialFee", parseInt(e.target.value) || 0)} />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="label-dark">プラン説明</label>
                  <input type="text" className="input-dark" value={plan.description}
                    onChange={(e) => updatePlan(pt, "description", e.target.value)} placeholder="このプランの特徴..." />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>オプション・追加費用</SectionTitle>
          <button onClick={addOption} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs hover:bg-blue-500/30 transition-all">
            <Plus size={11} />追加
          </button>
        </div>
        {pr.options.length === 0 && (
          <div className="text-center py-6 text-slate-600 text-xs border border-dashed border-slate-800 rounded-xl">
            オプションが未登録です。「追加」ボタンで追加してください。
          </div>
        )}
        <div className="space-y-2">
          {pr.options.map((opt) => (
            <CollapsibleItem key={opt.id} title={opt.name}
              subtitle={`${opt.priceType === "per_id" ? `¥${opt.price.toLocaleString()}/ID/月` : `¥${opt.price.toLocaleString()} 固定`}`}
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
                        className={`px-2 py-1 rounded-lg text-xs transition-all border ${selected ? "bg-blue-500/30 border-blue-500/50 text-blue-300" : "border-slate-700 text-slate-500 hover:border-slate-600"}`}>
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

      <div>
        <SectionTitle>ボリューム割引ルール</SectionTitle>
        <div className="space-y-2">
          {pr.volumeDiscounts.map((d, i) => (
            <div key={i} className="grid grid-cols-3 gap-2">
              <div><label className="label-dark">最低ID数</label>
                <input type="number" className="input-dark" value={d.minIDs}
                  onChange={(e) => { const u = [...pr.volumeDiscounts]; u[i] = { ...u[i], minIDs: parseInt(e.target.value) || 0 }; updatePricing({ volumeDiscounts: u }); }} /></div>
              <div><label className="label-dark">割引率（%）</label>
                <input type="number" className="input-dark" value={Math.round(d.rate * 100)}
                  onChange={(e) => { const u = [...pr.volumeDiscounts]; u[i] = { ...u[i], rate: (parseInt(e.target.value) || 0) / 100 }; updatePricing({ volumeDiscounts: u }); }} /></div>
              <div><label className="label-dark">ラベル</label>
                <input type="text" className="input-dark" value={d.label}
                  onChange={(e) => { const u = [...pr.volumeDiscounts]; u[i] = { ...u[i], label: e.target.value }; updatePricing({ volumeDiscounts: u }); }} /></div>
            </div>
          ))}
        </div>
      </div>

      <InputField label="価格に関する注意事項（見積もりに表示）" value={pr.notes} onChange={(v) => updatePricing({ notes: v })} rows={2} placeholder="例: 価格はすべて税抜き表示。消費税10%が別途加算されます。" />
    </div>
  );
}

/* ===== Strengths Tab ===== */
function StrengthsTab({ config, updateStrengths }: { config: UMUConfig; updateStrengths: (s: UMUStrength[]) => void }) {
  const { strengths } = config;
  const add = () => updateStrengths([...strengths, { id: uuidv4(), title: "新しい強み", description: "", evidence: "", category: "機能" }]);
  const update = (id: string, field: string, val: string) => updateStrengths(strengths.map((s) => s.id === id ? { ...s, [field]: val } : s));
  const remove = (id: string) => updateStrengths(strengths.filter((s) => s.id !== id));
  const CATEGORIES = ["AI機能", "エンゲージメント", "コンテンツ作成", "効果測定", "実績・信頼性", "サポート", "価格競争力", "その他"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle>製品強み・機能一覧 ({strengths.length}件)</SectionTitle>
        <button onClick={add} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/20 text-yellow-400 text-xs hover:bg-yellow-500/30 transition-all">
          <Plus size={11} />追加
        </button>
      </div>
      {strengths.length === 0 && (
        <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl">
          <Zap size={28} className="mx-auto mb-2 text-slate-700" />
          <p className="text-slate-600 text-sm mb-1">強みがまだ登録されていません</p>
          <p className="text-slate-700 text-xs">「追加」ボタンで手動追加するか、「アップロード」タブから自動抽出してください</p>
        </div>
      )}
      <div className="space-y-2">
        {strengths.map((s) => (
          <CollapsibleItem key={s.id} title={s.title} subtitle={`[${s.category}] ${s.evidence.slice(0, 40)}${s.evidence.length > 40 ? "..." : ""}`} onDelete={() => remove(s.id)}>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="タイトル" value={s.title} onChange={(v) => update(s.id, "title", v)} />
              <div><label className="label-dark">カテゴリ</label>
                <select className="input-dark" value={s.category} onChange={(e) => update(s.id, "category", e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <InputField label="説明（提案書に使用される詳細）" value={s.description} onChange={(v) => update(s.id, "description", v)} rows={2} />
            <InputField label="根拠データ・エビデンス" value={s.evidence} onChange={(v) => update(s.id, "evidence", v)} placeholder="例: 従来比87%向上（UMU社内調査2023）" />
          </CollapsibleItem>
        ))}
      </div>
    </div>
  );
}

/* ===== Cases Tab ===== */
function CasesTab({ config, updateCases }: { config: UMUConfig; updateCases: (c: UMUSuccessCase[]) => void }) {
  const { successCases } = config;
  const add = () => updateCases([...successCases, { id: uuidv4(), industry: "業界", company: "", size: "", challenge: "", solution: "", result: "", quote: "", roi: "", planType: "Standard" }]);
  const update = (id: string, field: string, val: string) => updateCases(successCases.map((c) => c.id === id ? { ...c, [field]: val } : c));
  const remove = (id: string) => updateCases(successCases.filter((c) => c.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle>成功事例データベース ({successCases.length}件)</SectionTitle>
        <button onClick={add} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-xs hover:bg-purple-500/30 transition-all">
          <Plus size={11} />追加
        </button>
      </div>
      {successCases.length === 0 && (
        <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl">
          <BookOpen size={28} className="mx-auto mb-2 text-slate-700" />
          <p className="text-slate-600 text-sm mb-1">成功事例がまだ登録されていません</p>
          <p className="text-slate-700 text-xs">「追加」ボタンで手動追加するか、「アップロード」タブから自動抽出してください</p>
        </div>
      )}
      <div className="space-y-2">
        {successCases.map((c) => (
          <CollapsibleItem key={c.id} title={c.company || "（未入力）"} subtitle={`[${c.industry}] ROI: ${c.roi} - ${c.planType}`} onDelete={() => remove(c.id)}>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="業界" value={c.industry} onChange={(v) => update(c.id, "industry", v)} />
              <InputField label="企業名（仮名OK）" value={c.company} onChange={(v) => update(c.id, "company", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="企業規模" value={c.size} onChange={(v) => update(c.id, "size", v)} placeholder="例: 従業員5,000名" />
              <div><label className="label-dark">適用プラン</label>
                <select className="input-dark" value={c.planType} onChange={(e) => update(c.id, "planType", e.target.value)}>
                  <option value="Premium">Premium</option><option value="Standard">Standard</option><option value="Light">Light</option>
                </select>
              </div>
            </div>
            <InputField label="課題" value={c.challenge} onChange={(v) => update(c.id, "challenge", v)} rows={2} />
            <InputField label="解決策" value={c.solution} onChange={(v) => update(c.id, "solution", v)} rows={2} />
            <InputField label="成果（具体的な数値を入れると提案に反映されます）" value={c.result} onChange={(v) => update(c.id, "result", v)} rows={2} />
            <InputField label="ROI（例: 312%（3年間）)" value={c.roi} onChange={(v) => update(c.id, "roi", v)} />
            <InputField label="担当者コメント（引用として使用）" value={c.quote} onChange={(v) => update(c.id, "quote", v)} rows={2} placeholder="「...」（役職名）" />
          </CollapsibleItem>
        ))}
      </div>
    </div>
  );
}

/* ===== Copy Tab ===== */
function CopyTab({ config, updateCopy }: { config: UMUConfig; updateCopy: (c: Partial<UMUConfig["copywriting"]>) => void }) {
  const cp = config.copywriting;
  const phraseCount = [...cp.openingPhrases, ...cp.transformationPhrases, ...cp.roiPhrases, ...cp.urgencyPhrases, ...cp.closingPhrases].length;

  const updatePhrases = (key: keyof typeof cp, value: string) => {
    const arr = value.split("\n").filter((l) => l.trim() !== "");
    updateCopy({ [key]: arr });
  };

  return (
    <div className="space-y-4">
      <SectionTitle>キャッチコピー・フレーズ集（合計 {phraseCount}件）</SectionTitle>
      <div className="bg-slate-800/30 rounded-xl p-3 text-xs text-slate-500 mb-4">
        提案書の各所に自動挿入されるキャッチコピーです。1行につき1フレーズを入力してください。
      </div>
      {[
        { key: "openingPhrases" as const, label: "開口フレーズ（顧客の関心を掴む冒頭の言葉）", color: "text-blue-400" },
        { key: "transformationPhrases" as const, label: "変革フレーズ（製品の価値を伝える言葉）", color: "text-green-400" },
        { key: "roiPhrases" as const, label: "ROIフレーズ（投資対効果を強調する言葉）", color: "text-yellow-400" },
        { key: "urgencyPhrases" as const, label: "緊急性フレーズ（今すぐ動く理由）", color: "text-orange-400" },
        { key: "closingPhrases" as const, label: "クロージングフレーズ（締めの言葉）", color: "text-purple-400" },
      ].map(({ key, label, color }) => (
        <div key={key}>
          <label className={`label-dark ${color}`}>{label} ({(cp[key] as string[]).length}件)</label>
          <textarea className="input-dark resize-none" rows={3} value={(cp[key] as string[]).join("\n")}
            onChange={(e) => updatePhrases(key, e.target.value)} placeholder="1行1フレーズで入力（空行は無視されます）" />
        </div>
      ))}
      <SectionTitle>プラン別タグライン</SectionTitle>
      <InputField label="Premium プランのタグライン" value={cp.premiumTagline} onChange={(v) => updateCopy({ premiumTagline: v })} placeholder="学習変革の完全制覇——競合に3年の差をつける..." />
      <InputField label="Standard プランのタグライン" value={cp.standardTagline} onChange={(v) => updateCopy({ standardTagline: v })} placeholder="ROIが証明された成長エンジン——..." />
      <InputField label="Light プランのタグライン" value={cp.lightTagline} onChange={(v) => updateCopy({ lightTagline: v })} placeholder="小さく始めて、大きく育てる——..." />
    </div>
  );
}

/* ===== Competitors Tab ===== */
function CompetitorsTab({ config, updateCompetitors }: { config: UMUConfig; updateCompetitors: (c: UMUCompetitorRow[]) => void }) {
  const { competitors } = config;
  const add = () => updateCompetitors([...competitors, { id: uuidv4(), feature: "比較項目", umuValue: "", competitorValue: "" }]);
  const update = (id: string, field: string, val: string) => updateCompetitors(competitors.map((c) => c.id === id ? { ...c, [field]: val } : c));
  const remove = (id: string) => updateCompetitors(competitors.filter((c) => c.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle>競合比較データ ({competitors.length}件)</SectionTitle>
        <button onClick={add} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30 transition-all">
          <Plus size={11} />追加
        </button>
      </div>
      {competitors.length === 0 && (
        <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl">
          <Shield size={28} className="mx-auto mb-2 text-slate-700" />
          <p className="text-slate-600 text-sm mb-1">競合比較データがまだ登録されていません</p>
          <p className="text-slate-700 text-xs">「追加」ボタンで手動追加するか、「アップロード」タブから自動抽出してください</p>
        </div>
      )}
      <div className="space-y-2">
        {competitors.map((c) => (
          <CollapsibleItem key={c.id} title={c.feature} subtitle={`UMU: ${c.umuValue.slice(0, 30)}${c.umuValue.length > 30 ? "..." : ""}`} onDelete={() => remove(c.id)}>
            <InputField label="比較項目" value={c.feature} onChange={(v) => update(c.id, "feature", v)} placeholder="例: AIフィードバック機能" />
            <InputField label="UMUの強み・特徴" value={c.umuValue} onChange={(v) => update(c.id, "umuValue", v)} rows={2} placeholder="UMUが提供できる価値・優位性..." />
            <InputField label="競合他社の弱点・差異" value={c.competitorValue} onChange={(v) => update(c.id, "competitorValue", v)} rows={2} placeholder="競合他社の制限・課題..." />
          </CollapsibleItem>
        ))}
      </div>
    </div>
  );
}

/* ===== Main Panel ===== */

const TABS: { id: TabId; label: string; icon: React.ElementType; color: string; isNew?: boolean }[] = [
  { id: "upload", label: "アップロード", icon: Upload, color: "text-blue-400", isNew: true },
  { id: "product", label: "製品基本情報", icon: Building2, color: "text-cyan-400" },
  { id: "pricing", label: "価格マスター", icon: DollarSign, color: "text-green-400" },
  { id: "strengths", label: "強み・機能", icon: Zap, color: "text-yellow-400" },
  { id: "cases", label: "成功事例", icon: BookOpen, color: "text-purple-400" },
  { id: "copy", label: "コピーライティング", icon: MessageSquare, color: "text-orange-400" },
  { id: "competitors", label: "競合比較", icon: Shield, color: "text-red-400" },
];

export default function UMUSettingsPanel({ onConfigChange, isOpen, onClose }: UMUSettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("upload");
  const [config, setConfig] = useState<UMUConfig>(EMPTY_UMU_CONFIG);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) setConfig(loadUMUConfig());
  }, [isOpen]);

  const updateConfig = (partial: Partial<UMUConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  };

  const mergeConfig = (extracted: Partial<UMUConfig>) => {
    setConfig((prev) => {
      const merged = { ...prev };
      if (extracted.product) merged.product = { ...prev.product, ...extracted.product };
      if (extracted.pricing) {
        merged.pricing = {
          ...prev.pricing,
          ...extracted.pricing,
          plans: { ...prev.pricing.plans, ...(extracted.pricing.plans ?? {}) },
          options: extracted.pricing.options?.length ? extracted.pricing.options : prev.pricing.options,
        };
      }
      if (extracted.strengths?.length) merged.strengths = [...prev.strengths, ...extracted.strengths.filter(s => !prev.strengths.find(e => e.title === s.title))];
      if (extracted.successCases?.length) merged.successCases = [...prev.successCases, ...extracted.successCases.filter(c => !prev.successCases.find(e => e.company === c.company))];
      if (extracted.competitors?.length) merged.competitors = [...prev.competitors, ...extracted.competitors.filter(r => !prev.competitors.find(e => e.feature === r.feature))];
      if (extracted.copywriting) {
        merged.copywriting = {
          ...prev.copywriting,
          openingPhrases: Array.from(new Set([...prev.copywriting.openingPhrases, ...(extracted.copywriting.openingPhrases ?? [])])),
          transformationPhrases: Array.from(new Set([...prev.copywriting.transformationPhrases, ...(extracted.copywriting.transformationPhrases ?? [])])),
          roiPhrases: Array.from(new Set([...prev.copywriting.roiPhrases, ...(extracted.copywriting.roiPhrases ?? [])])),
          urgencyPhrases: Array.from(new Set([...prev.copywriting.urgencyPhrases, ...(extracted.copywriting.urgencyPhrases ?? [])])),
          closingPhrases: Array.from(new Set([...prev.copywriting.closingPhrases, ...(extracted.copywriting.closingPhrases ?? [])])),
          premiumTagline: extracted.copywriting.premiumTagline || prev.copywriting.premiumTagline,
          standardTagline: extracted.copywriting.standardTagline || prev.copywriting.standardTagline,
          lightTagline: extracted.copywriting.lightTagline || prev.copywriting.lightTagline,
        };
      }
      if (extracted.additionalContext) merged.additionalContext = extracted.additionalContext;
      return merged;
    });
  };

  const handleSave = () => {
    saveUMUConfig(config);
    onConfigChange(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm("設定を初期状態（空）に戻しますか？")) {
      const empty = resetUMUConfig();
      setConfig(empty);
      onConfigChange(empty);
    }
  };

  if (!isOpen) return null;

  const completeness = getConfigCompleteness(config);
  const filledCount = Object.values(completeness).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 ml-auto w-full max-w-4xl flex flex-col bg-[#0D1117] border-l border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center">
              <Settings size={14} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">UMU製品情報設定</h2>
              <p className="text-xs text-slate-500">ここで設定した情報が提案書生成に反映されます（設定済み: {filledCount}/6）</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-all border border-slate-700">
              <RotateCcw size={12} />リセット
            </button>
            <button onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${saved ? "bg-green-600 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"}`}>
              {saved ? <><Check size={12} />保存済み</> : <><Save size={12} />保存する</>}
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-slate-200 transition-colors"><X size={18} /></button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left nav */}
          <div className="w-48 flex-shrink-0 border-r border-slate-800 bg-slate-950/50 py-3 overflow-y-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const getCount = () => {
                if (tab.id === "strengths") return config.strengths.length;
                if (tab.id === "cases") return config.successCases.length;
                if (tab.id === "competitors") return config.competitors.length;
                return null;
              };
              const count = getCount();
              const isDone = tab.id === "upload" ? false :
                tab.id === "product" ? completeness.product :
                tab.id === "pricing" ? completeness.pricing :
                tab.id === "strengths" ? completeness.strengths :
                tab.id === "cases" ? completeness.successCases :
                tab.id === "copy" ? completeness.copywriting :
                tab.id === "competitors" ? completeness.competitors : false;

              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-all ${isActive ? "bg-slate-800/80 text-white border-r-2 border-blue-500" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"}`}>
                  <Icon size={14} className={isActive ? tab.color : ""} />
                  <span className="font-medium flex-1 text-left">{tab.label}</span>
                  {tab.isNew && !isActive && <span className="text-xs bg-blue-500 text-white rounded px-1">START</span>}
                  {count !== null && (
                    <span className={`text-xs px-1.5 rounded-full ${count > 0 ? "bg-green-500/20 text-green-400" : "bg-slate-800 text-slate-600"}`}>
                      {count}
                    </span>
                  )}
                  {!tab.isNew && count === null && isDone && <CheckCircle2 size={11} className="text-green-500" />}
                </button>
              );
            })}

            {/* Additional context */}
            <div className="mt-4 px-3 pt-4 border-t border-slate-800">
              <label className="text-xs text-slate-600 block mb-2">追加情報・メモ</label>
              <textarea
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-slate-500 resize-none"
                rows={4}
                placeholder="AIへの追加指示など..."
                value={config.additionalContext}
                onChange={(e) => updateConfig({ additionalContext: e.target.value })}
              />
            </div>
          </div>

          {/* Right content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "upload" && <UploadTab config={config} onMerge={mergeConfig} />}
            {activeTab === "product" && <ProductTab config={config} update={(p) => updateConfig({ product: { ...config.product, ...p } })} />}
            {activeTab === "pricing" && <PricingTab config={config} updatePricing={(p) => updateConfig({ pricing: { ...config.pricing, ...p } })} />}
            {activeTab === "strengths" && <StrengthsTab config={config} updateStrengths={(s) => updateConfig({ strengths: s })} />}
            {activeTab === "cases" && <CasesTab config={config} updateCases={(c) => updateConfig({ successCases: c })} />}
            {activeTab === "copy" && <CopyTab config={config} updateCopy={(c) => updateConfig({ copywriting: { ...config.copywriting, ...c } })} />}
            {activeTab === "competitors" && <CompetitorsTab config={config} updateCompetitors={(c) => updateConfig({ competitors: c })} />}
          </div>
        </div>
      </div>
    </div>
  );
}
