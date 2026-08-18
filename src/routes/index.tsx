import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import {
  Bell, Flame, Droplets, Dumbbell, Apple, ChevronRight,
  Trophy, Zap, Sparkles, TrendingUp, Target, Plus,
} from "lucide-react";
import { useStore, actions, titleForLevel, xpToNext, levelProgress } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { computeTargets } from "@/lib/targets";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CarbsFit — Fit Carb Quest" },
      { name: "description", content: "Turn fitness into a quest. Track Indian meals, beat carb cravings, level up your health." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <MobileShell>
      <Header />
      <main className="px-5 pt-4 space-y-5">
        <LevelCard />
        <GoalCard />
        <StatsGrid />
        <DailyQuests />
        <WeeklyChart />
        <CoachNudge />
        <WorkoutSection />
      </main>
    </MobileShell>
  );
}

function GoalCard() {
  const { profile } = useAuth();
  if (!profile?.weight_kg || !profile?.target_weight_kg) return null;
  const start = Number(profile.weight_kg);
  const target = Number(profile.target_weight_kg);
  const diff = start - target;
  const losing = diff > 0;
  return (
    <div className="glass rounded-3xl p-4 flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-gradient-neon glow-neon flex items-center justify-center text-2xl">
        {losing ? "📉" : diff < 0 ? "📈" : "🎯"}
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Your goal</p>
        <p className="text-sm font-bold mt-0.5">
          {start} kg <span className="text-muted-foreground">→</span> {target} kg
        </p>
        <p className="text-xs text-muted-foreground">
          {losing ? `Lose ${diff.toFixed(1)} kg` : diff < 0 ? `Gain ${Math.abs(diff).toFixed(1)} kg` : "Maintain weight"}
          {profile.primary_goal ? ` · ${profile.primary_goal}` : ""}
        </p>
      </div>
    </div>
  );
}

function Header() {
  const { profile } = useAuth();
  const storeName = useStore((s) => s.name);
  const name = profile?.full_name?.split(" ")[0] || storeName;
  const streak = useStore((s) => s.streak);
  const notifications = useStore((s) => s.notifications);
  return (
    <header className="px-5 pt-6 flex items-center justify-between">
      <Link to="/profile" className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-violet glow-violet flex items-center justify-center font-display font-bold text-violet-foreground">
          {name?.[0]?.toUpperCase() ?? "U"}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Namaste 👋</p>
          <h1 className="text-lg font-semibold leading-tight">{name}</h1>
          {profile?.primary_goal && (
            <p className="text-[10px] text-neon font-semibold uppercase tracking-wider">{profile.primary_goal}</p>
          )}
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <div className="glass rounded-full px-3 py-1.5 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-bold">{streak}</span>
        </div>
        <button
          onClick={() => {
            actions.toggleNotifications();
            toast(notifications ? "Notifications muted 🔕" : "Notifications on 🔔");
          }}
          className="glass w-10 h-10 rounded-full flex items-center justify-center relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {notifications && <span className="absolute top-2 right-2 w-2 h-2 bg-neon rounded-full glow-neon" />}
        </button>
      </div>
    </header>
  );
}

function LevelCard() {
  const xp = useStore((s) => s.xp);
  const level = useStore((s) => s.level);
  return (
    <div className="relative overflow-hidden rounded-3xl glass p-5">
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-neon/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-16 -left-10 w-40 h-40 bg-violet/30 rounded-full blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-semibold tracking-widest text-neon uppercase">Level {level}</span>
            <h2 className="text-2xl font-bold mt-1">{titleForLevel(level)}</h2>
            <p className="text-xs text-muted-foreground mt-1">{xp.toLocaleString()} XP</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-hero glow-neon flex items-center justify-center">
            <Trophy className="w-6 h-6 text-neon-foreground" />
          </div>
        </div>
        <div className="mt-4 h-2.5 rounded-full bg-muted/50 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-neon glow-neon transition-all duration-500" style={{ width: `${levelProgress(xp)}%` }} />
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Zap className="w-3.5 h-3.5 text-neon" />
          <span>{xpToNext(xp)} XP to next level</span>
        </div>
      </div>
    </div>
  );
}

function StatsGrid() {
  const { profile } = useAuth();
  const t = computeTargets(profile);
  const carbs = useStore((s) => s.carbs);
  const calories = useStore((s) => s.calories);
  const water = useStore((s) => s.water);
  const workout = useStore((s) => s.workout);
  const stats = [
    { icon: Apple, label: "Carbs", value: carbs.toString(), unit: `/ ${t.carbs}g`, color: "neon", pct: Math.min(100, (carbs / t.carbs) * 100) },
    { icon: Flame, label: "Calories", value: calories.toLocaleString(), unit: `/ ${t.calories.toLocaleString()}`, color: "violet", pct: Math.min(100, (calories / t.calories) * 100) },
    { icon: Droplets, label: "Water", value: water.toFixed(1), unit: `/ ${t.water}L`, color: "neon", pct: Math.min(100, (water / t.water) * 100) },
    { icon: Dumbbell, label: "Workout", value: workout.toString(), unit: `/ ${t.workoutMin}min`, color: "violet", pct: Math.min(100, (workout / t.workoutMin) * 100) },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color === "neon" ? "bg-neon/15 text-neon" : "bg-violet/20 text-violet"}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <TrendingUp className={`w-4 h-4 ${s.color === "neon" ? "text-neon" : "text-violet"}`} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{s.label}</p>
          <p className="text-xl font-bold">
            {s.value}<span className="text-xs font-medium text-muted-foreground ml-1">{s.unit}</span>
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-muted/50 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${s.color === "neon" ? "bg-gradient-neon" : "bg-gradient-violet"}`} style={{ width: `${s.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function DailyQuests() {
  const quests = useStore((s) => s.quests).slice(0, 3);
  const onTap = (id: string) => {
    const q = quests.find((x) => x.id === id);
    if (!q) return;
    const step = id === "steps" ? 1000 : id === "hiit" ? 5 : id === "carbs" ? 10 : id === "water" ? 0.25 : 1;
    const { xpEarned, completed } = actions.bumpQuest(id, step);
    if (completed) toast.success(`Quest complete! +${xpEarned} XP 🔥`);
    else toast(`Logged ${step}${q.unit} • ${q.title}`);
  };
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Target className="w-4 h-4 text-neon" /> Today's Quests
        </h3>
        <Link to="/quests" className="text-xs text-neon flex items-center gap-0.5">
          View all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="space-y-2.5">
        {quests.map((q) => {
          const pct = Math.min(100, (q.progress / q.target) * 100);
          return (
            <button key={q.id} onClick={() => onTap(q.id)} className="w-full glass rounded-2xl p-3.5 flex items-center gap-3 active:scale-[0.98] transition">
              <div className="w-11 h-11 rounded-xl bg-surface-elevated flex items-center justify-center text-xl">
                {q.emoji}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold truncate">{q.title}</p>
                  <span className="text-[11px] font-bold text-neon shrink-0">+{q.reward} XP</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                  <div className="h-full bg-gradient-neon rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <Plus className="w-4 h-4 text-neon" />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function WeeklyChart() {
  const data = [40, 65, 50, 80, 55, 90, 72];
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <section className="glass rounded-3xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold">This Week</h3>
          <p className="text-xs text-muted-foreground">XP earned daily</p>
        </div>
        <span className="text-xs font-bold text-neon bg-neon/10 px-2.5 py-1 rounded-full">+18%</span>
      </div>
      <div className="flex items-end justify-between h-32 gap-2">
        {data.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full rounded-t-lg bg-gradient-to-t from-violet to-neon" style={{ height: `${v}%`, opacity: i === 5 ? 1 : 0.7 }} />
            <span className={`text-[10px] ${i === 5 ? "text-neon font-bold" : "text-muted-foreground"}`}>{days[i]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CoachNudge() {
  const xp = useStore((s) => s.xp);
  return (
    <Link to="/coach" className="block glass rounded-3xl p-4 relative overflow-hidden">
      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-violet/20 rounded-full blur-2xl" />
      <div className="relative flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-violet glow-violet flex items-center justify-center animate-glow-pulse">
          <Sparkles className="w-5 h-5 text-violet-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">AI Coach · Zara</p>
          <p className="text-sm font-semibold">🔥 You're only {xpToNext(xp)} XP from next level!</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </Link>
  );
}

function WorkoutSection() {
  const goal = useStore((s) => s.workoutGoalMin);
  const done = useStore((s) => s.workout);
  const plan = useStore((s) => s.workoutPlan);
  const pct = Math.min(100, (done / goal) * 100);
  return (
    <Link to="/workout" className="block glass rounded-3xl p-4 relative overflow-hidden">
      <div className="absolute -left-6 -top-6 w-32 h-32 bg-neon/20 rounded-full blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-neon" />
            <span className="text-xs font-semibold tracking-widest uppercase text-neon">AI Workout</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="mt-2 text-sm font-semibold">
          {plan ? plan.title : "Generate today's workout from your meals"}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {plan ? `${plan.exercises.length} moves · ${plan.totalMinutes} min · ~${plan.estCaloriesBurn} kcal burn`
                : "Tailored to your scans, carbs & activity"}
        </p>
        <div className="mt-3 flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">Daily goal</span>
          <span className="font-bold">{done} / {goal} min</span>
        </div>
        <div className="mt-1.5 h-1.5 rounded-full bg-muted/50 overflow-hidden">
          <div className="h-full bg-gradient-neon rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </Link>
  );
}
