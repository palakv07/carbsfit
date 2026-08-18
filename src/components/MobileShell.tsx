import { BottomNav } from "./BottomNav";

export function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex justify-center">
      <div className="w-full max-w-[440px] min-h-screen relative pb-28">
        {children}
        <BottomNav />
      </div>
    </div>
  );
}
