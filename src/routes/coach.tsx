import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { Sparkles, Send } from "lucide-react";
import { useStore, actions } from "@/lib/store";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/coach")({
  head: () => ({ meta: [{ title: "AI Coach — CarbsFit" }] }),
  component: CoachPage,
});

const suggestions = ["Plan my dinner 🍽️", "Quick workout ⚡", "Why am I tired? 😴", "Swap for samosa 🥟"];

function CoachPage() {
  const messages = useStore((s) => s.chat);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    actions.sendChat(t);
    setInput("");
  };

  return (
    <MobileShell>
      <header className="px-5 pt-8 flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-violet glow-violet flex items-center justify-center animate-glow-pulse">
          <Sparkles className="w-6 h-6 text-violet-foreground" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Your AI Coach</p>
          <h1 className="text-2xl font-bold">Zara</h1>
          <p className="text-[11px] text-neon flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-neon glow-neon" /> Online · Hindi & English
          </p>
        </div>
      </header>

      <main className="px-5 mt-6 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"} animate-pop`}>
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                m.from === "user"
                  ? "bg-gradient-hero text-neon-foreground rounded-br-md"
                  : "glass rounded-bl-md"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </main>

      <div className="px-5 mt-5">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {suggestions.map((s) => (
            <button key={s} onClick={() => send(s)} className="glass rounded-full px-3.5 py-2 text-xs font-medium whitespace-nowrap shrink-0 active:scale-95 transition">
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="glass rounded-full p-1.5 flex items-center gap-2 mt-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Zara anything..."
            className="flex-1 bg-transparent px-4 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button type="submit" className="w-10 h-10 rounded-full bg-gradient-hero glow-neon flex items-center justify-center active:scale-95 transition" aria-label="Send">
            <Send className="w-4 h-4 text-neon-foreground" />
          </button>
        </form>
      </div>
    </MobileShell>
  );
}
