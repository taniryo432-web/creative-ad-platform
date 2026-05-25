import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { analysis: "OpenAI APIキーが設定されていません。.env.localにOPENAI_API_KEYを設定してください。" },
      { status: 200 }
    );
  }

  const { title, description, adUrl } = await request.json();

  const prompt = `以下の広告クリエイティブのアイディアを分析してください。

タイトル: ${title}
説明: ${description || "なし"}
広告URL: ${adUrl || "なし"}

以下の観点で日本語で分析してください（各項目2-3文程度）：
1. **ターゲット**: 想定ターゲット層
2. **訴求ポイント**: 主要な価値提案・差別化要素
3. **クリエイティブの強み**: なぜこのアプローチが効果的か
4. **改善提案**: さらに良くするためのアイデア`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 600,
  });

  const analysis = response.choices[0]?.message?.content ?? "分析できませんでした。";

  return NextResponse.json({ analysis });
}
