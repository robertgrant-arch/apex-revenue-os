import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { vertical, type, prompt } = await req.json();

    if (!vertical || !type) {
      return NextResponse.json(
        { error: "vertical and type are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const systemPrompt = `You are an expert direct-response copywriter specializing in insurance advertising for regulated verticals. You write high-converting ad copy that is compliant, clear, and compelling. Always respond with valid JSON only, no markdown.`;

    const userPrompt = `Generate ad creative for the following:
Vertical: ${vertical} Insurance
Ad Type: ${type}
${prompt ? `Additional context: ${prompt}` : ""}

Return a JSON object with exactly these fields:
{
  "headline": "compelling headline under 10 words",
  "body": "body copy 2-3 sentences, benefit-focused, compliant",
  "cta": "CTA button text, 2-5 words",
  "imageDescription": "detailed visual description of ONLY the scene and people, NO text or words should appear in the image. Describe the setting, people, lighting, and mood only.",
  "predictedCTR": a number between 1.5 and 6.5 representing predicted click-through rate percentage
}`;

    // Step 1: Generate ad copy with GPT
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json(
        { error: err.error?.message || "OpenAI request failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";

    let creative: Record<string, unknown>;
    try {
      const clean = raw.replace(/```json|```/g, "").trim();
      creative = JSON.parse(clean);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse OpenAI response", raw },
        { status: 500 }
      );
    }

    // Step 2: Generate hyper-realistic image with GPT Image 1
    let imageUrl: string | undefined;
    try {
      const imagePrompt = `Hyper-realistic professional stock photograph: ${creative.imageDescription}. CRITICAL: Do NOT include any text, words, letters, numbers, logos, watermarks, or typography anywhere in the image. The image must contain ONLY the visual scene with zero text elements. Ultra high quality, photorealistic, natural lighting, shallow depth of field, editorial photography style, shot on Canon EOS R5.`;
      const imgResponse = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: imagePrompt,
          n: 1,
          size: "1024x1024",
          quality: "low",
        }),
      });

      if (imgResponse.ok) {
        const imgData = await imgResponse.json();
        const b64 = imgData.data?.[0]?.b64_json;
        if (b64) {
          imageUrl = `data:image/png;base64,${b64}`;
        }
      }
    } catch {
      // Image generation failed, continue without image
    }

    return NextResponse.json({
      id: `gen-${Date.now()}`,
      vertical,
      type,
      ...creative,
      imageUrl,
      status: "active",
      impressions: 0,
      clicks: 0,
      actualCTR: null,
      createdAt: new Date().toISOString(),
      generated: true,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}