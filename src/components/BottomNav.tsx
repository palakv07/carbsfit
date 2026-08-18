import { Link, useLocation } from "@tanstack/react-router";
import { Home, Swords, ScanLine, Sparkles, User } from "lucide-react";

type Tab = { to: string; label: string; icon: typeof Home; hero?: boolean };
const tabs: Tab[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/quests", label: "Quests", icon: Swords },
  { to: "/scan", label: "Scan", icon: ScanLine, hero: true },
  { to: "/coach", label: "Coach", icon: Sparkles },
  { to: "/profile", label: "You", icon: User },
];

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-50 px-4 pb-4 pt-2">
      <div className="glass rounded-3xl flex items-center justify-around px-2 py-2 relative">
        {tabs.map(({ to, label, icon: Icon, hero }) => {
          const active = pathname === to;
          if (hero) {
            return (
              <Link key={to} to={to} className="-mt-8 relative" aria-label={label}>
                <div className="w-16 h-16 rounded-full bg-gradient-hero glow-neon flex items-center justify-center animate-glow-pulse">
                  <Icon className="w-7 h-7 text-neon-foreground" strokeWidth={2.5} />
                </div>
              </Link>
            );
          }
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-colors ${
                active ? "text-neon" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={2.2} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
