import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { ScanLine, Camera, Sparkles, Image as ImageIcon, Check, X, Zap, Loader2 } from "lucide-react";
import { useStore, actions } from "@/lib/store";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { analyzeMeal, type ScanResult } from "@/lib/scan.functions";

export const Route = createFileRoute("/scan")({
  head: () => ({ meta: [{ title: "Scan Meal — CarbsFit" }] }),
  component: ScanPage,
});

const scoreColor: Record<string, string> = {
  A: "text-neon bg-neon/15",
  B: "text-violet bg-violet/15",
  C: "text-orange-400 bg-orange-400/10",
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

// Downscale large images so the AI gateway request stays small/fast.
const compressImage = (dataUrl: string, maxDim = 1024, quality = 0.82) =>
  new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });

function ScanPage() {
  const scans = useStore((s) => s.scans);
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const analyze = useServerFn(analyzeMeal);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setResult(null);
    setScanning(true);
    try {
      const raw = await fileToDataUrl(file);
      const compressed = await compressImage(raw);
      setPreview(compressed);
      const r = await analyze({ data: { imageDataUrl: compressed } });
      setResult(r);
      if (r.name.toLowerCase() === "not food") {
        toast.error("Hmm, I couldn't see food in that photo");
      } else {
        actions.addScan({
          name: r.name,
          carbs: Math.round(r.carbs),
          cal: Math.round(r.calories),
          protein: Math.round(r.protein),
          fat: Math.round(r.fat),
          fiber: Math.round(r.fiber),
          portion: r.portion,
          score: r.score,
          scoreReason: r.scoreReason,
          swaps: r.swaps,
          imageUrl: compressed,
        });
        toast.success(`${r.name} · ${Math.round(r.calories)} kcal · +10 XP`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Scan failed";
      toast.error(msg);
    } finally {
      setScanning(false);
    }
  };

  const reset = () => { setPreview(null); setResult(null); };

  return (
    <MobileShell>
      <header className="px-5 pt-8">
        <div className="flex items-center gap-2">
          <ScanLine className="w-5 h-5 text-neon" />
          <span className="text-xs font-semibold tracking-widest uppercase text-neon">Snap It</span>
        </div>
        <h1 className="text-3xl font-bold mt-1">Scan Your Meal</h1>
        <p className="text-sm text-muted-foreground mt-1">AI identifies Indian dishes & estimates macros instantly</p>
      </header>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      <div className="px-5 mt-6">
        <div className="relative rounded-3xl glass aspect-square overflow-hidden flex items-center justify-center">
          {preview && (
            <img src={preview} alt="meal" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/60" />
          <div className="absolute inset-6 rounded-2xl border-2 border-dashed border-neon/40" />
          <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-neon rounded-tl-2xl" />
          <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-neon rounded-tr-2xl" />
          <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-neon rounded-bl-2xl" />
          <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-neon rounded-br-2xl" />
          {scanning && (
            <div className="absolute inset-x-6 top-6 bottom-6 overflow-hidden">
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-neon to-transparent glow-neon"
                style={{ animation: "scanline 1.4s linear infinite" }} />
            </div>
          )}
          <div className="text-center px-6 relative z-10">
            {scanning ? (
              <div>
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-hero glow-neon flex items-center justify-center">
                  <Loader2 className="w-9 h-9 text-neon-foreground animate-spin" />
                </div>
                <p className="mt-4 text-sm font-semibold">AI is analyzing your plate…</p>
                <p className="text-xs text-muted-foreground mt-1">Identifying dish, macros & swaps</p>
              </div>
            ) : result && result.name.toLowerCase() !== "not food" ? null : (
              <>
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-hero glow-neon flex items-center justify-center animate-float">
                  <Camera className="w-9 h-9 text-neon-foreground" />
                </div>
                <p className="mt-4 text-sm font-semibold">Tap Capture to snap your meal</p>
                <p className="text-xs text-muted-foreground mt-1">Roti · Rice · Paneer · Biryani · Dosa</p>
              </>
            )}
          </div>
          {preview && !scanning && (
            <button onClick={reset} className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full glass flex items-center justify-center" aria-label="Clear">
              <X className="w-4 h-4" />
            </button>
          )}
          <style>{`@keyframes scanline { 0% { top: 0% } 100% { top: 100% } }`}</style>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button onClick={() => galleryRef.current?.click()} disabled={scanning} className="glass rounded-2xl py-3.5 flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50">
            <ImageIcon className="w-4 h-4" /> Gallery
          </button>
          <button onClick={() => cameraRef.current?.click()} disabled={scanning} className="rounded-2xl py-3.5 flex items-center justify-center gap-2 text-sm font-semibold bg-gradient-hero text-neon-foreground glow-neon active:scale-[0.98] transition disabled:opacity-70">
            <Sparkles className="w-4 h-4" /> {scanning ? "Scanning..." : "Capture"}
          </button>
        </div>
      </div>

      {result && result.name.toLowerCase() !== "not food" && (
        <ResultCard r={result} />
      )}

      <section className="px-5 mt-7">
        <h3 className="text-base font-semibold mb-3">Recent Scans</h3>
        <div className="space-y-2.5">
          {scans.map((m) => (
            <div key={m.id} className="glass rounded-2xl p-3.5 flex items-center gap-3">
              {m.imageUrl ? (
                <img src={m.imageUrl} alt={m.name} className="w-12 h-12 rounded-xl object-cover" />
              ) : (
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${scoreColor[m.score]}`}>
                  {m.score}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.cal} kcal · {m.carbs}g carbs{m.protein != null ? ` · ${m.protein}g protein` : ""}</p>
              </div>
              <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${scoreColor[m.score]}`}>{m.score}</span>
            </div>
          ))}
        </div>
      </section>
    </MobileShell>
  );
}

function ResultCard({ r }: { r: ScanResult }) {
  return (
    <div className="px-5 mt-5 animate-pop">
      <div className="glass rounded-3xl p-5 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-neon/30 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-neon font-bold">{r.cuisine}</p>
              <h2 className="text-xl font-bold mt-0.5">{r.name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{r.portion} · {Math.round(r.confidence * 100)}% confident</p>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl ${scoreColor[r.score]}`}>
              {r.score}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-4">
            <Macro label="kcal" value={Math.round(r.calories)} />
            <Macro label="Carbs" value={`${Math.round(r.carbs)}g`} />
            <Macro label="Protein" value={`${Math.round(r.protein)}g`} />
            <Macro label="Fat" value={`${Math.round(r.fat)}g`} />
          </div>

          <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1.5">
            <Check className="w-3.5 h-3.5 text-neon mt-0.5 shrink-0" /> {r.scoreReason}
          </p>

          {r.swaps?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-violet" /> Healthier swaps
              </p>
              <div className="space-y-2">
                {r.swaps.map((s, i) => (
                  <div key={i} className="rounded-2xl bg-surface-elevated/60 p-3">
                    <p className="text-sm font-semibold">{s.swap}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-neon font-bold flex items-center gap-1"><Zap className="w-3.5 h-3.5" />+10 XP earned</span>
            <span className="text-muted-foreground">Logged to today's macros</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Macro({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-surface-elevated/60 p-2.5 text-center">
      <p className="text-sm font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  );
}
