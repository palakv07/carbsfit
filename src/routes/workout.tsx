import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { useStore, actions, xpForExercise, type ActivityLevel } from "@/lib/store";
import { generateWorkoutPlan } from "@/lib/workout.functions";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Dumbbell, Sparkles, Flame, Clock, Check, Loader2, Zap, Target, Activity, Play, Pause, RotateCcw, Plus } from "lucide-react";

export const Route = createFileRoute("/workout")({
  head: () => ({ meta: [{ title: "Workout — CarbsFit" }] }),
  component: WorkoutPage,
});

const LEVELS: { id: ActivityLevel; label: string; emoji: string; desc: string }[] = [
  { id: "sedentary", label: "Chill", emoji: "🛋️", desc: "Mostly sitting" },
  { id: "light", label: "Light", emoji: "🚶", desc: "Some walking" },
  { id: "moderate", label: "Active", emoji: "🏃", desc: "Daily movement" },
  { id: "active", label: "Beast", emoji: "🔥", desc: "Hard training" },
];

const GOALS = [15, 30, 45, 60, 90];

function WorkoutPage() {
  const activityLevel = useStore((s) => s.activityLevel);
  const goal = useStore((s) => s.workoutGoalMin);
  const plan = useStore((s) => s.workoutPlan);
  const calories = useStore((s) => s.calories);
  const carbs = useStore((s) => s.carbs);
  const steps = useStore((s) => s.steps);
  const workoutDone = useStore((s) => s.workout);
  const scans = useStore((s) => s.scans);

  const [loading, setLoading] = useState(false);
  const generate = useServerFn(generateWorkoutPlan);
  const { profile } = useAuth();

  // Sync activity level from onboarding profile (once, if user hasn't changed it)
  useEffect(() => {
    const lvl = profile?.activity_level;
    const valid = ["sedentary", "light", "moderate", "active"] as const;
    if (lvl && (valid as readonly string[]).includes(lvl) && lvl !== activityLevel) {
      actions.setActivityLevel(lvl as ActivityLevel);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.activity_level]);

  const onGenerate = async () => {
    setLoading(true);
    try {
      const recentMeals = scans.slice(0, 5).map((s) => ({
        name: s.name, calories: s.cal, carbs: s.carbs, score: s.score,
      }));
      const plan = await generate({
        data: {
          activityLevel,
          goalMinutes: goal,
          caloriesEaten: calories,
          carbsEaten: carbs,
          proteinEaten: 0,
          steps,
          workoutDoneMin: workoutDone,
          recentMeals,
          profile: profile ? {
            name: profile.full_name,
            age: profile.age,
            gender: profile.gender,
            heightCm: profile.height_cm,
            weightKg: profile.weight_kg,
            targetWeightKg: profile.target_weight_kg,
            primaryGoal: profile.primary_goal,
            workoutPreferences: profile.workout_preferences,
          } : undefined,
        },
      });
      actions.setWorkoutPlan(plan);
      toast.success("AI plan ready! 🔥");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  const doneMin = plan?.exercises.filter((e) => e.done).reduce((a, e) => a + e.durationMin, 0) ?? 0;
  const planPct = plan ? Math.min(100, (doneMin / plan.totalMinutes) * 100) : 0;

  return (
    <MobileShell>
      <header className="px-5 pt-8">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-neon" />
          <span className="text-xs font-semibold tracking-widest uppercase text-neon">Train</span>
        </div>
        <h1 className="text-3xl font-bold mt-1">Daily Workout</h1>
        <p className="text-sm text-muted-foreground mt-1">AI-tailored to what you ate today</p>
      </header>

      <main className="px-5 mt-5 space-y-5">
        {/* Activity level */}
        <section className="glass rounded-3xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-violet" />
            <h2 className="text-sm font-semibold">Your activity level</h2>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {LEVELS.map((l) => {
              const active = activityLevel === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => actions.setActivityLevel(l.id)}
                  className={`rounded-2xl p-2.5 text-center transition active:scale-95 ${
                    active ? "bg-gradient-hero glow-neon text-neon-foreground" : "bg-surface-elevated text-foreground"
                  }`}
                >
                  <div className="text-2xl">{l.emoji}</div>
                  <div className="text-[11px] font-bold mt-1">{l.label}</div>
                  <div className={`text-[9px] ${active ? "opacity-90" : "text-muted-foreground"}`}>{l.desc}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Workout goal */}
        <section className="glass rounded-3xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-neon" />
              <h2 className="text-sm font-semibold">Daily workout goal</h2>
            </div>
            <span className="text-xs font-bold text-neon">{goal} min</span>
          </div>
          <input
            type="range"
            min={5} max={120} step={5}
            value={goal}
            onChange={(e) => actions.setWorkoutGoal(Number(e.target.value))}
            className="w-full accent-[hsl(var(--neon))]"
          />
          <div className="grid grid-cols-5 gap-1.5 mt-3">
            {GOALS.map((g) => (
              <button
                key={g}
                onClick={() => actions.setWorkoutGoal(g)}
                className={`rounded-xl py-1.5 text-xs font-semibold transition ${
                  goal === g ? "bg-neon text-neon-foreground" : "bg-surface-elevated text-muted-foreground"
                }`}
              >{g}m</button>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Done today</span>
            <span className="font-semibold text-foreground">{workoutDone} / {goal} min</span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-muted/50 overflow-hidden">
            <div className="h-full bg-gradient-neon rounded-full transition-all" style={{ width: `${Math.min(100, (workoutDone / goal) * 100)}%` }} />
          </div>
        </section>

        {/* Generate / regenerate */}
        <button
          onClick={onGenerate}
          disabled={loading}
          className="w-full rounded-3xl bg-gradient-hero glow-neon text-neon-foreground py-4 font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {loading ? "Building your plan…" : plan ? "Regenerate AI plan" : "Generate AI workout plan"}
        </button>

        {!plan && !loading && (
          <p className="text-xs text-muted-foreground text-center -mt-2">
            Uses your scanned meals, carbs, calories & steps from today.
          </p>
        )}

        {/* Plan */}
        {plan && (
          <section className="space-y-3">
            <div className="glass rounded-3xl p-5 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon/30 rounded-full blur-3xl" />
              <div className="relative">
                <span className="text-[10px] font-semibold tracking-widest text-neon uppercase">{plan.focus}</span>
                <h3 className="text-xl font-bold mt-1">{plan.title}</h3>
                <p className="text-xs text-muted-foreground mt-1.5">{plan.summary}</p>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <Stat icon={Clock} label="Total" value={`${plan.totalMinutes}m`} />
                  <Stat icon={Flame} label="Burn" value={`~${plan.estCaloriesBurn}`} />
                  <Stat icon={Zap} label="Done" value={`${doneMin}m`} highlight />
                </div>
                <div className="mt-3 h-2 rounded-full bg-muted/50 overflow-hidden">
                  <div className="h-full bg-gradient-neon glow-neon rounded-full transition-all" style={{ width: `${planPct}%` }} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {plan.exercises.map((ex, i) => (
                <ExerciseRow key={`${plan.title}-${i}`} idx={i} ex={ex} />
              ))}
            </div>

            <div className="glass rounded-2xl p-3.5 text-xs text-center text-muted-foreground italic">
              💬 {plan.motivation}
            </div>
          </section>
        )}
      </main>
    </MobileShell>
  );
}

function Stat({ icon: Icon, label, value, highlight }: { icon: typeof Clock; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-surface-elevated rounded-xl p-2.5 text-center">
      <Icon className={`w-3.5 h-3.5 mx-auto ${highlight ? "text-neon" : "text-muted-foreground"}`} />
      <p className={`text-base font-bold mt-0.5 ${highlight ? "text-neon" : ""}`}>{value}</p>
      <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  );
}

type ExProps = {
  idx: number;
  ex: { name: string; durationMin: number; intensity: "Low" | "Medium" | "High"; reason: string; emoji: string; done?: boolean };
};

function ExerciseRow({ idx, ex }: ExProps) {
  const totalSec = ex.durationMin * 60;
  const [remaining, setRemaining] = useState(totalSec);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(ex.done ?? false);

  // Reset remaining if this exercise's duration changes (new plan)
  useEffect(() => {
    setRemaining(ex.durationMin * 60);
    setRunning(false);
    completedRef.current = ex.done ?? false;
  }, [ex.durationMin, ex.done]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setRunning(false);
          if (!completedRef.current) {
            completedRef.current = true;
            const { xpEarned } = actions.toggleExerciseDone(idx);
            toast.success(`${ex.emoji} ${ex.name} done! +${xpEarned} XP`);
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, idx, ex.name, ex.emoji]);

  const onComplete = () => {
    setRunning(false);
    if (!ex.done) {
      const { xpEarned, justCompleted } = actions.toggleExerciseDone(idx);
      if (justCompleted) toast.success(`${ex.emoji} ${ex.name} done! +${xpEarned} XP`);
      setRemaining(0);
    } else {
      // un-complete (mistake) — gives XP back negatively
      actions.toggleExerciseDone(idx);
      setRemaining(totalSec);
    }
  };

  const onReset = () => {
    setRunning(false);
    setRemaining(totalSec);
  };

  const pct = ((totalSec - remaining) / totalSec) * 100;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const xpReward = xpForExercise(ex.durationMin, ex.intensity);

  return (
    <div className={`glass rounded-2xl p-3.5 ${ex.done ? "opacity-70" : ""}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={onComplete}
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 active:scale-95 transition ${ex.done ? "bg-neon/20" : "bg-surface-elevated"}`}
          aria-label={ex.done ? "Mark not done" : "Mark complete"}
        >
          {ex.done ? <Check className="w-6 h-6 text-neon" strokeWidth={3} /> : ex.emoji}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={`text-sm font-semibold ${ex.done ? "line-through text-muted-foreground" : ""}`}>{ex.name}</p>
            <span className="text-[11px] font-bold text-neon shrink-0">+{xpReward} XP</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{ex.reason}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              ex.intensity === "High" ? "text-orange-400 bg-orange-400/10"
              : ex.intensity === "Medium" ? "text-violet bg-violet/15"
              : "text-neon bg-neon/10"
            }`}>{ex.intensity}</span>
            <span className="text-[10px] text-muted-foreground">{ex.durationMin} min</span>
          </div>
        </div>
      </div>

      {!ex.done && (
        <>
          <div className="mt-3 h-1.5 rounded-full bg-muted/50 overflow-hidden">
            <div className="h-full bg-gradient-neon glow-neon rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div className="font-mono text-lg font-bold tabular-nums">
              {mm}:{ss}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setRemaining((r) => Math.min(totalSec * 2, r + 15))}
                className="h-9 px-2.5 rounded-xl bg-surface-elevated text-[11px] font-semibold flex items-center gap-1 active:scale-95 transition"
                aria-label="Add 15 seconds"
              >
                <Plus className="w-3 h-3" />15s
              </button>
              <button
                onClick={onReset}
                className="h-9 w-9 rounded-xl bg-surface-elevated flex items-center justify-center active:scale-95 transition"
                aria-label="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRunning((r) => !r)}
                disabled={remaining === 0}
                className="h-9 px-3.5 rounded-xl bg-gradient-hero glow-neon text-neon-foreground text-xs font-bold flex items-center gap-1.5 active:scale-95 transition disabled:opacity-50"
              >
                {running ? <><Pause className="w-3.5 h-3.5" />Pause</> : <><Play className="w-3.5 h-3.5" />{remaining < totalSec ? "Resume" : "Start"}</>}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
