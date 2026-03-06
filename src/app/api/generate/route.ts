import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { anonymizeHearingData } from "@/lib/anonymizer";
import { getSuccessCaseSummary } from "@/lib/successDB";
import { UMU_KILLER_PHRASES, UMU_ADVANTAGES, PLAN_PHRASES } from "@/lib/copywriting";
import {
  calculatePricing,
  getDefaultIDCount,
  getDefaultContractMonths,
  getDefaultOptions,
} from "@/lib/pricing";
import type { HearingData, ProposalPlan, PricingDetail } from "@/types";
import { v4 as uuidv4 } from "uuid";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function buildSystemPrompt(): string {
  return `あなたはUMU（ユーム）という学習プラットフォームの提案書作成の専門家です。
UMUの営業として、顧客のヒアリング情報から説得力のある提案書を作成してください。

## UMUについて
UMUは「学習の科学」に基づいた法人向けeラーニング・人材育成プラットフォームです。
- AIによるリアルタイムフィードバック機能（音声・表情・内容分析）
- ゲーミフィケーションで学習継続率87%
- スマホ1台で本格動画教材を15分で作成
- 世界150カ国・700万人以上が利用
- フォーチュン500企業多数が導入

## 成功事例DB
${getSuccessCaseSummary()}

## UMUのキラーフレーズ（適切に使用すること）
開口フレーズ: ${UMU_KILLER_PHRASES.opening.join(" / ")}
変革フレーズ: ${UMU_KILLER_PHRASES.transformation.join(" / ")}
ROIフレーズ: ${UMU_KILLER_PHRASES.roi.join(" / ")}
緊急性フレーズ: ${UMU_KILLER_PHRASES.urgency.join(" / ")}

## UMUの競合優位性
${UMU_ADVANTAGES.map((a) => `${a.category}: UMU「${a.umu}」vs 競合「${a.competitor}」`).join("\n")}

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
        "metrics": [
          {"label": "現状指標名", "value": "数値"},
          {"label": "現状指標名2", "value": "数値"}
        ],
        "painPoints": ["痛み1", "痛み2", "痛み3"]
      },
      "after": {
        "description": "UMU導入後の理想状態（100文字）",
        "metrics": [
          {"label": "改善後指標名", "value": "数値"},
          {"label": "改善後指標名2", "value": "数値"}
        ],
        "achievements": ["成果1", "成果2", "成果3"]
      },
      "keyFeatures": ["機能1", "機能2", "機能3", "機能4", "機能5"],
      "implementationTimeline": [
        {"month": 1, "milestone": "マイルストーン名", "detail": "詳細"},
        {"month": 2, "milestone": "マイルストーン名", "detail": "詳細"},
        {"month": 3, "milestone": "マイルストーン名", "detail": "詳細"},
        {"month": 6, "milestone": "マイルストーン名", "detail": "詳細"},
        {"month": 12, "milestone": "マイルストーン名", "detail": "詳細"}
      ],
      "competitorComparison": [
        {"feature": "比較項目", "umu": "UMUの強み", "competitor": "競合の弱点", "umuAdvantage": true},
        {"feature": "比較項目2", "umu": "UMUの強み", "competitor": "競合の弱点", "umuAdvantage": true}
      ],
      "successStory": {
        "company": "類似企業名（仮名でもOK）",
        "industry": "業界",
        "challenge": "課題",
        "result": "成果（数値を含む）",
        "quote": "担当者のコメント（感情的な言葉）"
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

Premiumは最上位プラン（AI機能フル活用・専任CS付き）、Standardは中位（コスパ最優）、Lightは入門プラン（小さく始める）として、3プランすべてを生成してください。
各プランの提案内容はリアルで説得力のある数値を含めてください。`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hearingData, command, currentProposal } = body as {
      hearingData: HearingData;
      command?: string;
      currentProposal?: { plans: ProposalPlan[] };
    };

    if (!hearingData) {
      return NextResponse.json({ error: "ヒアリングデータが必要です" }, { status: 400 });
    }

    // Anonymize sensitive data before sending to LLM
    const anonymizedData = anonymizeHearingData(hearingData);

    let userMessage = "";

    if (command && currentProposal) {
      // Magic Command: modify existing proposal
      userMessage = `以下の提案書を次の指示に従って修正してください。

## 修正指示
${command}

## 現在の提案書（JSON）
${JSON.stringify(currentProposal, null, 2)}

## ヒアリング情報
会社名: ${anonymizedData.companyName}
業界: ${anonymizedData.industry}
従業員数: ${anonymizedData.employeeCount}名
ターゲット学習者: ${anonymizedData.targetLearners}名
現状課題: ${anonymizedData.currentChallenges}
学習目標: ${anonymizedData.learningGoals}

修正指示を反映した、同じJSON形式で3プラン分を返してください。`;
    } else {
      // Initial generation
      userMessage = `以下のヒアリング情報をもとに、UMUの提案書を作成してください。

## ヒアリング情報
会社名: ${anonymizedData.companyName}
業界: ${anonymizedData.industry}
従業員数: ${anonymizedData.employeeCount}名
ターゲット学習者数: ${anonymizedData.targetLearners}名
現状の課題: ${anonymizedData.currentChallenges}
学習目標: ${anonymizedData.learningGoals}
予算感: ${anonymizedData.budget}
導入希望時期: ${anonymizedData.timeline}
現在使用中/検討中のツール: ${anonymizedData.competitorProducts || "なし"}
キーステークホルダー: ${anonymizedData.keyStakeholders}
成功の定義: ${anonymizedData.successMetrics}
補足: ${anonymizedData.additionalNotes || "なし"}

この情報をもとに、Premium・Standard・Lightの3プランの提案書を作成してください。
顧客の業界・課題に特化した具体的な数値を使用してください。`;
    }

    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 8000,
      system: buildSystemPrompt(),
      messages: [{ role: "user", content: userMessage }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "生成に失敗しました" }, { status: 500 });
    }

    // Extract JSON from response
    const jsonMatch = content.text.match(/```json\n([\s\S]*?)\n```/) ||
      content.text.match(/({[\s\S]*})/);

    if (!jsonMatch) {
      return NextResponse.json({ error: "JSONの解析に失敗しました" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[1]);
    const plans: ProposalPlan[] = parsed.plans;

    // Attach server-calculated pricing to each plan (NOT LLM-calculated)
    const planTypeMap: Record<string, "premium" | "standard" | "light"> = {
      Premium: "premium",
      Standard: "standard",
      Light: "light",
    };

    const enrichedPlans: ProposalPlan[] = plans.map((plan) => {
      const pt = planTypeMap[plan.planType] || "standard";
      const idCount = getDefaultIDCount(pt, hearingData.targetLearners || 100);
      const contractMonths = getDefaultContractMonths(pt);
      const selectedOptions = getDefaultOptions(pt);

      const pricingResult = calculatePricing({
        planType: pt,
        idCount,
        contractMonths,
        selectedOptions,
      });

      const pricing: PricingDetail = {
        planType: pt,
        idCount,
        contractMonths,
        selectedOptions,
        ...pricingResult,
      };

      return { ...plan, pricing };
    });

    const proposal = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      hearingData,
      plans: enrichedPlans,
      command,
    };

    return NextResponse.json({ proposal });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "提案書の生成中にエラーが発生しました。APIキーを確認してください。" },
      { status: 500 }
    );
  }
}
