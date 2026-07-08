import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

const payloadSchema = z.object({
  message: z.string().min(2).max(800),
});

const OPENAI_TIMEOUT_MS = 10000;

function fallbackReply(prompt: string) {
  const text = prompt.toLowerCase();

  if (
    text.includes("weather") ||
    text.includes("mausam") ||
    text.includes("barish")
  ) {
    return "Weather advisory: humidity aur wind check karke spray timing decide karein. High rain chance par spray postpone karna better hota hai.";
  }

  if (
    text.includes("disease") ||
    text.includes("fungus") ||
    text.includes("leaf") ||
    text.includes("rust")
  ) {
    return "Disease support: crop naam, growth stage, aur symptom detail share karein. Main first-line diagnosis aur recommended control steps suggest karta hoon.";
  }

  if (
    text.includes("product") ||
    text.includes("price") ||
    text.includes("dealer") ||
    text.includes("rate")
  ) {
    return "Product recommendation: crop + issue + acreage batayein. Main suitable category, expected dosage range, aur pricing tier suggest karunga.";
  }

  if (
    text.includes("order") ||
    text.includes("delivery") ||
    text.includes("tracking")
  ) {
    return "Order help: dashboard ke orders tab me tracking details mil jayengi. Urgent case me support number par order number share karein.";
  }

  return "Main agriculture support assistant hoon. Aap crop disease, weather, product recommendation, dosage, aur order se related sawal pooch sakte hain.";
}

async function generateOpenAIReply(message: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    signal: controller.signal,
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "You are an agriculture support assistant for Subhani Agrizone. Reply in concise Roman Urdu + simple English mix. Focus on safe agronomy guidance, product discovery, weather caution, and support escalation.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    }),
  }).finally(() => {
    clearTimeout(timer);
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  return typeof content === "string" && content.trim() ? content.trim() : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = payloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid chat payload" },
        { status: 422 },
      );
    }

    const message = parsed.data.message;
    const aiReply = await generateOpenAIReply(message);

    return NextResponse.json({
      reply: aiReply ?? fallbackReply(message),
      source: aiReply ? "openai" : "fallback",
    });
  } catch {
    return NextResponse.json(
      { reply: "Support service temporarily unavailable. Please try again." },
      { status: 200 },
    );
  }
}
