import type { UMUConfig } from "@/types/umuConfig";

const STORAGE_KEY = "umu_product_config";
const CONFIGURED_KEY = "umu_product_configured";

/** 空の初期状態（ユーザーがまだ何も登録していない状態） */
export const EMPTY_UMU_CONFIG: UMUConfig = {
  product: {
    name: "UMU（ユーム）",
    tagline: "",
    description: "",
    targetMarket: "",
    userCount: "",
    countries: "",
    keyMessage: "",
    website: "",
  },
  pricing: {
    plans: {
      premium: { label: "Premium", unitPrice: 0, initialFee: 0, description: "" },
      standard: { label: "Standard", unitPrice: 0, initialFee: 0, description: "" },
      light: { label: "Light", unitPrice: 0, initialFee: 0, description: "" },
    },
    options: [],
    volumeDiscounts: [
      { minIDs: 1000, rate: 0.12, label: "1,000ID以上" },
      { minIDs: 500, rate: 0.08, label: "500ID以上" },
      { minIDs: 200, rate: 0.05, label: "200ID以上" },
      { minIDs: 100, rate: 0.03, label: "100ID以上" },
    ],
    contractDiscounts: [
      { months: 36, rate: 0.15, label: "3年契約" },
      { months: 24, rate: 0.10, label: "2年契約" },
      { months: 12, rate: 0.05, label: "1年契約" },
    ],
    maxTotalDiscount: 0.22,
    notes: "",
  },
  strengths: [],
  successCases: [],
  copywriting: {
    openingPhrases: [],
    transformationPhrases: [],
    roiPhrases: [],
    urgencyPhrases: [],
    closingPhrases: [],
    premiumTagline: "",
    standardTagline: "",
    lightTagline: "",
  },
  competitors: [],
  additionalContext: "",
};

/** サンプルデータ（「サンプルを読み込む」ボタン用） */
export const SAMPLE_UMU_CONFIG: UMUConfig = {
  product: {
    name: "UMU（ユーム）",
    tagline: "学習の科学で、人と組織を変える",
    description:
      "UMUは「学習の科学」に基づいた法人向けeラーニング・人材育成プラットフォームです。AIによるリアルタイムフィードバック、ゲーミフィケーション、分析ダッシュボードを統合し、研修の「受講率」から「行動変容」まで一気通貫で支援します。",
    targetMarket: "従業員100名以上の法人・組織（製造業・金融・小売・IT・医療など全業種）",
    userCount: "700万人以上",
    countries: "150カ国以上",
    keyMessage: "「知っている」から「できる」へ。学習の科学が人と組織を変える。",
    website: "https://umu.com",
  },
  pricing: {
    plans: {
      premium: {
        label: "Premium",
        unitPrice: 6800,
        initialFee: 680000,
        description: "AI機能フル活用・専任カスタマーサクセス付きの最上位プラン",
      },
      standard: {
        label: "Standard",
        unitPrice: 4500,
        initialFee: 380000,
        description: "コストと機能のバランスが最優先の中位プラン",
      },
      light: {
        label: "Light",
        unitPrice: 2800,
        initialFee: 180000,
        description: "小さく始めてスケールアップできる入門プラン",
      },
    },
    options: [
      { id: "aiCoaching", name: "AIコーチング強化パック", description: "AIによるリアルタイム音声・表情・内容分析フィードバック機能", priceType: "per_id", price: 600, defaultFor: ["premium", "standard"] },
      { id: "customContent", name: "カスタムコンテンツ制作", description: "御社専用のeラーニングコンテンツ制作（最大10本）", priceType: "flat", price: 250000, defaultFor: ["premium"] },
      { id: "adminTraining", name: "管理者トレーニングプログラム", description: "UMU管理者向け運用トレーニング（8時間×2回）", priceType: "flat", price: 120000, defaultFor: ["premium", "standard", "light"] },
      { id: "dedicatedCS", name: "専任カスタマーサクセス", description: "専任CSによる月次フォローアップ・KPI管理", priceType: "flat", price: 180000, defaultFor: ["premium"] },
      { id: "advancedAnalytics", name: "高度アナリティクスダッシュボード", description: "学習効果・行動変容・ROI測定の可視化ダッシュボード", priceType: "per_id", price: 200, defaultFor: ["premium", "standard"] },
    ],
    volumeDiscounts: [
      { minIDs: 1000, rate: 0.12, label: "1,000ID以上" },
      { minIDs: 500, rate: 0.08, label: "500ID以上" },
      { minIDs: 200, rate: 0.05, label: "200ID以上" },
      { minIDs: 100, rate: 0.03, label: "100ID以上" },
    ],
    contractDiscounts: [
      { months: 36, rate: 0.15, label: "3年契約" },
      { months: 24, rate: 0.10, label: "2年契約" },
      { months: 12, rate: 0.05, label: "1年契約" },
    ],
    maxTotalDiscount: 0.22,
    notes: "価格はすべて税抜き表示。消費税10%が別途加算されます。",
  },
  strengths: [
    { id: "s1", title: "AIリアルタイムフィードバック", description: "ロールプレイ・スピーチ練習に対してAIが音声・表情・話す速度・キーワードを分析し、即座にフィードバック。いつでも何度でも練習可能。", evidence: "従来のOJT比較で練習回数平均8倍増加、スキル定着率67%向上（UMU社内データ）", category: "AI機能" },
    { id: "s2", title: "学習継続率87%", description: "ゲーミフィケーション（ポイント・バッジ・ランキング）とAIリマインド機能の組み合わせで、業界平均（30〜40%）の2倍以上の学習継続率を実現。", evidence: "業界平均継続率35% vs UMU平均87%（2023年調査）", category: "エンゲージメント" },
    { id: "s3", title: "スマホ15分でコンテンツ作成", description: "スマートフォン1台で動画撮影・編集・字幕・テスト問題をセットにした本格的なeラーニングコンテンツを15分で作成可能。IT部門不要。", evidence: "コンテンツ制作コスト従来比90%削減、制作期間数週間→15分", category: "コンテンツ作成" },
    { id: "s4", title: "4段階効果測定", description: "「反応・学習・行動・成果」の4段階で学習効果を測定。受講率だけでなく、実際の行動変容・業績改善まで追跡できるプラットフォーム。", evidence: "導入企業の73%が業績指標との相関を確認（UMU調査）", category: "効果測定" },
    { id: "s5", title: "世界150カ国・700万ユーザーの実績", description: "フォーチュン500企業の多くが採用。グローバル展開している企業でも多言語対応（40言語以上）で統一した研修品質を維持可能。", evidence: "Fortune 500企業採用率60%以上、NPS（顧客推奨度）スコア72", category: "実績・信頼性" },
    { id: "s6", title: "成果コミット型カスタマーサクセス", description: "導入後も専任CSが月次でKPIを確認し、活用改善をプロアクティブに提案。「入れっぱなし」にさせない、成果にコミットしたサポート体制。", evidence: "継続率95%、導入企業の88%が目標KPI達成（Premium契約）", category: "サポート" },
  ],
  successCases: [
    { id: "c1", industry: "製造業", company: "大手自動車部品メーカー（従業員8,000名）", size: "8,000名", challenge: "全国30拠点への新製品研修に毎回1人あたり15万円の出張費・宿泊費が発生。年間教育コスト3億円超。OJTの質もばらつきあり。", solution: "UMU Premiumで製品マニュアルをビデオ教材化。AIロールプレイで技術者が自己学習。管理者向け分析ダッシュボードで習熟度を可視化。", result: "教育コスト67%削減（3億円→1億円）。新製品立ち上げ期間を6週間から3週間に短縮。従業員エンゲージメントスコア12ポイント向上。", quote: "「UMUを導入してから、研修の質と量が劇的に変わりました」（人事部長）", roi: "312%（3年間）", planType: "Premium" },
    { id: "c2", industry: "金融・保険", company: "大手生命保険会社（営業職員5,000名）", size: "5,000名", challenge: "新人営業職員の定着率が入社1年で45%。ロープレ研修が月1回しか実施できずスキル習得に時間がかかりすぎ。ベテランのノウハウが属人化。", solution: "UMU StandardでAIロールプレイを活用し、いつでもどこでも営業練習が可能に。ベストセールスのトークスクリプトをコンテンツ化し全員で共有。", result: "新人定着率45%→72%に改善。初契約獲得まで平均3.2ヶ月→1.8ヶ月に短縮。中途採用コスト年間8,000万円削減。", quote: "「AIが何度でも練習相手になってくれる。革命的です」（営業統括本部長）", roi: "234%（2年間）", planType: "Standard" },
    { id: "c3", industry: "小売・流通", company: "全国チェーンスーパーマーケット（12,000名）", size: "12,000名", challenge: "パートタイム従業員の食品衛生・接客マナー研修が形骸化。受講率35%。クレーム件数が前年比120%で増加中。", solution: "UMU Lightでスマートフォンから5分の動画研修を実施。衛生チェックリストをデジタル化。", result: "食品衛生クレームが6ヶ月で43%減少。研修完了率35%→91%に向上。研修コスト年間1,200万円削減。", quote: "「スタッフが自分のスマホで好きな時間に学べるので、全員参加が実現できました」（店舗運営部長）", roi: "187%（1年間）", planType: "Light" },
  ],
  copywriting: {
    openingPhrases: [
      "「研修が終わった瞬間、学びも終わる」——その課題、もう終わりにしませんか。",
      "なぜ、年間数億円かけた研修が現場で活かされないのか。答えは「科学」にあります。",
      "「知っている」と「できる」の間には、深くて暗い川がある。UMUはその橋を架けます。",
    ],
    transformationPhrases: [
      "研修室の学びを、現場の成果に直結させる。",
      "一人ひとりに合わせたAIコーチが、24時間365日そばにいる。",
      "ベストプレイヤーのノウハウを、全員のスタンダードにする。",
    ],
    roiPhrases: [
      "投資対効果（ROI）は平均300%超。教育は最も確実なリターンを生む投資です。",
      "1IDあたり月額わずか数千円で、プロ品質のコーチングが全員に届く。",
    ],
    urgencyPhrases: [
      "競合はすでに動いている。貴社の意思決定が、3年後の格差を決める。",
      "DX推進の最大のボトルネックは、技術ではなく「人の学習スピード」です。",
    ],
    closingPhrases: [
      "今日の決断が、明日の競争優位を作ります。",
      "3ヶ月後、御社のチームは変わっています。その第一歩を、今日踏み出しませんか。",
    ],
    premiumTagline: "学習変革の完全制覇——競合に3年の差をつける戦略的パートナーシップ",
    standardTagline: "ROIが証明された成長エンジン——コスト効率と学習効果の最適解",
    lightTagline: "小さく始めて、大きく育てる——リスクゼロの学習改革ファーストステップ",
  },
  competitors: [
    { id: "r1", feature: "AIフィードバック機能", umuValue: "音声・表情・内容をAIがリアルタイム分析、即時フィードバック", competitorValue: "録画再生のみ（AIフィードバックなし）" },
    { id: "r2", feature: "学習継続率", umuValue: "ゲーミフィケーション+AIリマインドで平均継続率87%", competitorValue: "業界平均30〜40%" },
    { id: "r3", feature: "効果測定", umuValue: "4段階評価モデル（行動変容・業績影響まで追跡）", competitorValue: "受講完了率・テストスコアのみ計測" },
    { id: "r4", feature: "コンテンツ作成", umuValue: "スマホ1台で本格動画教材を15分で作成可能", competitorValue: "専門業者への外注必要（数週間〜数ヶ月）" },
    { id: "r5", feature: "モバイル対応", umuValue: "完全ネイティブアプリ（iOS/Android）、オフライン学習対応", competitorValue: "PCブラウザ中心、スマホは非推奨・機能制限あり" },
    { id: "r6", feature: "導入・サポート", umuValue: "専任CSが成果コミット型でプロアクティブサポート", competitorValue: "マニュアル提供・チケットサポートのみ" },
  ],
  additionalContext: "",
};

/** ユーザーが設定済みかどうかを確認 */
export function isUserConfigured(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CONFIGURED_KEY) === "true";
}

export function loadUMUConfig(): UMUConfig {
  if (typeof window === "undefined") return EMPTY_UMU_CONFIG;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return EMPTY_UMU_CONFIG;
    return JSON.parse(stored) as UMUConfig;
  } catch {
    return EMPTY_UMU_CONFIG;
  }
}

export function saveUMUConfig(config: UMUConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  localStorage.setItem(CONFIGURED_KEY, "true");
}

export function resetUMUConfig(): UMUConfig {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CONFIGURED_KEY);
  }
  return EMPTY_UMU_CONFIG;
}

/** 設定の完成度チェック */
export function getConfigCompleteness(config: UMUConfig) {
  return {
    product: !!(config.product.description && config.product.keyMessage),
    pricing: config.pricing.plans.premium.unitPrice > 0 || config.pricing.plans.standard.unitPrice > 0,
    strengths: config.strengths.length > 0,
    successCases: config.successCases.length > 0,
    copywriting: config.copywriting.openingPhrases.length > 0,
    competitors: config.competitors.length > 0,
  };
}

/** Build system prompt from dynamic UMU config */
export function buildSystemPromptFromConfig(config: UMUConfig): string {
  const { product, strengths, successCases, copywriting, competitors, additionalContext } = config;

  const strengthsText = strengths.length > 0
    ? strengths.map((s) => `【${s.category}】${s.title}: ${s.description}（根拠: ${s.evidence}）`).join("\n")
    : "（製品の強み・機能情報が未登録です。一般的なeラーニングプラットフォームの強みを使用してください）";

  const casesText = successCases.length > 0
    ? successCases.map((c) => `[${c.industry}] ${c.company}（${c.size}）: 課題「${c.challenge}」→ 成果「${c.result}」ROI: ${c.roi}`).join("\n")
    : "（成功事例が未登録です。業界に合わせた仮想事例を作成してください）";

  const competitorsText = competitors.length > 0
    ? competitors.map((r) => `${r.feature}: UMU「${r.umuValue}」 vs 競合「${r.competitorValue}」`).join("\n")
    : "（競合比較データが未登録です）";

  const allPhrases = [
    ...copywriting.openingPhrases,
    ...copywriting.transformationPhrases,
    ...copywriting.roiPhrases,
    ...copywriting.urgencyPhrases,
  ];
  const copyText = allPhrases.length > 0
    ? allPhrases.join(" / ")
    : "（キャッチフレーズが未登録です。一般的なSaaSの訴求フレーズを使用してください）";

  const pricingText = config.pricing.plans.premium.unitPrice > 0
    ? [
        `Premium: ${config.pricing.plans.premium.unitPrice}円/ID/月、初期費用${config.pricing.plans.premium.initialFee}円`,
        `Standard: ${config.pricing.plans.standard.unitPrice}円/ID/月、初期費用${config.pricing.plans.standard.initialFee}円`,
        `Light: ${config.pricing.plans.light.unitPrice}円/ID/月、初期費用${config.pricing.plans.light.initialFee}円`,
      ].join("\n")
    : "（価格が未設定です）";

  return `あなたは${product.name}の提案書作成の専門家です。
${product.name}の営業として、顧客のヒアリング情報から説得力のある提案書を作成してください。

## ${product.name}について
${product.description || "（製品説明未登録）"}
キーメッセージ: ${product.keyMessage || "（未登録）"}
${product.userCount ? `実績: ${product.countries}・${product.userCount}ユーザーが利用` : ""}
${product.targetMarket ? `ターゲット: ${product.targetMarket}` : ""}

## 製品の強み・機能
${strengthsText}

## 価格帯（参考）
${pricingText}
${config.pricing.notes}

## 成功事例DB（必ず顧客業界に近い事例を選んで参照すること）
${casesText}

## キラーフレーズ集（感情に訴える言葉として適切に使用すること）
${copyText}

## 競合比較ポイント
${competitorsText}

${additionalContext ? `## 追加情報・特記事項\n${additionalContext}` : ""}

## 出力形式
必ず以下のJSON形式で出力してください。JSONのみを出力し、説明文は不要です。

\`\`\`json
{
  "plans": [
    {
      "planType": "Premium",
      "title": "提案タイトル（顧客の課題と解決を含む30文字程度）",
      "tagline": "サブタイトル（インパクトある20文字程度）",
      "executiveSummary": "経営層向け要約（150文字程度）",
      "killerPhrase": "この提案のキャッチコピー（感情に訴える30文字程度）",
      "before": {
        "description": "現状の課題の説明（100文字）",
        "metrics": [{"label": "現状指標名", "value": "数値"}, {"label": "現状指標名2", "value": "数値"}],
        "painPoints": ["痛み1", "痛み2", "痛み3"]
      },
      "after": {
        "description": "導入後の理想状態（100文字）",
        "metrics": [{"label": "改善後指標名", "value": "数値"}, {"label": "改善後指標名2", "value": "数値"}],
        "achievements": ["成果1", "成果2", "成果3"]
      },
      "keyFeatures": ["機能1", "機能2", "機能3", "機能4", "機能5"],
      "implementationTimeline": [
        {"month": 1, "milestone": "マイルストーン名", "detail": "詳細"},
        {"month": 3, "milestone": "マイルストーン名", "detail": "詳細"},
        {"month": 6, "milestone": "マイルストーン名", "detail": "詳細"},
        {"month": 12, "milestone": "マイルストーン名", "detail": "詳細"}
      ],
      "competitorComparison": [
        {"feature": "比較項目", "umu": "UMUの強み", "competitor": "競合の弱点", "umuAdvantage": true}
      ],
      "successStory": {
        "company": "類似企業名",
        "industry": "業界",
        "challenge": "課題",
        "result": "成果（数値を含む）",
        "quote": "担当者のコメント"
      },
      "roiAnalysis": {
        "currentAnnualCost": 現状の年間教育コスト（数値・円）,
        "projectedSavings": 年間削減額（数値・円）,
        "productivityGainPercent": 生産性向上率（数値・%）,
        "paybackMonths": 投資回収月数（数値）,
        "threeYearROIPercent": 3年間ROI（数値・%）,
        "roiNarrative": "ROIの説明文（80文字）"
      }
    }
  ]
}
\`\`\`

Premiumは最上位（AI機能フル活用・専任CS付き）、Standardは中位（コスパ最優）、Lightは入門（小さく始める）として、3プランすべてを生成してください。
顧客の業界・課題・予算感に特化した具体的な数値を使用してください。`;
}

/** Convert UMU config pricing to calculation-ready format */
export function getConfigPricingMap(config: UMUConfig) {
  const pr = config.pricing;
  // Fall back to sensible defaults if prices are 0
  const baseUnitPrice = {
    premium: pr.plans.premium.unitPrice || 6800,
    standard: pr.plans.standard.unitPrice || 4500,
    light: pr.plans.light.unitPrice || 2800,
  };
  const initialFee = {
    premium: pr.plans.premium.initialFee || 680000,
    standard: pr.plans.standard.initialFee || 380000,
    light: pr.plans.light.initialFee || 180000,
  };

  return {
    baseUnitPrice,
    initialFee,
    options: Object.fromEntries(
      pr.options.map((o) => [
        o.id,
        {
          name: o.name,
          description: o.description,
          pricePerID: o.priceType === "per_id" ? o.price : 0,
          flatPrice: o.priceType === "flat" ? o.price : 0,
        },
      ])
    ),
    volumeDiscounts: pr.volumeDiscounts.map((d) => ({ minIDs: d.minIDs, rate: d.rate })),
    contractDiscounts: pr.contractDiscounts.map((d) => ({ months: d.months, rate: d.rate })),
    maxTotalDiscount: pr.maxTotalDiscount,
    defaultOptions: Object.fromEntries(
      (["premium", "standard", "light"] as const).map((pt) => [
        pt,
        pr.options.filter((o) => o.defaultFor.includes(pt)).map((o) => o.id),
      ])
    ),
  };
}
