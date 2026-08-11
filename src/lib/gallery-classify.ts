import type { GalleryCategoryId } from "@/lib/gallery";

export type GalleryClassificationConfidence = "high" | "medium" | "low";

export type GalleryClassification = {
  category: GalleryCategoryId;
  confidence: GalleryClassificationConfidence;
  reason: string;
  aiEnabled: boolean;
};

const VALID_CATEGORIES = new Set<GalleryCategoryId>([
  "signatureHaircut",
  "signatureHaircutBeard",
  "kids",
  "general",
]);

const CLASSIFY_PROMPT = `You classify barbershop gallery photos for The Barber Lounge website.

Return JSON only: { "category": "<id>", "confidence": "<high|medium|low>", "reason": "<short phrase>" }

Categories:
- signatureHaircut — adult/teen haircut or fade with little or no beard work (regular cuts)
- signatureHaircutBeard — haircut plus beard trim/grooming, or prominent beard styling
- kids — child or young kid getting a haircut (typically under ~13)
- general — shop interior, barber chairs, team/staff, tools, signage, or atmosphere (no client haircut focus)

Pick the single best category. If unsure between haircut types, prefer signatureHaircut.`;

export function isGalleryAiEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function defaultGalleryClassification(
  reason = "Choose a category manually.",
): GalleryClassification {
  return {
    category: "signatureHaircut",
    confidence: "low",
    reason,
    aiEnabled: false,
  };
}

function parseClassificationPayload(
  raw: unknown,
  aiEnabled: boolean,
): GalleryClassification | null {
  if (!raw || typeof raw !== "object") return null;

  const payload = raw as Record<string, unknown>;
  const category = payload.category;
  const confidence = payload.confidence;
  const reason = payload.reason;

  if (typeof category !== "string" || !VALID_CATEGORIES.has(category as GalleryCategoryId)) {
    return null;
  }

  const normalizedConfidence: GalleryClassificationConfidence =
    confidence === "high" || confidence === "medium" || confidence === "low"
      ? confidence
      : "medium";

  return {
    category: category as GalleryCategoryId,
    confidence: normalizedConfidence,
    reason: typeof reason === "string" && reason.trim() ? reason.trim() : "AI classification",
    aiEnabled,
  };
}

export async function classifyGalleryImage(
  buffer: Buffer,
  mimeType: string,
): Promise<GalleryClassification> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return defaultGalleryClassification(
      "Add OPENAI_API_KEY for auto-sort — pick a category below.",
    );
  }

  const base64 = buffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: CLASSIFY_PROMPT },
              { type: "image_url", image_url: { url: dataUrl, detail: "low" } },
            ],
          },
        ],
        max_tokens: 120,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("OpenAI classify failed:", response.status, detail);
      return defaultGalleryClassification("AI classification failed — choose a category.");
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return defaultGalleryClassification("AI returned no result — choose a category.");
    }

    const parsed = parseClassificationPayload(JSON.parse(content), true);
    if (!parsed) {
      return defaultGalleryClassification("AI response was invalid — choose a category.");
    }

    return parsed;
  } catch (error) {
    console.error("Gallery classify error:", error);
    return defaultGalleryClassification("AI classification error — choose a category.");
  }
}
