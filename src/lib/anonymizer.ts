/**
 * UMU データ匿名化モジュール
 * 顧客固有情報を匿名化してLLMに送信
 */

import type { HearingData } from "@/types";

const COMPANY_PLACEHOLDERS: Record<string, string> = {};
const PERSON_PLACEHOLDERS: Record<string, string> = {};
let companyCounter = 0;
let personCounter = 0;

function getOrCreatePlaceholder(
  value: string,
  map: Record<string, string>,
  prefix: string,
  counter: { value: number }
): string {
  if (!map[value]) {
    counter.value++;
    map[value] = `${prefix}${counter.value}`;
  }
  return map[value];
}

const companyCounterRef = { value: companyCounter };
const personCounterRef = { value: personCounter };

export function anonymizeHearingData(data: HearingData): HearingData {
  const companyAlias = getOrCreatePlaceholder(
    data.companyName,
    COMPANY_PLACEHOLDERS,
    "A社",
    companyCounterRef
  );

  // Replace company name in all text fields
  function replaceCompany(text: string): string {
    if (!text) return text;
    return text.replace(new RegExp(data.companyName, "g"), companyAlias);
  }

  // Replace person names (simple heuristic: Japanese names are often 2-4 chars)
  function anonymizePersonNames(text: string): string {
    if (!text) return text;
    // Replace common title patterns
    return text
      .replace(/([一-龯ぁ-んァ-ン]{2,4})\s*(部長|課長|社長|役員|担当)/g, (_, _name, title) => {
        return `担当者${title}`;
      })
      .replace(/([A-Z][a-z]+\s+[A-Z][a-z]+)/g, "担当者");
  }

  return {
    companyName: companyAlias,
    industry: data.industry,
    employeeCount: Math.round(data.employeeCount / 100) * 100, // Round to nearest 100
    targetLearners: Math.round(data.targetLearners / 50) * 50, // Round to nearest 50
    currentChallenges: anonymizePersonNames(replaceCompany(data.currentChallenges)),
    learningGoals: anonymizePersonNames(replaceCompany(data.learningGoals)),
    budget: data.budget, // Keep budget ranges, not exact figures
    timeline: data.timeline,
    competitorProducts: data.competitorProducts,
    keyStakeholders: anonymizePersonNames(replaceCompany(data.keyStakeholders))
      .replace(/[一-龯ぁ-んァ-ン]{2,4}/g, "担当者"),
    successMetrics: anonymizePersonNames(replaceCompany(data.successMetrics)),
    additionalNotes: anonymizePersonNames(replaceCompany(data.additionalNotes)),
  };
}

export function deanonymizeText(text: string, originalCompanyName: string): string {
  // Replace all aliases back with original company name
  for (const [original, alias] of Object.entries(COMPANY_PLACEHOLDERS)) {
    text = text.replace(new RegExp(alias, "g"), original);
  }
  return text;
}

export function clearAnonymizationCache(): void {
  Object.keys(COMPANY_PLACEHOLDERS).forEach((k) => delete COMPANY_PLACEHOLDERS[k]);
  Object.keys(PERSON_PLACEHOLDERS).forEach((k) => delete PERSON_PLACEHOLDERS[k]);
  companyCounterRef.value = 0;
  personCounterRef.value = 0;
}
