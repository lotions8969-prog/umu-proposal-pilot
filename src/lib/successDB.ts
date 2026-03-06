/**
 * UMU 成功事例データベース
 * 過去の受注提案書の構成、課題解決のロジック、ストーリーライン
 */

export interface SuccessCase {
  id: string;
  industry: string;
  company: string;
  challenge: string;
  solution: string;
  result: string;
  quote: string;
  planType: "Premium" | "Standard" | "Light";
  idCount: number;
  contractMonths: number;
  roi: string;
  keyFeatures: string[];
}

export const SUCCESS_DB: SuccessCase[] = [
  {
    id: "s001",
    industry: "製造業",
    company: "大手自動車部品メーカー（従業員8,000名）",
    challenge:
      "全国30拠点に散らばる技術者への新製品研修に、毎回1人あたり15万円の出張費・宿泊費が発生。年間教育コストが3億円超。OJTの質もばらつきあり",
    solution:
      "UMU Premiumを導入し、製品マニュアルをビデオ教材化。AIロールプレイで技術者が自己学習できる環境を構築。管理者向け分析ダッシュボードで習熟度を可視化",
    result: "教育コスト67%削減（2億円→6,600万円）。新製品立ち上げ期間を平均6週間から3週間に短縮。従業員エンゲージメントスコアが12ポイント向上",
    quote:
      "「UMUを導入してから、研修の質と量が劇的に変わりました。どこにいても同じ品質の学習が受けられることで、現場のモチベーションも格段に上がっています」（人事部長）",
    planType: "Premium",
    idCount: 1200,
    contractMonths: 36,
    roi: "312%（3年間）",
    keyFeatures: ["ビデオラーニング", "AIフィードバック", "分析ダッシュボード", "多拠点展開"],
  },
  {
    id: "s002",
    industry: "金融・保険",
    company: "大手生命保険会社（営業職員5,000名）",
    challenge:
      "新人営業職員の定着率が入社1年で45%にとどまる。ロープレ研修が月1回しか実施できず、スキル習得に時間がかかりすぎる。ベテランのノウハウが属人化",
    solution:
      "UMU StandardでAIロールプレイを活用し、いつでもどこでも営業練習が可能に。ベストセールスのトークスクリプトをコンテンツ化し全員で共有",
    result: "新人定着率が45%→72%に改善。初契約獲得まで平均3.2ヶ月→1.8ヶ月に短縮。中途採用コスト年間8,000万円削減",
    quote:
      "「AIが何度でも練習相手になってくれる。これは革命的です。新人が自信を持って現場に出られるようになりました」（営業統括本部長）",
    planType: "Standard",
    idCount: 600,
    contractMonths: 24,
    roi: "234%（2年間）",
    keyFeatures: ["AIロールプレイ", "ベストプラクティス共有", "進捗管理", "モバイル学習"],
  },
  {
    id: "s003",
    industry: "小売・流通",
    company: "全国チェーンスーパーマーケット（パート含む12,000名）",
    challenge:
      "パートタイム従業員の食品衛生・接客マナー研修が形骸化。紙のテキストは読まれず、理解度テストも形式的。クレーム件数が前年比120%で増加中",
    solution:
      "UMU Lightでスマートフォンから5分の動画研修を実施。衛生チェックリストをUMU上でデジタル化。店長が各スタッフの学習状況をリアルタイム確認",
    result: "食品衛生クレームが6ヶ月で43%減少。研修完了率が35%→91%に向上。研修コスト（印刷・場所代）年間1,200万円削減",
    quote:
      "「スタッフが自分のスマホで好きな時間に学べるので、全員参加が実現できました。クレームが減って本当に助かっています」（店舗運営部長）",
    planType: "Light",
    idCount: 800,
    contractMonths: 12,
    roi: "187%（1年間）",
    keyFeatures: ["モバイル学習", "クイズ・テスト", "進捗可視化", "コンプライアンス研修"],
  },
  {
    id: "s004",
    industry: "IT・テクノロジー",
    company: "SaaS企業（急成長フェーズ、従業員800名）",
    challenge:
      "急速な採用拡大（年間200名採用）によりオンボーディングが追いつかず、新入社員が戦力化するまで平均6ヶ月かかる。カルチャー浸透も課題",
    solution:
      "UMU Premiumでオンボーディングプログラムを完全デジタル化。創業者のビジョン動画、製品知識、社内プロセスをすべてUMUで習得。入社前から学習スタート可能に",
    result: "戦力化期間が6ヶ月→2.5ヶ月に短縮。90日定着率が78%→94%に向上。HRチームの研修運営工数が月40時間削減",
    quote:
      "「入社前から会社のことを深く理解して来てくれる新人が増えました。オンボーディングの質が桁違いに上がりました」（CHRO）",
    planType: "Premium",
    idCount: 300,
    contractMonths: 24,
    roi: "280%（2年間）",
    keyFeatures: ["オンボーディング", "動画コンテンツ", "入社前学習", "文化浸透"],
  },
  {
    id: "s005",
    industry: "医療・ヘルスケア",
    company: "病院グループ（医師・看護師・コメディカル2,500名）",
    challenge:
      "医療安全・感染対策研修を全職員が毎年受講する義務があるが、業務多忙で研修参加率が60%に留まる。記録管理も紙ベースで煩雑",
    solution:
      "UMU StandardでeラーニングをLMS化。業務の合間にスマホで受講可能に。修了証の自動発行とコンプライアンス管理を一元化",
    result: "必須研修受講率が60%→99.2%に向上。研修記録管理工数が年間500時間削減。医療安全インシデント件数が前年比28%減少",
    quote:
      "「受講率100%近くを達成できるとは思っていませんでした。職員が本当に使いやすいシステムです」（看護部長）",
    planType: "Standard",
    idCount: 500,
    contractMonths: 24,
    roi: "198%（2年間）",
    keyFeatures: ["コンプライアンス管理", "修了証発行", "モバイル学習", "レポーティング"],
  },
];

export function findRelevantSuccessCase(industry: string, planType: string): SuccessCase {
  // Find by industry match first
  const industryMatch = SUCCESS_DB.find(
    (c) => c.industry.includes(industry) && c.planType === planType
  );
  if (industryMatch) return industryMatch;

  // Then by plan type
  const planMatch = SUCCESS_DB.find((c) => c.planType === planType);
  if (planMatch) return planMatch;

  return SUCCESS_DB[0];
}

export function getSuccessCaseSummary(): string {
  return SUCCESS_DB.map(
    (c) =>
      `[${c.industry}] ${c.company}: ${c.challenge} → ${c.result} (ROI: ${c.roi})`
  ).join("\n");
}
