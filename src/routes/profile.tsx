import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { Trophy, Flame, Award, Settings, Crown, Globe, Moon, ChevronRight, RotateCcw, Sun, LogOut, Target, Activity, Ruler, Scale } from "lucide-react";
import { useStore, actions, titleForLevel } from "@/lib/store";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";
import { computeTargets, bmi as calcBmi } from "@/lib/targets";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — CarbsFit" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile } = useAuth();
  const storeName = useStore((s) => s.name);
  const name = profile?.full_name || storeName;
  const xp = useStore((s) => s.xp);
  const level = useStore((s) => s.level);
  const streak = useStore((s) => s.streak);
  const badges = useStore((s) => s.badges);
  const language = useStore((s) => s.language);
  const theme = useStore((s) => s.theme);
  const earnedCount = badges.filter((b) => b.earned).length;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const targets = computeTargets(profile);
  const userBmi = calcBmi(profile);
  const bmiLabel = userBmi == null ? null
    : userBmi < 18.5 ? "Underweight"
    : userBmi < 25 ? "Healthy"
    : userBmi < 30 ? "Overweight" : "Obese";

  const onPremium = () => toast("🚀 Premium trial coming soon — you're on the list!");

  return (
    <MobileShell>
      <header className="px-5 pt-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profile</h1>
        <button onClick={() => setSettingsOpen((v) => !v)} className="glass w-10 h-10 rounded-full flex items-center justify-center" aria-label="Settings">
          <Settings className="w-4 h-4" />
        </button>
      </header>

      <div className="px-5 mt-5">
        <div className="glass rounded-3xl p-5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet/30 rounded-full blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-hero glow-neon flex items-center justify-center text-3xl font-display font-bold text-neon-foreground">
              {(name?.[0] ?? "U").toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold truncate">{name || "Your name"}</h2>
              <p className="text-xs text-neon font-semibold mt-0.5">{titleForLevel(level)} · Lvl {level}</p>
              {user?.email && <p className="text-xs text-muted-foreground mt-0.5 truncate">{user.email}</p>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
            <Stat icon={<Flame className="w-4 h-4 text-orange-400" />} value={streak.toString()} label="Streak" />
            <Stat icon={<Trophy className="w-4 h-4 text-neon" />} value={xp >= 1000 ? `${(xp / 1000).toFixed(1)}K` : xp.toString()} label="XP" />
            <Stat icon={<Award className="w-4 h-4 text-violet" />} value={earnedCount.toString()} label="Badges" />
          </div>
        </div>
      </div>

      {profile && (
        <section className="px-5 mt-5">
          <div className="glass rounded-3xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Target className="w-4 h-4 text-neon" /> Your stats
              </h3>
              {userBmi != null && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet bg-violet/10 px-2.5 py-1 rounded-full">
                  BMI {userBmi} · {bmiLabel}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MiniStat icon={<Scale className="w-3.5 h-3.5" />} label="Weight" value={profile.weight_kg ? `${profile.weight_kg} kg` : "—"} />
              <MiniStat icon={<Target className="w-3.5 h-3.5" />} label="Target" value={profile.target_weight_kg ? `${profile.target_weight_kg} kg` : "—"} />
              <MiniStat icon={<Ruler className="w-3.5 h-3.5" />} label="Height" value={profile.height_cm ? `${profile.height_cm} cm` : "—"} />
              <MiniStat icon={<Activity className="w-3.5 h-3.5" />} label="Activity" value={profile.activity_level ?? "—"} />
              <MiniStat icon={<Flame className="w-3.5 h-3.5" />} label="Daily kcal" value={`${targets.calories}`} />
              <MiniStat icon={<Award className="w-3.5 h-3.5" />} label="Protein" value={`${targets.protein} g`} />
            </div>
            {(profile.primary_goal || profile.age || profile.gender) && (
              <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
                {profile.primary_goal && <Pill>🎯 {profile.primary_goal}</Pill>}
                {profile.age && <Pill>🎂 {profile.age} yrs</Pill>}
                {profile.gender && <Pill>{profile.gender === "female" ? "♀" : profile.gender === "male" ? "♂" : "⚧"} {profile.gender}</Pill>}
                {profile.workout_preferences?.slice(0, 3).map((w) => <Pill key={w}>💪 {w}</Pill>)}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="px-5 mt-6">
        <button onClick={onPremium} className="w-full text-left rounded-3xl p-5 bg-gradient-hero glow-neon relative overflow-hidden active:scale-[0.99] transition">
          <Crown className="absolute -right-2 -top-2 w-24 h-24 text-neon-foreground/15" />
          <p className="text-xs font-bold tracking-widest uppercase text-neon-foreground/80">Upgrade</p>
          <h3 className="text-xl font-bold text-neon-foreground mt-1">Go Premium</h3>
          <p className="text-xs text-neon-foreground/80 mt-1 max-w-[220px]">
            Unlimited AI coach, custom plans, faster XP & exclusive challenges.
          </p>
          <span className="inline-block mt-4 bg-background text-foreground rounded-full px-5 py-2 text-sm font-bold">
            Try free for 7 days
          </span>
        </button>
      </section>

      <section className="px-5 mt-6">
        <h3 className="text-base font-semibold mb-3">Badges</h3>
        <div className="grid grid-cols-3 gap-3">
          {badges.map((b) => (
            <button
              key={b.name}
              onClick={() => {
                actions.toggleBadge(b.name);
                toast(b.earned ? `${b.name} unequipped` : `🏅 ${b.name} unlocked!`);
              }}
              className={`glass rounded-2xl p-3 text-center transition active:scale-95 ${b.earned ? "" : "opacity-40"}`}
            >
              <div className="text-3xl">{b.emoji}</div>
              <p className="text-[10px] font-semibold mt-1.5 leading-tight">{b.name}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 mt-6 space-y-2">
        <Row
          icon={<Globe className="w-4 h-4" />}
          label="Language"
          value={language}
          onClick={() => {
            const next = language === "English" ? "हिन्दी" : "English";
            actions.setLanguage(next);
            toast(`Language: ${next}`);
          }}
        />
        <Row
          icon={theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          label="Theme"
          value={theme === "dark" ? "Dark" : "Light"}
          onClick={() => { actions.toggleTheme(); toast(`Theme: ${theme === "dark" ? "Light" : "Dark"}`); }}
        />
        <Row
          icon={<Trophy className="w-4 h-4" />}
          label="Leaderboard"
          value="#42 in India"
          onClick={() => toast("🏆 Leaderboard coming soon")}
        />
        {settingsOpen && (
          <Row
            icon={<RotateCcw className="w-4 h-4" />}
            label="Reset progress"
            value=""
            onClick={() => {
              actions.reset();
              toast.success("Progress reset");
              setSettingsOpen(false);
            }}
          />
        )}
        <LogoutRow />
      </section>
    </MobileShell>
  );
}

function LogoutRow() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <button
      onClick={async () => { await signOut(); toast("Logged out"); navigate({ to: "/login" }); }}
      className="w-full glass rounded-2xl p-4 flex items-center gap-3 active:scale-[0.99] transition border border-destructive/20"
    >
      <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive"><LogOut className="w-4 h-4" /></div>
      <span className="text-sm font-semibold flex-1 text-left text-destructive">Log out</span>
    </button>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="flex justify-center">{icon}</div>
      <p className="text-lg font-bold mt-1">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  );
}

function Row({ icon, label, value, onClick }: { icon: React.ReactNode; label: string; value: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full glass rounded-2xl p-4 flex items-center gap-3 active:scale-[0.99] transition">
      <div className="w-9 h-9 rounded-xl bg-surface-elevated flex items-center justify-center text-muted-foreground">{icon}</div>
      <span className="text-sm font-semibold flex-1 text-left">{label}</span>
      {value && <span className="text-xs text-muted-foreground">{value}</span>}
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </button>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-elevated/60 p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <p className="text-sm font-bold mt-1 capitalize truncate">{value}</p>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-neon/10 text-neon capitalize">
      {children}
    </span>
  );
}
