import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  activityLevel: z.enum(["sedentary", "light", "moderate", "active"]),
  goalMinutes: z.number().min(5).max(180),
  caloriesEaten: z.number().min(0),
  carbsEaten: z.number().min(0),
  proteinEaten: z.number().min(0).optional().default(0),
  steps: z.number().min(0),
  workoutDoneMin: z.number().min(0),
  recentMeals: z.array(z.object({
    name: z.string(),
    calories: z.number(),
    carbs: z.number(),
    score: z.string(),
  })).max(8),
  profile: z.object({
    name: z.string().nullable().optional(),
    age: z.number().nullable().optional(),
    gender: z.string().nullable().optional(),
    heightCm: z.number().nullable().optional(),
    weightKg: z.number().nullable().optional(),
    targetWeightKg: z.number().nullable().optional(),
    primaryGoal: z.string().nullable().optional(),
    workoutPreferences: z.array(z.string()).nullable().optional(),
  }).optional(),
});

export type WorkoutExercise = {
  name: string;
  durationMin: number;
  intensity: "Low" | "Medium" | "High";
  reason: string;
  emoji: string;
};

export type WorkoutPlan = {
  title: string;
  summary: string;
  totalMinutes: number;
  estCaloriesBurn: number;
  focus: string;
  exercises: WorkoutExercise[];
  motivation: string;
};

const SYSTEM = `You are CarbsFit's AI fitness coach for Indian Gen Z users focused on weight loss and belly fat reduction.
Generate a personalized daily workout plan based on user profile, activity level, eating data, and preferences.`;

function getFallbackWorkoutPlan(data: z.infer<typeof InputSchema>): WorkoutPlan {
  const goalMin = data.goalMinutes;
  const isHighCarb = data.carbsEaten > 150 || data.recentMeals.some(m => m.score === "C");
  const isBeginner = data.activityLevel === "sedentary" || data.activityLevel === "light";

  const exercises: WorkoutExercise[] = [];
  let remainingMin = goalMin;

  if (isHighCarb) {
    const hiitDuration = Math.min(15, Math.max(5, Math.floor(remainingMin * 0.4)));
    exercises.push({
      name: "High-Knee Jumping Jacks & Burpees",
      durationMin: hiitDuration,
      intensity: isBeginner ? "Medium" : "High",
      reason: `Targeting glucose spike from ${data.carbsEaten}g carbs eaten today.`,
      emoji: "⚡"
    });
    remainingMin -= hiitDuration;
  }

  const coreDuration = Math.min(10, Math.max(5, Math.floor(remainingMin * 0.3)));
  if (coreDuration > 0) {
    exercises.push({
      name: "Plank & Mountain Climbers Circuit",
      durationMin: coreDuration,
      intensity: "Medium",
      reason: "Belly fat activation & core stability.",
      emoji: "🔥"
    });
    remainingMin -= coreDuration;
  }

  if (remainingMin > 0) {
    exercises.push({
      name: "Surya Namaskar & Bodyweight Squats",
      durationMin: remainingMin,
      intensity: isBeginner ? "Low" : "Medium",
      reason: "Full-body mobility and metabolism boost.",
      emoji: "🧘"
    });
  }

  const totalMin = exercises.reduce((acc, ex) => acc + ex.durationMin, 0);
  const estBurn = Math.round(totalMin * (isHighCarb ? 8.5 : 6.5));

  return {
    title: isHighCarb ? "Carb-Burner HIIT & Core Circuit" : "Balanced Metabolic Boost Workout",
    summary: `Tailored for ${data.profile?.name || "you"}: ${totalMin} min session designed around today's ${data.carbsEaten}g carbs intake.`,
    totalMinutes: totalMin,
    estCaloriesBurn: estBurn,
    focus: isHighCarb ? "Belly Fat Burn & Carb Deficit" : "Core & Full-Body Conditioning",
    exercises,
    motivation: "Consistency is key — stay hydrated and crush today's quest! 🚀"
  };
}

export const generateWorkoutPlan = createServerFn({ method: "POST" })
  .validator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<WorkoutPlan> => {
    const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    const gatewayUrl = process.env.AI_GATEWAY_URL || "https://api.openai.com/v1/chat/completions";

    if (!apiKey) {
      console.warn("[CarbsFit AI] No AI API key configured. Using intelligent workout plan generator.");
      return getFallbackWorkoutPlan(data);
    }

    try {
      const p = data.profile ?? {};
      const profileLine = [
        p.name && `Name: ${p.name}`,
        p.age && `Age: ${p.age}`,
        p.gender && `Gender: ${p.gender}`,
        p.heightCm && `Height: ${p.heightCm}cm`,
        p.weightKg && `Weight: ${p.weightKg}kg`,
        p.targetWeightKg && `Target: ${p.targetWeightKg}kg`,
        p.primaryGoal && `Goal: ${p.primaryGoal}`,
        p.workoutPreferences?.length && `Prefers: ${p.workoutPreferences.join(", ")}`,
      ].filter(Boolean).join(" | ");

      const userPrompt = `Create today's personalized workout plan.
User profile: ${profileLine || "not provided"}
Activity level: ${data.activityLevel}
Goal: ${data.goalMinutes} min today
Already done: ${data.workoutDoneMin} min workout, ${data.steps} steps
Eaten today: ${data.caloriesEaten} kcal, ${data.carbsEaten}g carbs, ${data.proteinEaten}g protein
Recent meals: ${data.recentMeals.map(m => `${m.name} (${m.calories}kcal, ${m.carbs}g carbs, grade ${m.score})`).join("; ") || "none yet"}

Tailor exercise selection, intensity, and volume to the user's age, gender, current vs target weight (deficit needed), primary goal, and preferred workout styles. Respect their activity level — don't prescribe high-intensity to a beginner.`;

      const res = await fetch(gatewayUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.AI_MODEL || "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM },
            { role: "user", content: userPrompt },
          ],
          tools: [{
            type: "function",
            function: {
              name: "report_plan",
              description: "Return today's personalized workout plan.",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  summary: { type: "string", description: "1-2 sentence overview tying to their day's intake" },
                  totalMinutes: { type: "number" },
                  estCaloriesBurn: { type: "number" },
                  focus: { type: "string", description: "e.g. Belly fat burn, Strength + mobility" },
                  exercises: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        durationMin: { type: "number" },
                        intensity: { type: "string", enum: ["Low", "Medium", "High"] },
                        reason: { type: "string" },
                        emoji: { type: "string" },
                      },
                      required: ["name", "durationMin", "intensity", "reason", "emoji"],
                      additionalProperties: false,
                    },
                  },
                  motivation: { type: "string", description: "Short Gen Z hype line" },
                },
                required: ["title", "summary", "totalMinutes", "estCaloriesBurn", "focus", "exercises", "motivation"],
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "report_plan" } },
        }),
      });

      if (!res.ok) {
        console.error(`[CarbsFit AI] API error (${res.status}). Using fallback workout plan.`);
        return getFallbackWorkoutPlan(data);
      }

      const json = await res.json();
      const call = json?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      if (!call) return getFallbackWorkoutPlan(data);
      return JSON.parse(call) as WorkoutPlan;
    } catch (err) {
      console.error("[CarbsFit AI] Exception in workout plan generator:", err);
      return getFallbackWorkoutPlan(data);
    }
  });
