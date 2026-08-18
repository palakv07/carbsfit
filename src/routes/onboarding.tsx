import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight, ArrowLeft, Sparkles, Loader2, Check,
  Target, Flame, Dumbbell, Heart, Apple, Brain,
  Home, Bike, Activity, PersonStanding,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { actions as storeActions } from "@/lib/store";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding — CarbsFit" }] }),
  component: OnboardingPage,
});

type Data = {
  full_name: string;
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  target_weight_kg: number;
  height_unit: "cm" | "ft";
  weight_unit: "kg" | "lbs";
  primary_goal: string;
  workout_preferences: string[];
  activity_level: string;
};

const TOTAL = 7;

function OnboardingPage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [d, setD] = useState<Data>({
    full_name: "",
    age: 22,
    gender: "",
    height_cm: 170,
    weight_kg: 70,
    target_weight_kg: 65,
    height_unit: "cm",
    weight_unit: "kg",
    primary_goal: "",
    workout_preferences: [],
    activity_level: "",
  });

  const update = <K extends keyof Data>(k: K, v: Data[K]) => setD((p) => ({ ...p, [k]: v }));

  const canNext = () => {
    if (step === 1) return d.full_name.trim() && d.age >= 13 && d.age <= 100 && d.gender;
    if (step === 2) return d.height_cm > 0 && d.weight_kg > 0 && d.target_weight_kg > 0;
    if (step === 3) return !!d.primary_goal;
    if (step === 4) return d.workout_preferences.length > 0;
    if (step === 5) return !!d.activity_level;
    return true;
  };

  const next = () => {
    if (!canNext()) return toast("Please complete this step");
    if (step === TOTAL - 1) finish();
    else setStep((s) => s + 1);
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const finish = async () => {
    if (!user) return toast.error("Not signed in");
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: d.full_name,
        age: d.age,
        gender: d.gender,
        height_cm: d.height_cm,
        weight_kg: d.weight_kg,
        target_weight_kg: d.target_weight_kg,
        height_unit: d.height_unit,
        weight_unit: d.weight_unit,
        primary_goal: d.primary_goal,
        workout_preferences: d.workout_preferences,
        activity_level: d.activity_level,
        onboarding_completed: true,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    storeActions.setActivityLevel(
      d.activity_level === "Beginner" ? "sedentary"
      : d.activity_level === "Lightly Active" ? "light"
      : d.activity_level === "Moderately Active" ? "moderate" : "active"
    );
    toast.success("You're all set! Let's quest 🚀");
    await refreshProfile();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen w-full bg-background relative overflow-hidden">
      <div className="absolute -top-32 -left-20 w-80 h-80 bg-neon/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-violet/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.2s" }} />

      <div className="relative max-w-md mx-auto px-5 pt-8 pb-32 min-h-screen flex flex-col">
        {step > 0 && <ProgressBar step={step} total={TOTAL - 1} />}

        <div key={step} className="flex-1 mt-6 animate-in fade-in slide-in-from-right-4 duration-300">
          {step === 0 && <Welcome onStart={() => setStep(1)} />}
          {step === 1 && <BasicProfile d={d} update={update} />}
          {step === 2 && <BodyDetails d={d} update={update} />}
          {step === 3 && <Goals d={d} update={update} />}
          {step === 4 && <WorkoutPrefs d={d} update={update} />}
          {step === 5 && <ActivityLevel d={d} update={update} />}
          {step === 6 && <Review d={d} />}
        </div>

        {step > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-8 pb-6 px-5">
            <div className="max-w-md mx-auto flex gap-3">
              <button onClick={back} className="glass w-14 h-14 rounded-2xl flex items-center justify-center active:scale-95 transition">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                disabled={!canNext() || saving}
                className="flex-1 bg-gradient-hero text-neon-foreground rounded-2xl font-bold glow-neon active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {step === TOTAL - 1 ? "Start my journey" : "Continue"}
                {!saving && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = (step / total) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-semibold">Step {step} of {total}</span>
        <span className="text-neon font-bold">{Math.round(pct)}%</span>
      </div>
      <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
        <div className="h-full bg-gradient-hero glow-neon transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center text-center pt-16">
      <div className="w-28 h-28 rounded-3xl bg-gradient-hero glow-neon flex items-center justify-center mb-7 animate-in zoom-in duration-500">
        <Sparkles className="w-14 h-14 text-neon-foreground" />
      </div>
      <h1 className="text-4xl font-display font-bold leading-tight">
        Turn Fitness <br />Into a <span className="text-neon">Quest</span>
      </h1>
      <p className="text-muted-foreground mt-4 max-w-xs">
        AI-powered Indian meal tracking, daily quests, and a coach that actually gets you.
      </p>
      <button
        onClick={onStart}
        className="mt-10 w-full bg-gradient-hero text-neon-foreground rounded-2xl py-4 font-bold glow-neon active:scale-[0.98] transition flex items-center justify-center gap-2"
      >
        Start Your Journey <ArrowRight className="w-4 h-4" />
      </button>
      <div className="flex gap-2 mt-6 text-xs text-muted-foreground">
        <span>🔥 Streaks</span><span>•</span><span>🥗 AI scans</span><span>•</span><span>🏆 Quests</span>
      </div>
    </div>
  );
}

function StepHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-display font-bold">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}

function BasicProfile({ d, update }: { d: Data; update: <K extends keyof Data>(k: K, v: Data[K]) => void }) {
  const genders = [
    { v: "Male", emoji: "👨" },
    { v: "Female", emoji: "👩" },
    { v: "Other", emoji: "✨" },
  ];
  return (
    <div>
      <StepHeader title="Tell us about you" sub="So your AI coach can speak your language" />
      <label className="text-xs font-semibold text-muted-foreground">FULL NAME</label>
      <input
        value={d.full_name}
        onChange={(e) => update("full_name", e.target.value)}
        placeholder="Aarav Singh"
        className="mt-1.5 w-full bg-surface-elevated rounded-2xl px-4 py-3.5 outline-none border border-border/40 focus:border-neon/60 transition"
      />
      <label className="text-xs font-semibold text-muted-foreground mt-5 block">AGE</label>
      <div className="mt-2 glass rounded-2xl p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-4xl font-display font-bold text-neon">{d.age}</span>
          <span className="text-xs text-muted-foreground">years</span>
        </div>
        <input
          type="range" min={13} max={80} value={d.age}
          onChange={(e) => update("age", Number(e.target.value))}
          className="w-full mt-3 accent-neon"
        />
      </div>
      <label className="text-xs font-semibold text-muted-foreground mt-5 block">GENDER</label>
      <div className="grid grid-cols-3 gap-2 mt-2">
        {genders.map((g) => (
          <SelectCard key={g.v} active={d.gender === g.v} onClick={() => update("gender", g.v)}>
            <div className="text-2xl">{g.emoji}</div>
            <div className="text-xs font-semibold mt-1">{g.v}</div>
          </SelectCard>
        ))}
      </div>
    </div>
  );
}

function BodyDetails({ d, update }: { d: Data; update: <K extends keyof Data>(k: K, v: Data[K]) => void }) {
  return (
    <div>
      <StepHeader title="Your body stats" sub="We'll personalize your plan" />

      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-semibold text-muted-foreground">HEIGHT</label>
        <Toggle a="cm" b="ft" value={d.height_unit} onChange={(v) => update("height_unit", v as Data["height_unit"])} />
      </div>
      <Slider
        value={d.height_cm} min={120} max={220}
        display={d.height_unit === "cm" ? `${d.height_cm} cm` : `${Math.floor(d.height_cm / 30.48)}'${Math.round((d.height_cm % 30.48) / 2.54)}"`}
        onChange={(v) => update("height_cm", v)}
      />

      <div className="flex items-center justify-between mb-3 mt-6">
        <label className="text-xs font-semibold text-muted-foreground">CURRENT WEIGHT</label>
        <Toggle a="kg" b="lbs" value={d.weight_unit} onChange={(v) => update("weight_unit", v as Data["weight_unit"])} />
      </div>
      <Slider
        value={d.weight_kg} min={35} max={180}
        display={d.weight_unit === "kg" ? `${d.weight_kg} kg` : `${Math.round(d.weight_kg * 2.205)} lbs`}
        onChange={(v) => update("weight_kg", v)}
      />

      <label className="text-xs font-semibold text-muted-foreground mt-6 mb-3 block">TARGET WEIGHT</label>
      <Slider
        value={d.target_weight_kg} min={35} max={180}
        display={d.weight_unit === "kg" ? `${d.target_weight_kg} kg` : `${Math.round(d.target_weight_kg * 2.205)} lbs`}
        onChange={(v) => update("target_weight_kg", v)}
        accent="violet"
      />
    </div>
  );
}

function Goals({ d, update }: { d: Data; update: <K extends keyof Data>(k: K, v: Data[K]) => void }) {
  const goals = [
    { v: "Lose Weight", icon: <Target className="w-5 h-5" /> },
    { v: "Belly Fat Loss", icon: <Flame className="w-5 h-5" /> },
    { v: "Gain Muscle", icon: <Dumbbell className="w-5 h-5" /> },
    { v: "Stay Fit", icon: <Heart className="w-5 h-5" /> },
    { v: "Healthy Lifestyle", icon: <Apple className="w-5 h-5" /> },
    { v: "Improve Discipline", icon: <Brain className="w-5 h-5" /> },
  ];
  return (
    <div>
      <StepHeader title="What's your main goal?" sub="Pick the one that fires you up" />
      <div className="grid grid-cols-2 gap-3">
        {goals.map((g) => (
          <SelectCard key={g.v} active={d.primary_goal === g.v} onClick={() => update("primary_goal", g.v)} tall>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${d.primary_goal === g.v ? "bg-neon/20 text-neon" : "bg-surface-elevated text-muted-foreground"}`}>
              {g.icon}
            </div>
            <div className="text-sm font-bold mt-3">{g.v}</div>
          </SelectCard>
        ))}
      </div>
    </div>
  );
}

function WorkoutPrefs({ d, update }: { d: Data; update: <K extends keyof Data>(k: K, v: Data[K]) => void }) {
  const opts = ["Home Workout", "Gym Workout", "Yoga", "HIIT", "Walking", "Beginner Friendly", "No Equipment", "Female Focused"];
  const toggle = (v: string) => {
    const has = d.workout_preferences.includes(v);
    update("workout_preferences", has ? d.workout_preferences.filter((x) => x !== v) : [...d.workout_preferences, v]);
  };
  return (
    <div>
      <StepHeader title="Workout style?" sub="Pick all that vibe with you" />
      <div className="flex flex-wrap gap-2">
        {opts.map((o) => {
          const active = d.workout_preferences.includes(o);
          return (
            <button
              key={o}
              onClick={() => toggle(o)}
              className={`rounded-full px-4 py-2.5 text-sm font-semibold border transition active:scale-95 ${active ? "bg-neon text-neon-foreground border-neon glow-neon" : "glass border-border/40 text-foreground"}`}
            >
              {active && <Check className="w-3.5 h-3.5 inline mr-1.5" />}
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ActivityLevel({ d, update }: { d: Data; update: <K extends keyof Data>(k: K, v: Data[K]) => void }) {
  const opts = [
    { v: "Beginner", desc: "Mostly sitting, little exercise", icon: <PersonStanding className="w-5 h-5" /> },
    { v: "Lightly Active", desc: "Light walks 1-3x/week", icon: <Home className="w-5 h-5" /> },
    { v: "Moderately Active", desc: "Workouts 3-5x/week", icon: <Bike className="w-5 h-5" /> },
    { v: "Very Active", desc: "Daily intense training", icon: <Activity className="w-5 h-5" /> },
  ];
  return (
    <div>
      <StepHeader title="How active are you?" sub="Be honest — we'll meet you there" />
      <div className="space-y-2.5">
        {opts.map((o) => (
          <button
            key={o.v}
            onClick={() => update("activity_level", o.v)}
            className={`w-full rounded-2xl p-4 flex items-center gap-3 border transition active:scale-[0.98] text-left ${d.activity_level === o.v ? "bg-neon/10 border-neon glow-neon" : "glass border-border/40"}`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${d.activity_level === o.v ? "bg-neon/20 text-neon" : "bg-surface-elevated text-muted-foreground"}`}>
              {o.icon}
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm">{o.v}</div>
              <div className="text-xs text-muted-foreground">{o.desc}</div>
            </div>
            {d.activity_level === o.v && <Check className="w-5 h-5 text-neon" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function Review({ d }: { d: Data }) {
  return (
    <div>
      <StepHeader title="You're ready!" sub="Your AI coach is building your plan" />
      <div className="glass rounded-3xl p-5 space-y-3">
        <Row k="Goal" v={d.primary_goal} />
        <Row k="Activity" v={d.activity_level} />
        <Row k="Workouts" v={d.workout_preferences.slice(0, 3).join(", ") + (d.workout_preferences.length > 3 ? "…" : "")} />
        <Row k="Current" v={`${d.weight_kg} kg`} />
        <Row k="Target" v={`${d.target_weight_kg} kg`} />
      </div>
      <div className="text-center mt-7 text-5xl animate-pulse">🚀</div>
      <p className="text-center text-sm text-muted-foreground mt-3">Tap below and let's go!</p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-bold">{v || "—"}</span>
    </div>
  );
}

function SelectCard({ active, onClick, children, tall }: { active: boolean; onClick: () => void; children: React.ReactNode; tall?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border transition active:scale-95 flex flex-col items-center justify-center ${tall ? "py-5 px-3" : "py-4 px-2"} ${active ? "bg-neon/10 border-neon glow-neon" : "glass border-border/40"}`}
    >
      {children}
    </button>
  );
}

function Toggle({ a, b, value, onChange }: { a: string; b: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="bg-surface-elevated rounded-full p-1 flex text-xs font-semibold">
      {[a, b].map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`px-3 py-1 rounded-full transition ${value === o ? "bg-neon text-neon-foreground" : "text-muted-foreground"}`}
        >{o.toUpperCase()}</button>
      ))}
    </div>
  );
}

function Slider({ value, min, max, display, onChange, accent = "neon" }: { value: number; min: number; max: number; display: string; onChange: (v: number) => void; accent?: "neon" | "violet" }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-baseline justify-between">
        <span className={`text-4xl font-display font-bold ${accent === "neon" ? "text-neon" : "text-violet"}`}>{display}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full mt-3 ${accent === "neon" ? "accent-neon" : "accent-violet"}`}
      />
    </div>
  );
}
