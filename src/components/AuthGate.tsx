import { useEffect } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { actions } from "@/lib/store";
import { computeTargets } from "@/lib/targets";

const PUBLIC_PATHS = ["/login", "/signup", "/forgot-password"];

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  useEffect(() => {
    if (loading) return;
    if (profile?.full_name) actions.setName(profile.full_name.split(" ")[0]);
    if (profile?.activity_level) {
      const lvl = profile.activity_level.toLowerCase();
      const map: Record<string, "sedentary" | "light" | "moderate" | "active"> = {
        beginner: "light", "lightly active": "light", light: "light",
        "moderately active": "moderate", moderate: "moderate",
        "very active": "active", active: "active", sedentary: "sedentary",
      };
      actions.setActivityLevel(map[lvl] ?? "moderate");
    }
    if (profile?.onboarding_completed) {
      const t = computeTargets(profile);
      actions.setWorkoutGoal(t.workoutMin);
    }
    const isPublic = PUBLIC_PATHS.includes(path);
    const isOnboarding = path === "/onboarding";

    if (!user && !isPublic) {
      navigate({ to: "/login" });
      return;
    }
    if (user && isPublic) {
      navigate({ to: profile?.onboarding_completed ? "/" : "/onboarding" });
      return;
    }
    if (user && profile && !profile.onboarding_completed && !isOnboarding) {
      navigate({ to: "/onboarding" });
      return;
    }
    if (user && profile?.onboarding_completed && isOnboarding) {
      navigate({ to: "/" });
    }
  }, [user, profile, loading, path, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 rounded-full border-2 border-neon border-t-transparent animate-spin" />
      </div>
    );
  }
  return <>{children}</>;
}
