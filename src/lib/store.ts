import { useSyncExternalStore } from "react";

export type Quest = {
  id: string;
  title: string;
  desc: string;
  reward: number;
  diff: "Easy" | "Medium" | "Hard";
  emoji: string;
  target: number;
  progress: number;
  unit: string;
  time: string;
};

export type Scan = {
  id: string;
  name: string;
  carbs: number;
  cal: number;
  protein?: number;
  fat?: number;
  fiber?: number;
  portion?: string;
  score: "A" | "B" | "C";
  scoreReason?: string;
  swaps?: { swap: string; benefit: string }[];
  imageUrl?: string;
  ts: number;
};

export type ChatMsg = { id: string; from: "ai" | "user"; text: string };

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active";

export type WorkoutPlanState = {
  title: string;
  summary: string;
  totalMinutes: number;
  estCaloriesBurn: number;
  focus: string;
  exercises: { name: string; durationMin: number; intensity: "Low" | "Medium" | "High"; reason: string; emoji: string; done?: boolean }[];
  motivation: string;
  generatedAt: number;
};

export type Badge = { name: string; emoji: string; earned: boolean };

export type State = {
  name: string;
  xp: number;
  level: number;
  streak: number;
  lastActiveDay: string;
  water: number; // L
  calories: number;
  carbs: number;
  workout: number; // min
  steps: number;
  quests: Quest[];
  scans: Scan[];
  chat: ChatMsg[];
  badges: Badge[];
  theme: "dark" | "light";
  language: "English" | "हिन्दी";
  notifications: boolean;
  activityLevel: ActivityLevel;
  workoutGoalMin: number;
  workoutPlan: WorkoutPlanState | null;
};

const XP_PER_LEVEL = 800;
const TITLES = ["Carb Rookie", "Health Cadet", "Macro Mage", "Nutrition Ninja", "Fit Sentinel", "Lean Legend"];

const todayKey = () => new Date().toISOString().slice(0, 10);

const defaultQuests = (): Quest[] => [
  { id: "water", title: "Drink 3L water", desc: "Hydration boost", reward: 25, diff: "Easy", emoji: "💧", target: 3, progress: 1.8, unit: "L", time: "8h left" },
  { id: "steps", title: "Walk 8,000 steps", desc: "Get moving", reward: 50, diff: "Medium", emoji: "🚶", target: 8000, progress: 3360, unit: "steps", time: "6h left" },
  { id: "carbs", title: "Stay under 200g carbs", desc: "Carb control", reward: 100, diff: "Hard", emoji: "🥗", target: 200, progress: 170, unit: "g", time: "All day" },
  { id: "hiit", title: "15 min HIIT", desc: "Burn it off", reward: 75, diff: "Hard", emoji: "🔥", target: 15, progress: 0, unit: "min", time: "Anytime" },
  { id: "breakfast", title: "Protein-rich breakfast", desc: "Start strong", reward: 30, diff: "Easy", emoji: "🍳", target: 1, progress: 1, unit: "✓", time: "Done" },
];

const defaultBadges = (): Badge[] => [
  { name: "Carb Crusher", emoji: "🥗", earned: true },
  { name: "Streak King", emoji: "🔥", earned: true },
  { name: "Dawn Warrior", emoji: "🌅", earned: true },
  { name: "Hydro Hero", emoji: "💧", earned: false },
  { name: "Iron Will", emoji: "💪", earned: false },
  { name: "Zen Master", emoji: "🧘", earned: false },
];

const defaultState = (): State => ({
  name: "Aarav",
  xp: 2840,
  level: 4,
  streak: 12,
  lastActiveDay: todayKey(),
  water: 1.8,
  calories: 1240,
  carbs: 142,
  workout: 22,
  steps: 3360,
  quests: defaultQuests(),
  scans: [
    { id: "s1", name: "Paneer Butter Masala", carbs: 18, cal: 420, score: "B", ts: Date.now() - 86400000 },
    { id: "s2", name: "Masala Dosa", carbs: 42, cal: 380, score: "A", ts: Date.now() - 172800000 },
    { id: "s3", name: "Chole Bhature", carbs: 75, cal: 650, score: "C", ts: Date.now() - 259200000 },
  ],
  chat: [
    { id: "c1", from: "ai", text: "Namaste Aarav! 🙌 Ready to crush today's quests?" },
  ],
  badges: defaultBadges(),
  theme: "dark",
  language: "English",
  notifications: true,
  activityLevel: "moderate",
  workoutGoalMin: 30,
  workoutPlan: null,
});

const STORAGE_KEY = "carbsfit:state:v1";

let state: State = (() => {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = { ...defaultState(), ...JSON.parse(raw) } as State;
    // streak rollover
    const today = todayKey();
    if (parsed.lastActiveDay !== today) {
      const y = new Date(); y.setDate(y.getDate() - 1);
      const yk = y.toISOString().slice(0, 10);
      parsed.streak = parsed.lastActiveDay === yk ? parsed.streak : 0;
      parsed.lastActiveDay = today;
    }
    return parsed;
  } catch { return defaultState(); }
})();

const listeners = new Set<() => void>();
const persist = () => {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
const emit = () => { persist(); listeners.forEach((l) => l()); };

const setState = (updater: (s: State) => Partial<State> | void) => {
  const patch = updater(state);
  if (patch) state = { ...state, ...patch };
  else state = { ...state };
  emit();
};

export const useStore = <T,>(selector: (s: State) => T): T =>
  useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => selector(state),
    () => selector(state),
  );

export const getState = () => state;

export const titleForLevel = (lvl: number) => TITLES[Math.min(lvl, TITLES.length - 1)];
export const xpToNext = (xp: number) => XP_PER_LEVEL - (xp % XP_PER_LEVEL);
export const levelProgress = (xp: number) => ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
export const levelFromXp = (xp: number) => Math.floor(xp / XP_PER_LEVEL);

export const xpForExercise = (min: number, intensity: "Low" | "Medium" | "High") => {
  const mult = intensity === "High" ? 8 : intensity === "Medium" ? 6 : 4;
  return Math.max(10, Math.round(min * mult));
};

// ===== Actions =====
export const actions = {
  awardXp(amount: number) {
    setState((s) => {
      const xp = s.xp + amount;
      return { xp, level: levelFromXp(xp) };
    });
  },
  bumpQuest(id: string, by: number) {
    let xpEarned = 0;
    let completed = false;
    setState((s) => {
      const quests = s.quests.map((q) => {
        if (q.id !== id) return q;
        const wasDone = q.progress >= q.target;
        const progress = Math.min(q.target, q.progress + by);
        if (!wasDone && progress >= q.target) { xpEarned = q.reward; completed = true; }
        return { ...q, progress };
      });
      const xp = s.xp + xpEarned;
      const patch: Partial<State> = { quests, xp, level: levelFromXp(xp) };
      if (id === "water") patch.water = Math.min(3, s.water + by);
      if (id === "steps") patch.steps = s.steps + by;
      if (id === "hiit") patch.workout = s.workout + by;
      return patch;
    });
    return { xpEarned, completed };
  },
  addScan(scan: Omit<Scan, "id" | "ts">) {
    setState((s) => {
      const newScan: Scan = { ...scan, id: `s${Date.now()}`, ts: Date.now() };
      const xp = s.xp + 10;
      return {
        scans: [newScan, ...s.scans].slice(0, 20),
        calories: s.calories + scan.cal,
        carbs: s.carbs + scan.carbs,
        xp, level: levelFromXp(xp),
      };
    });
  },
  sendChat(text: string) {
    const userMsg: ChatMsg = { id: `m${Date.now()}`, from: "user", text };
    setState((s) => ({ chat: [...s.chat, userMsg] }));
    // simulated reply
    setTimeout(() => {
      const replies = [
        "Smart move! Try adding 20g protein and you'll crush your goal. 💪",
        "Swap that for grilled paneer or tofu — same vibe, half the carbs. 🥗 +10 XP if you do!",
        "Nice! A 10-min walk after meals drops glucose spikes ~30%. Want me to start a timer? ⏱️",
        "Hydration check: aim for 500ml in the next hour. You got this! 💧",
        "Plan locked: dal + 1 roti + sabzi + curd. Balanced and Gen Z approved. 🔥",
      ];
      const text = replies[Math.floor(Math.random() * replies.length)];
      setState((s) => ({ chat: [...s.chat, { id: `m${Date.now()}a`, from: "ai", text }] }));
    }, 700);
  },
  toggleNotifications() { setState((s) => ({ notifications: !s.notifications })); },
  setLanguage(language: State["language"]) { setState(() => ({ language })); },
  toggleTheme() {
    setState((s) => {
      const theme = s.theme === "dark" ? "light" : "dark";
      if (typeof document !== "undefined") document.documentElement.classList.toggle("light", theme === "light");
      return { theme };
    });
  },
  toggleBadge(name: string) {
    setState((s) => ({ badges: s.badges.map((b) => b.name === name ? { ...b, earned: !b.earned } : b) }));
  },
  setActivityLevel(level: ActivityLevel) { setState(() => ({ activityLevel: level })); },
  setName(name: string) { setState(() => ({ name })); },
  setWorkoutGoal(min: number) { setState(() => ({ workoutGoalMin: Math.max(5, Math.min(180, Math.round(min))) })); },
  setWorkoutPlan(plan: Omit<WorkoutPlanState, "generatedAt"> | null) {
    setState(() => ({
      workoutPlan: plan ? { ...plan, exercises: plan.exercises.map(e => ({ ...e, done: false })), generatedAt: Date.now() } : null,
    }));
  },
  toggleExerciseDone(idx: number) {
    let xpEarned = 0;
    let justCompleted = false;
    setState((s) => {
      if (!s.workoutPlan) return;
      const ex = s.workoutPlan.exercises[idx];
      if (!ex) return;
      justCompleted = !ex.done;
      const exercises = s.workoutPlan.exercises.map((e, i) => i === idx ? { ...e, done: !e.done } : e);
      const addMin = justCompleted ? ex.durationMin : -ex.durationMin;
      xpEarned = justCompleted ? xpForExercise(ex.durationMin, ex.intensity) : 0;
      const xp = s.xp + xpEarned;
      return {
        workoutPlan: { ...s.workoutPlan, exercises },
        workout: Math.max(0, s.workout + addMin),
        xp,
        level: levelFromXp(xp),
      };
    });
    return { xpEarned, justCompleted };
  },
  reset() {
    state = defaultState();
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
    emit();
  },
};

export const INDIAN_DISHES: Array<Omit<Scan, "id" | "ts">> = [
  { name: "Masala Dosa", carbs: 42, cal: 380, score: "A" },
  { name: "Rajma Chawal", carbs: 68, cal: 520, score: "B" },
  { name: "Idli Sambar", carbs: 38, cal: 290, score: "A" },
  { name: "Paneer Tikka", carbs: 12, cal: 320, score: "A" },
  { name: "Chole Bhature", carbs: 75, cal: 650, score: "C" },
  { name: "Dal Tadka + Roti", carbs: 45, cal: 410, score: "A" },
  { name: "Vada Pav", carbs: 52, cal: 480, score: "C" },
  { name: "Palak Paneer", carbs: 14, cal: 360, score: "A" },
  { name: "Veg Biryani", carbs: 72, cal: 540, score: "B" },
  { name: "Upma", carbs: 36, cal: 250, score: "A" },
];
