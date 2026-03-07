import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const EXTRACT_SYSTEM_PROMPT = `あなたはUMUの製品情報を構造化データに変換する専門家です。
与えられたテキスト（製品資料、価格表、機能説明書、成功事例など）から、以下のJSON形式で情報を抽出してください。

情報が見つからない項目は空文字・空配列にしてください。価格は必ず数値（円）で返してください。

出力はJSONのみ、説明文は不要です。

\`\`\`json
{
  "product": {
    "name": "製品名",
    "tagline": "キャッチコピー・タグライン",
    "description": "製品説明文",
    "targetMarket": "ターゲット市場",
    "userCount": "ユーザー数（例: 700万人以上）",
    "countries": "展開国数（例: 150カ国以上）",
    "keyMessage": "キーメッセージ・価値提案",
    "website": "WebサイトURL"
  },
  "pricing": {
    "plans": {
      "premium": { "label": "Premium", "unitPrice": 0, "initialFee": 0, "description": "説明" },
      "standard": { "label": "Standard", "unitPrice": 0, "initialFee": 0, "description": "説明" },
      "light": { "label": "Light", "unitPrice": 0, "initialFee": 0, "description": "説明" }
    },
    "options": [
      { "id": "opt1", "name": "オプション名", "description": "説明", "priceType": "flat", "price": 0, "defaultFor": [] }
    ],
    "notes": "価格に関する注意事項"
  },
  "strengths": [
    { "id": "s1", "title": "強みのタイトル", "description": "詳細説明", "evidence": "根拠データ・数値", "category": "カテゴリ" }
  ],
  "successCases": [
    { "id": "c1", "industry": "業界", "company": "企業名（仮名OK）", "size": "従業員数", "challenge": "課題", "solution": "解決策", "result": "成果（数値含む）", "quote": "担当者コメント", "roi": "ROI", "planType": "Premium" }
  ],
  "copywriting": {
    "openingPhrases": ["フレーズ1", "フレーズ2"],
    "transformationPhrases": ["フレーズ1"],
    "roiPhrases": ["フレーズ1"],
    "urgencyPhrases": ["フレーズ1"],
    "closingPhrases": ["フレーズ1"],
    "premiumTagline": "",
    "standardTagline": "",
    "lightTagline": ""
  },
  "competitors": [
    { "id": "r1", "feature": "比較項目", "umuValue": "UMUの強み・特徴", "competitorValue": "競合他社の弱点・差異" }
  ],
  "additionalContext": "その他の補足情報"
}
\`\`\`

priceTypeは "per_id"（ID単価）または "flat"（固定額）のいずれかです。
planTypeは "Premium", "Standard", "Light" のいずれかです。
数値フィールド（unitPrice, initialFee, price）は必ず整数で返してください。`;

// Increase Vercel function timeout
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      text?: string;
      imageBase64?: string;
      imageMediaType?: string;
    };
    const { text, imageBase64, imageMediaType } = body;

    if (!text && !imageBase64) {
      return NextResponse.json({ error: "テキストまたは画像が必要です" }, { status: 400 });
    }
    if (text && !imageBase64 && text.trim().length < 10) {
      return NextResponse.json({ error: "テキストが短すぎます（10文字以上入力してください）" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
    type AllowedMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    const mediaType: AllowedMediaType = (allowedTypes as readonly string[]).includes(imageMediaType ?? "")
      ? (imageMediaType as AllowedMediaType)
      : "image/png";

    const messages: MessageParam[] = imageBase64
      ? [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: imageBase64 },
              },
              {
                type: "text",
                text: "この画像からUMU製品情報を抽出してください。価格表・製品資料・機能説明・成功事例・スクリーンショットなど、どんな形式でも構いません。読み取れる情報をすべてJSON形式で返してください。",
              },
            ],
          },
        ]
      : [
          {
            role: "user",
            content: `以下のテキストからUMU製品情報を抽出してください。\n\n---\n${text}\n---`,
          },
        ];

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      system: EXTRACT_SYSTEM_PROMPT,
      messages,
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "抽出に失敗しました" }, { status: 500 });
    }

    const jsonMatch =
      content.text.match(/```json\n([\s\S]*?)\n```/) ||
      content.text.match(/({[\s\S]*})/);

    if (!jsonMatch) {
      return NextResponse.json({ error: "JSONの解析に失敗しました" }, { status: 500 });
    }

    const extracted = JSON.parse(jsonMatch[1]);

    // Assign IDs if missing
    if (extracted.strengths) {
      extracted.strengths = extracted.strengths.map((s: Record<string, unknown>) => ({ ...s, id: s.id || uuidv4() }));
    }
    if (extracted.successCases) {
      extracted.successCases = extracted.successCases.map((c: Record<string, unknown>) => ({ ...c, id: c.id || uuidv4() }));
    }
    if (extracted.competitors) {
      extracted.competitors = extracted.competitors.map((r: Record<string, unknown>) => ({ ...r, id: r.id || uuidv4() }));
    }
    if (extracted.pricing?.options) {
      extracted.pricing.options = extracted.pricing.options.map((o: Record<string, unknown>) => ({ ...o, id: o.id || uuidv4() }));
    }

    // Build summary of what was extracted
    const summary = {
      product: !!(extracted.product?.description || extracted.product?.keyMessage),
      pricingFilled: extracted.pricing?.plans?.premium?.unitPrice > 0 || extracted.pricing?.plans?.standard?.unitPrice > 0,
      strengthsCount: extracted.strengths?.length ?? 0,
      casesCount: extracted.successCases?.length ?? 0,
      competitorsCount: extracted.competitors?.length ?? 0,
      phrasesCount: [
        ...(extracted.copywriting?.openingPhrases ?? []),
        ...(extracted.copywriting?.transformationPhrases ?? []),
      ].length,
    };

    return NextResponse.json({ extracted, summary });
  } catch (error) {
    console.error("Extract error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `抽出中にエラーが発生しました: ${message}` },
      { status: 500 }
    );
  }
}
