/**
 * Rule-based text parser for UMU product data extraction.
 * Works without any AI API key.
 */

import { v4 as uuidv4 } from "uuid";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExtractedData = Record<string, any>;

/** Extract a price value in yen from a string like "¥2,000", "2000円", "2,000円/ID" */
function parseYen(str: string): number {
  const m = str.replace(/,/g, "").match(/[¥￥]?\s*(\d+)\s*[円]?/);
  return m ? parseInt(m[1], 10) : 0;
}

/** Find lines that look like bullet points */
function extractBullets(lines: string[]): string[] {
  return lines
    .filter((l) => /^[・●■▶▸►✓✔◆◇→\-*•]/.test(l.trim()))
    .map((l) => l.replace(/^[・●■▶▸►✓✔◆◇→\-*•]\s*/, "").trim())
    .filter((l) => l.length > 4);
}

/** Normalize line breaks and remove empty lines */
function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

/** Find a value after a label like "製品名: XXX" */
function findLabelValue(lines: string[], patterns: RegExp[]): string {
  for (const line of lines) {
    for (const pat of patterns) {
      const m = line.match(pat);
      if (m && m[1]) return m[1].trim();
    }
  }
  return "";
}

/** Find section content following a heading */
function extractSection(lines: string[], headingPatterns: RegExp[]): string[] {
  let inSection = false;
  const result: string[] = [];
  for (const line of lines) {
    const isHeading = headingPatterns.some((p) => p.test(line));
    if (isHeading) { inSection = true; continue; }
    // Next heading ends the section
    if (inSection && /^[\u4e00-\u9faf\u3040-\u309f\u30a0-\u30ff]{2,}[:：]/.test(line) && !line.startsWith("・") && !line.startsWith("●")) {
      inSection = false;
    }
    if (inSection && line.length > 2) result.push(line);
  }
  return result;
}

export function parseTextToConfig(text: string): ExtractedData {
  const lines = splitLines(text);
  const fullText = lines.join(" ");

  // ── Product info ──
  const productName = findLabelValue(lines, [
    /製品名[：:]\s*(.+)/,
    /商品名[：:]\s*(.+)/,
    /サービス名[：:]\s*(.+)/,
    /ツール名[：:]\s*(.+)/,
  ]) || "UMU";

  const tagline = findLabelValue(lines, [
    /タグライン[：:]\s*(.+)/,
    /キャッチ[：:]\s*(.+)/,
    /コピー[：:]\s*(.+)/,
  ]);

  const description = findLabelValue(lines, [
    /製品説明[：:]\s*(.+)/,
    /概要[：:]\s*(.+)/,
    /説明[：:]\s*(.+)/,
  ]);

  const keyMessage = findLabelValue(lines, [
    /キーメッセージ[：:]\s*(.+)/,
    /価値提案[：:]\s*(.+)/,
    /メッセージ[：:]\s*(.+)/,
  ]);

  const targetMarket = findLabelValue(lines, [
    /ターゲット[：:]\s*(.+)/,
    /対象[：:]\s*(.+)/,
    /顧客層[：:]\s*(.+)/,
  ]);

  const userCount = findLabelValue(lines, [
    /ユーザー数[：:]\s*(.+)/,
    /利用者数[：:]\s*(.+)/,
    /導入実績[：:]\s*(.+)/,
  ]);

  const countries = findLabelValue(lines, [
    /展開国[：:]\s*(.+)/,
    /カ国[：:]\s*(.+)/,
    /対応国[：:]\s*(.+)/,
  ]);

  // ── Pricing ──
  // Look for patterns like "Premium 2,000円/ID" or "スタンダード：月額1500円"
  const priceLines = lines.filter((l) =>
    /[¥￥0-9][0-9,]*[円]?/.test(l) && l.length < 200
  );

  function findPlanPrice(planPatterns: RegExp[]): number {
    for (const line of priceLines) {
      if (planPatterns.some((p) => p.test(line))) {
        return parseYen(line);
      }
    }
    return 0;
  }

  function findInitialFee(planPatterns: RegExp[]): number {
    const feeLines = lines.filter((l) =>
      /初期[費料]|初期費用|セットアップ/.test(l) && /[¥￥0-9][0-9,]*[円]?/.test(l)
    );
    for (const line of feeLines) {
      if (planPatterns.some((p) => p.test(line))) {
        return parseYen(line);
      }
    }
    // fallback: find any initial fee mention near plan name in full text
    const m = fullText.match(/初期[費料][：:\s]*[¥￥]?\s*([0-9,]+)\s*円/);
    return m ? parseInt(m[1].replace(/,/g, ""), 10) : 0;
  }

  const premiumPrice = findPlanPrice([/[Pp]remium|プレミアム|最上位|上位|エンタープライズ/i]);
  const standardPrice = findPlanPrice([/[Ss]tandard|スタンダード|標準|ベーシック|基本/i]);
  const lightPrice = findPlanPrice([/[Ll]ight|ライト|エントリー|お試し|簡易/i]);

  // If only one price found, try to use it for standard
  const prices = [premiumPrice, standardPrice, lightPrice];
  const allPrices: number[] = [];
  priceLines.forEach((l) => {
    // Require a currency indicator to avoid false positives like "92%"
    if (!/[円¥￥]|\/ID|\/月/.test(l)) return;
    const val = parseYen(l);
    if (val > 100 && val < 1_000_000) allPrices.push(val);
  });
  const uniquePrices = Array.from(new Set(allPrices)).sort((a, b) => b - a);

  const finalPremiumPrice = premiumPrice || uniquePrices[0] || 0;
  const finalStandardPrice = standardPrice || uniquePrices[1] || 0;
  const finalLightPrice = lightPrice || uniquePrices[2] || 0;

  // ── Strengths ──
  const strengthsSection = extractSection(lines, [/強み|特徴|メリット|ポイント|機能|フィーチャー/]);
  const bulletStrengths = extractBullets(strengthsSection.length > 0 ? strengthsSection : lines);

  const strengths = bulletStrengths.slice(0, 8).map((b, i) => ({
    id: uuidv4(),
    title: b.length > 30 ? b.slice(0, 30) : b,
    description: b,
    evidence: "",
    category: "機能",
  }));

  // ── Success cases ──
  const casesSection = extractSection(lines, [/事例|導入事例|成功事例|実績|ケーススタディ/]);
  const successCases = [];
  let caseBuffer: string[] = [];

  for (const line of casesSection) {
    if (/^[\u4e00-\u9fafA-Za-z0-9].*[社会株]/.test(line) || caseBuffer.length === 0) {
      if (caseBuffer.length > 0) {
        successCases.push({
          id: uuidv4(),
          industry: "",
          company: caseBuffer[0] || "事例企業",
          size: "",
          challenge: "",
          solution: "",
          result: caseBuffer.slice(1).join(" "),
          quote: "",
          roi: "",
          planType: "Standard",
        });
      }
      caseBuffer = [line];
    } else {
      caseBuffer.push(line);
    }
  }
  if (caseBuffer.length > 0 && successCases.length < 5) {
    successCases.push({
      id: uuidv4(),
      industry: "",
      company: caseBuffer[0] || "事例企業",
      size: "",
      challenge: "",
      solution: "",
      result: caseBuffer.slice(1).join(" "),
      quote: "",
      roi: "",
      planType: "Standard",
    });
  }

  // ── Copywriting phrases ──
  const phraseSection = extractSection(lines, [/フレーズ|コピー|キャッチ|メッセージ/]);
  const openingPhrases = extractBullets(phraseSection.length > 0 ? phraseSection : []).slice(0, 5);

  // ── Competitor info ──
  const competitorSection = extractSection(lines, [/競合|比較|他社|差別化/]);
  const competitors = extractBullets(competitorSection).slice(0, 5).map((b, i) => ({
    id: uuidv4(),
    feature: `比較項目 ${i + 1}`,
    umuValue: b,
    competitorValue: "",
  }));

  // ── Build result ──
  const result: ExtractedData = {};

  const hasProduct = !!(productName || tagline || description || keyMessage);
  if (hasProduct) {
    result.product = {
      name: productName,
      tagline,
      description,
      targetMarket,
      userCount,
      countries,
      keyMessage,
      website: "",
    };
  }

  if (finalPremiumPrice > 0 || finalStandardPrice > 0 || finalLightPrice > 0) {
    result.pricing = {
      plans: {
        premium: { label: "Premium", unitPrice: finalPremiumPrice, initialFee: findInitialFee([/[Pp]remium|プレミアム/]), description: "" },
        standard: { label: "Standard", unitPrice: finalStandardPrice, initialFee: findInitialFee([/[Ss]tandard|スタンダード/]), description: "" },
        light: { label: "Light", unitPrice: finalLightPrice, initialFee: findInitialFee([/[Ll]ight|ライト/]), description: "" },
      },
      options: [],
      notes: "",
    };
  }

  if (strengths.length > 0) result.strengths = strengths;
  if (successCases.length > 0) result.successCases = successCases;
  if (competitors.length > 0) result.competitors = competitors;
  if (openingPhrases.length > 0) {
    result.copywriting = {
      openingPhrases,
      transformationPhrases: [],
      roiPhrases: [],
      urgencyPhrases: [],
      closingPhrases: [],
      premiumTagline: "",
      standardTagline: "",
      lightTagline: "",
    };
  }

  return result;
}

export function buildSummaryFromParsed(extracted: ExtractedData) {
  return {
    product: !!(extracted.product?.description || extracted.product?.keyMessage || extracted.product?.name),
    pricingFilled: (extracted.pricing?.plans?.premium?.unitPrice ?? 0) > 0 || (extracted.pricing?.plans?.standard?.unitPrice ?? 0) > 0,
    strengthsCount: extracted.strengths?.length ?? 0,
    casesCount: extracted.successCases?.length ?? 0,
    competitorsCount: extracted.competitors?.length ?? 0,
    phrasesCount: (extracted.copywriting?.openingPhrases ?? []).length,
  };
}
