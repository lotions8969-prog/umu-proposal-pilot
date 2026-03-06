/**
 * UMU Pricing Module
 * 独立した計算モジュール - LLMの計算ミスを排除
 */

import type { PricingCalculationInput, PricingCalculationResult } from "@/types";

export const PRICING_CONFIG = {
  baseUnitPrice: {
    premium: 6800,
    standard: 4500,
    light: 2800,
  },
  initialFee: {
    premium: 680000,
    standard: 380000,
    light: 180000,
  },
  options: {
    aiCoaching: {
      name: "AIコーチング強化パック",
      description: "AIによるリアルタイムフィードバック機能",
      pricePerID: 600,
      flatPrice: 0,
    },
    customContent: {
      name: "カスタムコンテンツ制作",
      description: "御社専用のeラーニングコンテンツ制作",
      pricePerID: 0,
      flatPrice: 250000,
    },
    adminTraining: {
      name: "管理者トレーニングプログラム",
      description: "UMU管理者向け運用トレーニング（8時間）",
      pricePerID: 0,
      flatPrice: 120000,
    },
    apiIntegration: {
      name: "API・システム連携",
      description: "既存HRシステムとのデータ連携",
      pricePerID: 0,
      flatPrice: 350000,
    },
    dedicatedCS: {
      name: "専任カスタマーサクセス",
      description: "専任CSによる月次フォローアップ",
      pricePerID: 0,
      flatPrice: 180000,
    },
    advancedAnalytics: {
      name: "高度アナリティクスダッシュボード",
      description: "学習効果の可視化・ROI測定ダッシュボード",
      pricePerID: 200,
      flatPrice: 0,
    },
    liveStreaming: {
      name: "ライブストリーミング機能",
      description: "リアルタイム研修・ウェビナー配信",
      pricePerID: 300,
      flatPrice: 0,
    },
  } as Record<string, { name: string; description: string; pricePerID: number; flatPrice: number }>,

  volumeDiscounts: [
    { minIDs: 1000, rate: 0.12 },
    { minIDs: 500, rate: 0.08 },
    { minIDs: 200, rate: 0.05 },
    { minIDs: 100, rate: 0.03 },
    { minIDs: 0, rate: 0 },
  ],

  contractDiscounts: [
    { months: 36, rate: 0.15 },
    { months: 24, rate: 0.10 },
    { months: 12, rate: 0.05 },
    { months: 0, rate: 0 },
  ],

  maxTotalDiscount: 0.22,
} as const;

export function calculatePricing(input: PricingCalculationInput): PricingCalculationResult {
  const { planType, idCount, contractMonths, selectedOptions } = input;

  const baseUnitPrice = PRICING_CONFIG.baseUnitPrice[planType];
  const initialFee = PRICING_CONFIG.initialFee[planType];

  // Volume discount
  let volumeDiscountRate = 0;
  for (const tier of PRICING_CONFIG.volumeDiscounts) {
    if (idCount >= tier.minIDs) {
      volumeDiscountRate = tier.rate;
      break;
    }
  }

  // Contract length discount
  let contractDiscountRate = 0;
  for (const tier of PRICING_CONFIG.contractDiscounts) {
    if (contractMonths >= tier.months) {
      contractDiscountRate = tier.rate;
      break;
    }
  }

  const totalDiscountRate = Math.min(
    volumeDiscountRate + contractDiscountRate,
    PRICING_CONFIG.maxTotalDiscount
  );

  const discountedUnitPrice = Math.round(baseUnitPrice * (1 - totalDiscountRate));

  // Monthly base cost
  const monthlyBase = discountedUnitPrice * idCount;

  // Options costs
  let optionsMonthlyCost = 0;
  let optionsFlatCost = 0;
  for (const optionKey of selectedOptions) {
    const option = PRICING_CONFIG.options[optionKey];
    if (!option) continue;
    if (option.pricePerID > 0) {
      optionsMonthlyCost += option.pricePerID * idCount;
    }
    if (option.flatPrice > 0) {
      optionsFlatCost += option.flatPrice;
    }
  }

  const monthlyTotal = monthlyBase + optionsMonthlyCost;
  const annualTotal = monthlyTotal * 12 + initialFee + optionsFlatCost;
  const totalContractValue = monthlyTotal * contractMonths + initialFee + optionsFlatCost;

  return {
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

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function getDefaultOptions(planType: "premium" | "standard" | "light"): string[] {
  const defaults: Record<string, string[]> = {
    premium: ["aiCoaching", "customContent", "adminTraining", "dedicatedCS", "advancedAnalytics"],
    standard: ["aiCoaching", "adminTraining", "advancedAnalytics"],
    light: ["adminTraining"],
  };
  return defaults[planType];
}

export function getDefaultIDCount(
  planType: "premium" | "standard" | "light",
  targetLearners: number
): number {
  const multipliers: Record<string, number> = {
    premium: 1.2,
    standard: 1.0,
    light: 0.6,
  };
  return Math.round(targetLearners * multipliers[planType]);
}

export function getDefaultContractMonths(planType: "premium" | "standard" | "light"): number {
  const defaults: Record<string, number> = {
    premium: 36,
    standard: 24,
    light: 12,
  };
  return defaults[planType];
}
