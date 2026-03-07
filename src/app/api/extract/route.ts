import { NextRequest, NextResponse } from "next/server";
import { parseTextToConfig, buildSummaryFromParsed } from "@/lib/textParser";

export const runtime = "nodejs";
export const maxDuration = 60;

// Check if a real API key is configured (not empty, not a placeholder)
function hasValidApiKey(): boolean {
  const key = process.env.ANTHROPIC_API_KEY ?? "";
  return key.startsWith("sk-ant-") && key.length > 20 && !key.includes("placeholder");
}

async function extractWithAI(text: string | undefined, imageBase64: string | undefined, imageMediaType: string | undefined) {
  // Lazy-import Anthropic only when we have a valid key
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const SYSTEM_PROMPT = `あなたはUMUの製品情報を構造化データに変換する専門家です。
与えられたテキスト（製品資料、価格表、機能説明書、成功事例など）から、以下のJSON形式で情報を抽出してください。

情報が見つからない項目は空文字・空配列にしてください。価格は必ず数値（円）で返してください。

出力はJSONのみ、説明文は不要です。

\`\`\`json
{
  "product": { "name": "", "tagline": "", "description": "", "targetMarket": "", "userCount": "", "countries": "", "keyMessage": "", "website": "" },
  "pricing": {
    "plans": {
      "premium": { "label": "Premium", "unitPrice": 0, "initialFee": 0, "description": "" },
      "standard": { "label": "Standard", "unitPrice": 0, "initialFee": 0, "description": "" },
      "light": { "label": "Light", "unitPrice": 0, "initialFee": 0, "description": "" }
    },
    "options": [],
    "notes": ""
  },
  "strengths": [{ "id": "s1", "title": "", "description": "", "evidence": "", "category": "" }],
  "successCases": [{ "id": "c1", "industry": "", "company": "", "size": "", "challenge": "", "solution": "", "result": "", "quote": "", "roi": "", "planType": "Standard" }],
  "copywriting": { "openingPhrases": [], "transformationPhrases": [], "roiPhrases": [], "urgencyPhrases": [], "closingPhrases": [], "premiumTagline": "", "standardTagline": "", "lightTagline": "" },
  "competitors": [{ "id": "r1", "feature": "", "umuValue": "", "competitorValue": "" }],
  "additionalContext": ""
}
\`\`\``;

  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
  type AllowedMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  const mediaType: AllowedMediaType = (allowedTypes as readonly string[]).includes(imageMediaType ?? "")
    ? (imageMediaType as AllowedMediaType)
    : "image/png";

  const messages = imageBase64
    ? [
        {
          role: "user" as const,
          content: [
            { type: "image" as const, source: { type: "base64" as const, media_type: mediaType, data: imageBase64 } },
            { type: "text" as const, text: "この画像からUMU製品情報を抽出してください。読み取れる情報をすべてJSON形式で返してください。" },
          ],
        },
      ]
    : [{ role: "user" as const, content: `以下のテキストからUMU製品情報を抽出してください。\n\n---\n${text}\n---` }];

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages,
  });

  const content = response.content[0];
  if (content.type !== "text") throw new Error("AIが応答しませんでした");

  const jsonMatch = content.text.match(/```json\n([\s\S]*?)\n```/) || content.text.match(/({[\s\S]*})/);
  if (!jsonMatch) throw new Error("AIの応答からJSONを取得できませんでした");

  return JSON.parse(jsonMatch[1]);
}

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
    if (text && !imageBase64 && text.trim().length < 5) {
      return NextResponse.json({ error: "テキストが短すぎます（5文字以上入力してください）" }, { status: 400 });
    }

    // Image extraction requires AI API key
    if (imageBase64 && !hasValidApiKey()) {
      return NextResponse.json(
        { error: "画像の解析にはAnthropicのAPIキーが必要です。テキスト入力モードをご利用ください。" },
        { status: 400 }
      );
    }

    let extracted: Record<string, unknown>;
    let aiUsed = false;

    if (hasValidApiKey()) {
      // Try AI extraction first
      try {
        extracted = await extractWithAI(text, imageBase64, imageMediaType);
        aiUsed = true;
      } catch (aiError) {
        // AI failed – fall back to rule-based parser for text
        console.warn("AI extraction failed, falling back to parser:", aiError);
        if (text) {
          extracted = parseTextToConfig(text);
        } else {
          throw aiError; // Can't fall back for images
        }
      }
    } else {
      // No API key – use rule-based parser for text
      if (!text) {
        return NextResponse.json(
          { error: "画像の解析にはAnthropicのAPIキーが必要です。テキスト入力モードをご利用ください。" },
          { status: 400 }
        );
      }
      extracted = parseTextToConfig(text);
    }

    const summary = buildSummaryFromParsed(extracted);

    return NextResponse.json({ extracted, summary, aiUsed });
  } catch (error) {
    console.error("Extract error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `抽出中にエラーが発生しました: ${message}` },
      { status: 500 }
    );
  }
}
