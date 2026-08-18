import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — CarbsFit" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back! 🔥");
    navigate({ to: "/" });
  };

  const onGoogle = async () => {
    setOauthLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    setOauthLoading(false);
    if (error) return toast.error("Google sign-in failed: " + error.message);
  };

  return (
    <AuthShell>
      <div className="text-center mb-7">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-hero glow-neon mb-4">
          <Sparkles className="w-8 h-8 text-neon-foreground" />
        </div>
        <h1 className="text-3xl font-display font-bold">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-1">Continue your fit carb quest</p>
      </div>

      <button
        onClick={onGoogle}
        disabled={oauthLoading}
        className="w-full glass rounded-2xl py-3.5 flex items-center justify-center gap-3 font-semibold text-sm active:scale-[0.99] transition disabled:opacity-50"
      >
        {oauthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
        Continue with Google
      </button>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">or with email</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <Field icon={<Mail className="w-4 h-4" />} type="email" placeholder="you@email.com" value={email} onChange={setEmail} />
        <Field icon={<Lock className="w-4 h-4" />} type="password" placeholder="Password" value={password} onChange={setPassword} />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-hero text-neon-foreground rounded-2xl py-3.5 font-bold glow-neon active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Login
        </button>
      </form>

      <div className="flex items-center justify-between mt-5 text-xs">
        <button onClick={() => toast("Reset link coming soon")} className="text-muted-foreground hover:text-neon transition">
          Forgot password?
        </button>
        <Link to="/signup" className="text-neon font-semibold">Create account</Link>
      </div>
    </AuthShell>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background relative overflow-hidden flex items-center justify-center px-5 py-10">
      <div className="absolute -top-32 -left-20 w-80 h-80 bg-neon/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-violet/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-neon/10 rounded-full blur-2xl" />
      <div className="relative w-full max-w-md glass rounded-3xl p-7 border border-border/50 shadow-2xl">
        {children}
      </div>
    </div>
  );
}

export function Field({ icon, ...props }: { icon: React.ReactNode } & {
  type?: string; placeholder?: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 bg-surface-elevated rounded-2xl px-4 py-3.5 border border-border/40 focus-within:border-neon/60 transition">
      <span className="text-muted-foreground">{icon}</span>
      <input
        type={props.type ?? "text"}
        placeholder={props.placeholder}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground/60"
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C41.4 35.5 44 30.2 44 24c0-1.3-.1-2.3-.4-3.5z"/></svg>
  );
}
