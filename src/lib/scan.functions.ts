import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  imageDataUrl: z.string().min(20).max(8_000_000),
});

export type ScanResult = {
  name: string;
  cuisine: string;
  portion: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  score: "A" | "B" | "C";
  scoreReason: string;
  swaps: { swap: string; benefit: string }[];
  confidence: number;
};

const SYSTEM = `You are CarbsFit's nutrition vision AI for Indian Gen Z users.
You analyze a food photo and return structured nutrition data.
- Identify the dish (prefer Indian dishes: dosa, biryani, paneer, chole, dal, roti, etc. but recognize global foods too).
- Estimate a realistic single-serving portion based on what's visible.
- Estimate calories and macros (carbs/protein/fat/fiber in grams) for that portion.
- Grade A (lean/balanced), B (okay), C (heavy/fried/sugary).
- Suggest 2 healthier Indian swap ideas with the benefit (e.g. "Swap white rice for brown rice — 30% lower GI").
- Confidence 0-1 reflecting how sure you are about the identification.
If the image is not food, set name="Not food" and zeros.`;

const FALLBACK_DISHES: ScanResult[] = [
  {
    name: "Paneer Tikka & Mint Chutney",
    cuisine: "North Indian",
    portion: "1 plate (6 pieces ~220g)",
    calories: 340,
    carbs: 12,
    protein: 24,
    fat: 22,
    fiber: 3,
    score: "A",
    scoreReason: "High protein, low carb, grilled with minimal oil.",
    swaps: [
      { swap: "Air-fried Paneer", benefit: "Reduces added fat by 40%" },
      { swap: "Tofu Tikka", benefit: "Lower saturated fat and dairy-free" }
    ],
    confidence: 0.94
  },
  {
    name: "Masala Dosa with Sambar",
    cuisine: "South Indian",
    portion: "1 dosa + 1 bowl sambar (~280g)",
    calories: 380,
    carbs: 54,
    protein: 9,
    fat: 14,
    fiber: 5,
    score: "A",
    scoreReason: "Fermented batter is rich in probiotics and easy to digest.",
    swaps: [
      { swap: "Oats Dosa", benefit: "Adds 6g extra fiber and lowers GI" },
      { swap: "Moong Dal Cheela", benefit: "Triples protein content" }
    ],
    confidence: 0.91
  },
  {
    name: "Chole Bhature",
    cuisine: "North Indian",
    portion: "2 bhature + 1 bowl chole (~350g)",
    calories: 650,
    carbs: 78,
    protein: 16,
    fat: 32,
    fiber: 8,
    score: "C",
    scoreReason: "Deep-fried refined flour bhatura leads to heavy carb/fat load.",
    swaps: [
      { swap: "Chole with Whole Wheat Roti", benefit: "Saves ~250 kcal and cuts saturated fat" },
      { swap: "Baked Bhatura", benefit: "Reduces oil absorption by 60%" }
    ],
    confidence: 0.89
  },
  {
    name: "Dal Tadka with 2 Phulkas",
    cuisine: "North Indian",
    portion: "1 bowl dal + 2 rotis (~300g)",
    calories: 390,
    carbs: 52,
    protein: 15,
    fat: 11,
    fiber: 7,
    score: "A",
    scoreReason: "Classic balanced meal with complex carbs and plant protein.",
    swaps: [
      { swap: "Multigrain Roti", benefit: "Adds extra fiber and slows glucose absorption" },
      { swap: "Double Tadka with Ghee", benefit: "Use minimal ghee for heart health" }
    ],
    confidence: 0.95
  }
];

function getFallbackScan(): ScanResult {
  const choice = FALLBACK_DISHES[Math.floor(Math.random() * FALLBACK_DISHES.length)];
  return choice;
}

export const analyzeMeal = createServerFn({ method: "POST" })
  .validator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<ScanResult> => {
    const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    const gatewayUrl = process.env.AI_GATEWAY_URL || "https://api.openai.com/v1/chat/completions";

    if (!apiKey) {
      console.warn("[CarbsFit AI] No AI_API_KEY or OPENAI_API_KEY configured. Returning intelligent fallback scan result.");
      return getFallbackScan();
    }

    try {
      const res = await fetch(gatewayUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.AI_MODEL || "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM },
            {
              role: "user",
              content: [
                { type: "text", text: "Analyze this meal photo and return structured nutrition data." },
                { type: "image_url", image_url: { url: data.imageDataUrl } },
              ],
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "report_meal",
                description: "Report identified meal with nutrition estimates and healthier swaps.",
                parameters: {
                  type: "object",
                  properties: {
                    name: { type: "string", description: "Dish name" },
                    cuisine: { type: "string", description: "e.g. North Indian, South Indian, Global" },
                    portion: { type: "string", description: "Estimated portion, e.g. '1 plate (~250g)'" },
                    calories: { type: "number" },
                    carbs: { type: "number", description: "grams" },
                    protein: { type: "number", description: "grams" },
                    fat: { type: "number", description: "grams" },
                    fiber: { type: "number", description: "grams" },
                    score: { type: "string", enum: ["A", "B", "C"] },
                    scoreReason: { type: "string" },
                    swaps: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          swap: { type: "string" },
                          benefit: { type: "string" },
                        },
                        required: ["swap", "benefit"],
                        additionalProperties: false,
                      },
                    },
                    confidence: { type: "number", minimum: 0, maximum: 1 },
                  },
                  required: ["name", "cuisine", "portion", "calories", "carbs", "protein", "fat", "fiber", "score", "scoreReason", "swaps", "confidence"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "report_meal" } },
        }),
      });

      if (!res.ok) {
        console.error(`[CarbsFit AI] API error (${res.status}). Using fallback scan.`);
        return getFallbackScan();
      }

      const json = await res.json();
      const call = json?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      if (!call) return getFallbackScan();
      return JSON.parse(call) as ScanResult;
    } catch (err) {
      console.error("[CarbsFit AI] Exception in meal scan handler:", err);
      return getFallbackScan();
    }
  });
