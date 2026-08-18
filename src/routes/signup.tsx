import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, User, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthShell, Field } from "./login";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — CarbsFit" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: name },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created! Check your inbox to verify ✉️");
    navigate({ to: "/onboarding" });
  };

  const onGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) toast.error("Google sign-in failed: " + error.message);
  };

  return (
    <AuthShell>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-hero glow-neon mb-4">
          <Sparkles className="w-8 h-8 text-neon-foreground" />
        </div>
        <h1 className="text-3xl font-display font-bold">Start your quest</h1>
        <p className="text-sm text-muted-foreground mt-1">Join CarbsFit — turn fitness into a game</p>
      </div>

      <button
        onClick={onGoogle}
        className="w-full glass rounded-2xl py-3.5 flex items-center justify-center gap-3 font-semibold text-sm active:scale-[0.99] transition"
      >
        Continue with Google
      </button>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">or sign up with email</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <Field icon={<User className="w-4 h-4" />} placeholder="Full name" value={name} onChange={setName} />
        <Field icon={<Mail className="w-4 h-4" />} type="email" placeholder="you@email.com" value={email} onChange={setEmail} />
        <Field icon={<Lock className="w-4 h-4" />} type="password" placeholder="Password (min 6)" value={password} onChange={setPassword} />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-hero text-neon-foreground rounded-2xl py-3.5 font-bold glow-neon active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Create account
        </button>
      </form>

      <p className="text-xs text-center text-muted-foreground mt-5">
        Already a player? <Link to="/login" className="text-neon font-semibold">Login</Link>
      </p>
    </AuthShell>
  );
}
