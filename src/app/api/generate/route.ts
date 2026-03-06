import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { anonymizeHearingData } from "@/lib/anonymizer";
import { buildSystemPromptFromConfig, getConfigPricingMap, EMPTY_UMU_CONFIG } from "@/lib/umuConfig";
import type { HearingData, ProposalPlan, PricingDetail } from "@/types";
import type { UMUConfig } from "@/types/umuConfig";
import { v4 as uuidv4 } from "uuid";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/** Calculate pricing using config-defined prices (no LLM math) */
function calculatePricingFromConfig(
  planType: "premium" | "standard" | "light",
  targetLearners: number,
  configMap: ReturnType<typeof getConfigPricingMap>
): PricingDetail {
  const multipliers = { premium: 1.2, standard: 1.0, light: 0.6 };
  const contractMonthsDefault = { premium: 36, standard: 24, light: 12 };

  const idCount = Math.round(targetLearners * multipliers[planType]);
  const contractMonths = contractMonthsDefault[planType];
  const selectedOptions = configMap.defaultOptions[planType];

  const baseUnitPrice = configMap.baseUnitPrice[planType];
  const initialFee = configMap.initialFee[planType];

  // Volume discount
  let volumeDiscountRate = 0;
  for (const tier of configMap.volumeDiscounts) {
    if (idCount >= tier.minIDs) {
      volumeDiscountRate = tier.rate;
      break;
    }
  }

  // Contract discount
  let contractDiscountRate = 0;
  for (const tier of configMap.contractDiscounts) {
    if (contractMonths >= tier.months) {
      contractDiscountRate = tier.rate;
      break;
    }
  }

  const totalDiscountRate = Math.min(
    volumeDiscountRate + contractDiscountRate,
    configMap.maxTotalDiscount
  );
  const discountedUnitPrice = Math.round(baseUnitPrice * (1 - totalDiscountRate));

  // Monthly costs
  const monthlyBase = discountedUnitPrice * idCount;
  let optionsMonthlyCost = 0;
  let optionsFlatCost = 0;

  for (const optId of selectedOptions) {
    const opt = configMap.options[optId];
    if (!opt) continue;
    if (opt.pricePerID > 0) optionsMonthlyCost += opt.pricePerID * idCount;
    if (opt.flatPrice > 0) optionsFlatCost += opt.flatPrice;
  }

  const monthlyTotal = monthlyBase + optionsMonthlyCost;
  const annualTotal = monthlyTotal * 12 + initialFee + optionsFlatCost;
  const totalContractValue = monthlyTotal * contractMonths + initialFee + optionsFlatCost;

  return {
    planType,
    idCount,
    contractMonths,
    selectedOptions,
    baseUnitPrice,
    discountedUnitPrice,
    volumeDiscountRate,
    contractDiscountRate,
    totalDiscountRate,
    initialFee,
    monthlyBase,
    optionsMonthlyCost,
    monthlyTotal,
    annualTotal,
    totalContractValue,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hearingData, command, currentProposal, umuConfig } = body as {
      hearingData: HearingData;
      command?: string;
      currentProposal?: { plans: ProposalPlan[] };
      umuConfig?: UMUConfig;
    };

    if (!hearingData) {
      return NextResponse.json({ error: "ヒアリングデータが必要です" }, { status: 400 });
    }

    // Use provided config or fall back to empty config
    const config = umuConfig ?? EMPTY_UMU_CONFIG;

    // Anonymize sensitive data before sending to LLM
    const anonymizedData = anonymizeHearingData(hearingData);

    // Build system prompt from dynamic config
    const systemPrompt = buildSystemPromptFromConfig(config);

    let userMessage = "";

    if (command && currentProposal) {
      userMessage = `以下の提案書を次の指示に従って修正してください。

## 修正指示
${command}

## 現在の提案書（JSON）
${JSON.stringify({ plans: currentProposal.plans.map((p) => ({ ...p, pricing: undefined })) }, null, 2)}

## ヒアリング情報
会社名: ${anonymizedData.companyName}
業界: ${anonymizedData.industry}
従業員数: ${anonymizedData.employeeCount}名
ターゲット学習者: ${anonymizedData.targetLearners}名
現状課題: ${anonymizedData.currentChallenges}
学習目標: ${anonymizedData.learningGoals}

修正指示を反映した、同じJSON形式で3プラン分を返してください。`;
    } else {
      userMessage = `以下のヒアリング情報をもとに、${config.product.name}の提案書を作成してください。

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
成功の定義・KPI: ${anonymizedData.successMetrics}
補足: ${anonymizedData.additionalNotes || "なし"}

この情報をもとに、Premium・Standard・Lightの3プランの提案書を作成してください。
顧客の業界・課題・予算感に特化した具体的な数値を使用してください。
登録されている成功事例の中から最も類似した業界・課題のものを選んで参照してください。`;
    }

    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "生成に失敗しました" }, { status: 500 });
    }

    // Extract JSON from response
    const jsonMatch =
      content.text.match(/```json\n([\s\S]*?)\n```/) ||
      content.text.match(/({[\s\S]*})/);

    if (!jsonMatch) {
      return NextResponse.json({ error: "JSONの解析に失敗しました" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[1]);
    const plans: ProposalPlan[] = parsed.plans;

    // Attach server-calculated pricing using config-defined prices (NOT LLM-calculated)
    const planTypeMap: Record<string, "premium" | "standard" | "light"> = {
      Premium: "premium",
      Standard: "standard",
      Light: "light",
    };

    const configPricingMap = getConfigPricingMap(config);

    const enrichedPlans: ProposalPlan[] = plans.map((plan) => {
      const pt = planTypeMap[plan.planType] ?? "standard";
      const pricing = calculatePricingFromConfig(
        pt,
        hearingData.targetLearners || 100,
        configPricingMap
      );
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
