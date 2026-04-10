import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, Copy, Check, Star, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface CardShareData {
  name: string;
  issuer: string;
  type: string;
  network: string;
  rating: string | number;
  fee: string;
  rewards: string;
  lounge: string;
  forexMarkup: string;
  image?: string;
  color: string;
  perks: string[];
  id: string;
}

interface ShareCardModalProps {
  card: CardShareData;
  open: boolean;
  onClose: () => void;
}

// ── Off-screen renderable card summary ──────────────────────────────────────
function ShareCardCanvas({ card }: { card: CardShareData }) {
  return (
    <div
      id="share-card-canvas"
      style={{
        width: 480,
        background: "linear-gradient(135deg, #0a0a0c 0%, #111116 50%, #0e0e12 100%)",
        borderRadius: 24,
        padding: 32,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Mesh glow blobs */}
      <div style={{
        position: "absolute", top: -60, left: -60, width: 220, height: 220,
        borderRadius: "50%", background: `${card.color}22`, filter: "blur(60px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -40, right: -40, width: 180, height: 180,
        borderRadius: "50%", background: "#c8a86022", filter: "blur(50px)", pointerEvents: "none",
      }} />

      {/* Branding */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "#c8a860", textTransform: "uppercase" }}>
          CardPerks
        </span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 1 }}>
          {card.issuer} · {card.type}
        </span>
      </div>

      {/* Card image + name */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 24 }}>
        {card.image ? (
          <img
            src={card.image}
            alt={card.name}
            crossOrigin="anonymous"
            style={{ width: 160, aspectRatio: "5/3", borderRadius: 12, objectFit: "cover", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", flexShrink: 0 }}
          />
        ) : (
          <div style={{
            width: 160, aspectRatio: "5/3", borderRadius: 12, flexShrink: 0,
            background: `linear-gradient(135deg, ${card.color}, ${card.color}66)`,
            display: "flex", alignItems: "flex-end", padding: "8px 12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{card.name}</span>
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Star style={{ width: 14, height: 14, color: "#c8a860", fill: "#c8a860" }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#c8a860" }}>{card.rating}</span>
            <span style={{ fontSize: 10, background: "rgba(255,255,255,0.08)", borderRadius: 6, padding: "2px 8px", color: "rgba(255,255,255,0.55)" }}>
              {card.network}
            </span>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.2, margin: 0, marginBottom: 4 }}>{card.name}</h2>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: 0 }}>{card.issuer}</p>
        </div>
      </div>

      {/* Key stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Annual Fee", value: card.fee },
          { label: "Rewards", value: card.rewards },
          { label: "Lounge", value: card.lounge },
          { label: "Forex", value: card.forexMarkup },
        ].map((s) => (
          <div key={s.label} style={{
            background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "10px 8px", textAlign: "center",
            border: "1px solid rgba(200,168,96,0.1)",
          }}>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>{s.label}</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#c8a860", margin: 0, lineHeight: 1.3 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Top perks */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 10px" }}>Top Perks</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {card.perks.slice(0, 3).map((perk) => (
            <div key={perk} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(200,168,96,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Check style={{ width: 8, height: 8, color: "#c8a860" }} />
              </div>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>{perk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: "1px solid rgba(200,168,96,0.12)", paddingTop: 14,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>cardperks.app/cards/{card.id}</span>
        <CreditCard style={{ width: 14, height: 14, color: "rgba(200,168,96,0.4)" }} />
      </div>
    </div>
  );
}

// ── Main modal ───────────────────────────────────────────────────────────────
export default function ShareCardModal({ card, open, onClose }: ShareCardModalProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [imgDataUrl, setImgDataUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateImage = useCallback(async () => {
    if (imgDataUrl) return imgDataUrl;
    setGenerating(true);
    try {
      const el = document.getElementById("share-card-canvas");
      if (!el) throw new Error("Canvas element not found");
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        allowTaint: false,
        logging: false,
      });
      const url = canvas.toDataURL("image/png");
      setImgDataUrl(url);
      return url;
    } finally {
      setGenerating(false);
    }
  }, [imgDataUrl]);

  // Generate preview when modal opens
  const handleOpen = useCallback(async () => {
    if (!imgDataUrl) await generateImage();
  }, [imgDataUrl, generateImage]);

  // Trigger generation when modal becomes open
  const prevOpen = useRef(false);
  if (open && !prevOpen.current) {
    prevOpen.current = true;
    setTimeout(handleOpen, 100);
  }
  if (!open) prevOpen.current = false;

  const handleDownload = async () => {
    const url = await generateImage();
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${card.name.replace(/\s+/g, "-")}-cardperks.png`;
    a.click();
    toast.success("Image saved!");
  };

  const handleCopyImage = async () => {
    const url = await generateImage();
    if (!url) return;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      toast.success("Image copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: copy link
      await navigator.clipboard.writeText(`${window.location.origin}/cards/${card.id}`);
      toast.success("Card link copied!");
    }
  };

  const handleNativeShare = async () => {
    const url = await generateImage();
    try {
      if (url && navigator.canShare) {
        const res = await fetch(url);
        const blob = await res.blob();
        const file = new File([blob], `${card.name}-cardperks.png`, { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${card.name} — CardPerks`,
            text: `Check out ${card.name}: ${card.rewards} rewards, ${card.fee}/yr annual fee, ${card.lounge} lounge access.`,
            files: [file],
          });
          return;
        }
      }
      // Fallback: share URL only
      await navigator.share({
        title: `${card.name} — CardPerks`,
        text: `Check out ${card.name} on CardPerks`,
        url: `${window.location.origin}/cards/${card.id}`,
      });
    } catch (e) {
      if ((e as Error).name !== "AbortError") toast.error("Share failed");
    }
  };

  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
          />

          {/* Sheet — slides up from bottom on mobile, centered on desktop */}
          <motion.div
            key="sheet"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-[90] pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full sm:w-auto sm:max-w-lg mx-auto bg-[hsl(var(--background))] border border-border/40 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-black/60 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle bar (mobile) */}
              <div className="w-10 h-1 rounded-full bg-border/60 mx-auto mb-5 sm:hidden" />

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-serif font-semibold text-lg">Share Card</h3>
                  <p className="text-xs text-muted-foreground">{card.name}</p>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-xl bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Preview */}
              <div className="rounded-2xl overflow-hidden mb-5 bg-secondary/20 flex items-center justify-center min-h-[180px]">
                {generating && (
                  <div className="flex flex-col items-center gap-2 py-8">
                    <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                    <p className="text-xs text-muted-foreground">Generating preview…</p>
                  </div>
                )}
                {imgDataUrl && !generating && (
                  <img src={imgDataUrl} alt="Card share preview" className="w-full rounded-2xl" />
                )}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={handleDownload}
                  disabled={generating}
                  className="flex flex-col items-center gap-2 py-3.5 px-2 rounded-2xl bg-secondary/50 hover:bg-secondary/80 active:scale-95 transition-all disabled:opacity-40"
                >
                  <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
                    <Download className="w-4 h-4 text-gold" />
                  </div>
                  <span className="text-xs font-medium">Save</span>
                </button>

                <button
                  onClick={handleCopyImage}
                  disabled={generating}
                  className="flex flex-col items-center gap-2 py-3.5 px-2 rounded-2xl bg-secondary/50 hover:bg-secondary/80 active:scale-95 transition-all disabled:opacity-40"
                >
                  <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gold" />}
                  </div>
                  <span className="text-xs font-medium">{copied ? "Copied!" : "Copy"}</span>
                </button>

                {canNativeShare ? (
                  <button
                    onClick={handleNativeShare}
                    disabled={generating}
                    className="flex flex-col items-center gap-2 py-3.5 px-2 rounded-2xl bg-secondary/50 hover:bg-secondary/80 active:scale-95 transition-all disabled:opacity-40"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
                      <Share2 className="w-4 h-4 text-gold" />
                    </div>
                    <span className="text-xs font-medium">Share</span>
                  </button>
                ) : (
                  <button
                    onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/cards/${card.id}`); toast.success("Link copied!"); }}
                    className="flex flex-col items-center gap-2 py-3.5 px-2 rounded-2xl bg-secondary/50 hover:bg-secondary/80 active:scale-95 transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
                      <Copy className="w-4 h-4 text-gold" />
                    </div>
                    <span className="text-xs font-medium">Copy Link</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Re-export canvas for off-screen rendering
export { ShareCardCanvas };
