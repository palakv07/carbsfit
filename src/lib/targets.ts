import type { Profile } from "@/lib/auth";

export type DailyTargets = {
  calories: number;
  carbs: number; // g
  protein: number; // g
  water: number; // L
  workoutMin: number;
  bmr: number;
  tdee: number;
};

const ACTIVITY_MULT: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  beginner: 1.3,
  "lightly active": 1.375,
  "moderately active": 1.55,
  "very active": 1.725,
};

export function computeTargets(profile: Partial<Profile> | null | undefined): DailyTargets {
  const weight = profile?.weight_kg ?? 70;
  const height = profile?.height_cm ?? 170;
  const age = profile?.age ?? 28;
  const gender = (profile?.gender ?? "male").toLowerCase();
  const goal = (profile?.primary_goal ?? "").toLowerCase();
  const level = (profile?.activity_level ?? "moderate").toLowerCase();

  // Mifflin–St Jeor
  const s = gender.startsWith("f") ? -161 : 5;
  const bmr = Math.round(10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age) + s);
  const tdee = Math.round(bmr * (ACTIVITY_MULT[level] ?? 1.5));

  let calories = tdee;
  if (goal.includes("lose") || goal.includes("weight loss") || goal.includes("fat")) calories = Math.round(tdee - 400);
  else if (goal.includes("gain") || goal.includes("muscle") || goal.includes("bulk")) calories = Math.round(tdee + 300);

  const proteinPerKg = goal.includes("muscle") || goal.includes("gain") ? 1.8 : 1.4;
  const protein = Math.round(Number(weight) * proteinPerKg);
  const carbs = Math.max(120, Math.round((calories * 0.45) / 4));
  const water = Math.max(2, Math.min(4, Math.round((Number(weight) * 0.033) * 10) / 10));
  const workoutMin =
    level.includes("very") || level.includes("active") ? 45 :
    level.includes("moderate") ? 35 :
    level.includes("light") ? 25 : 20;

  return { calories, carbs, protein, water, workoutMin, bmr, tdee };
}

export function bmi(profile: Partial<Profile> | null | undefined): number | null {
  if (!profile?.weight_kg || !profile?.height_cm) return null;
  const h = Number(profile.height_cm) / 100;
  return Math.round((Number(profile.weight_kg) / (h * h)) * 10) / 10;
}
