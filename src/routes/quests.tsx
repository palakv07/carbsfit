import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { Swords, Clock, Zap, Check, Plus } from "lucide-react";
import { useStore, actions } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/quests")({
  head: () => ({ meta: [{ title: "Quests — CarbsFit" }] }),
  component: QuestsPage,
});

const diffColor: Record<string, string> = {
  Easy: "text-neon bg-neon/10",
  Medium: "text-violet bg-violet/15",
  Hard: "text-orange-400 bg-orange-400/10",
};

const STEP: Record<string, number> = { water: 0.25, steps: 1000, carbs: 10, hiit: 5, breakfast: 1 };

function QuestsPage() {
  const quests = useStore((s) => s.quests);
  const streak = useStore((s) => s.streak);
  const doneCount = quests.filter((q) => q.progress >= q.target).length;
  const xpToday = quests.filter((q) => q.progress >= q.target).reduce((sum, q) => sum + q.reward, 0);

  const onTap = (id: string) => {
    const q = quests.find((x) => x.id === id);
    if (!q || q.progress >= q.target) return;
    const { xpEarned, completed } = actions.bumpQuest(id, STEP[id] ?? 1);
    if (completed) toast.success(`Quest complete! +${xpEarned} XP 🎉`);
    else toast(`+${STEP[id] ?? 1}${q.unit} • ${q.title}`);
  };

  return (
    <MobileShell>
      <header className="px-5 pt-8">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-neon" />
          <span className="text-xs font-semibold tracking-widest uppercase text-neon">Daily</span>
        </div>
        <h1 className="text-3xl font-bold mt-1">Today's Quests</h1>
        <p className="text-sm text-muted-foreground mt-1">Tap a quest to log progress and earn XP</p>
      </header>

      <div className="px-5 mt-5 grid grid-cols-3 gap-2">
        <Stat label="Done" value={`${doneCount}/${quests.length}`} />
        <Stat label="XP today" value={xpToday.toString()} highlight />
        <Stat label="Streak" value={`🔥 ${streak}`} />
      </div>

      <main className="px-5 mt-5 space-y-2.5">
        {quests.map((q) => {
          const done = q.progress >= q.target;
          const pct = Math.min(100, (q.progress / q.target) * 100);
          return (
            <button
              key={q.id}
              onClick={() => onTap(q.id)}
              disabled={done}
              className="w-full text-left glass rounded-2xl p-4 active:scale-[0.99] transition disabled:opacity-90"
            >
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${done ? "bg-neon/15" : "bg-surface-elevated"}`}>
                  {done ? <Check className="w-6 h-6 text-neon" strokeWidth={3} /> : q.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-semibold ${done ? "line-through text-muted-foreground" : ""}`}>{q.title}</p>
                    <span className="text-[11px] font-bold text-neon flex items-center gap-0.5 shrink-0">
                      <Zap className="w-3 h-3" />+{q.reward}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {q.desc} · {q.progress.toLocaleString()}/{q.target.toLocaleString()} {q.unit}
                  </p>
                  <div className="mt-2 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${done ? "bg-gradient-neon" : "bg-gradient-hero"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${diffColor[q.diff]}`}>{q.diff}</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      {done ? <Check className="w-3 h-3 text-neon" /> : <><Plus className="w-3 h-3" /> Tap to log</>}
                      {!done && <><Clock className="w-3 h-3 ml-2" /> {q.time}</>}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </main>
    </MobileShell>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="glass rounded-2xl p-3 text-center">
      <p className={`text-lg font-bold ${highlight ? "text-neon" : ""}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}
