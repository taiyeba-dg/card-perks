import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode, Upload, Camera, Type, X, Copy, Check, ChevronRight,
  Home, ExternalLink, ArrowRight, ImageIcon, ScanLine,
} from "lucide-react";
import jsQR from "jsqr";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import CardImage from "@/components/CardImage";
import { useToast } from "@/hooks/use-toast";
import { decodeEMVQR, type QRDecodeResult } from "@/lib/qrDecoder";
import { playSound } from "@/lib/sounds";
import { useCardsV3 } from "@/hooks/use-cards-v3";
import { useMyCards } from "@/hooks/use-my-cards";
import type { CardV3 } from "@/data/card-v3-unified-types";

/* ── Best card recommender for a v3 category key ── */
function useCardRecommendations(v3Key: string, limit = 3) {
  const { cards } = useCardsV3();
  const { myCardObjects } = useMyCards();
  const myCardIds = new Set(myCardObjects.map((c) => c.cardId));

  if (!v3Key || v3Key === "base") return { allCards: [], myBest: null };

  const scored: { card: CardV3; rate: number }[] = [];
  for (const card of cards) {
    const cat = card.rewards.calculator.categories?.[v3Key];
    if (!cat) continue;
    const rate = cat.rate < 1 ? cat.rate * 100 : cat.rate;
    if (rate > 0) scored.push({ card, rate });
  }
  scored.sort((a, b) => b.rate - a.rate);

  const allCards = scored.slice(0, limit);
  let myBest: (typeof scored)[0] | null = null;
  for (const s of scored) {
    if (myCardIds.has(s.card.id)) { myBest = s; break; }
  }

  return { allCards, myBest };
}

/* ── Decode QR from image using jsQR ── */
function decodeQRFromImage(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(null); return; }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      resolve(code?.data || null);
    };
    img.onerror = () => resolve(null);
    img.src = URL.createObjectURL(file);
  });
}

/* ── Tab types ── */
type InputTab = "upload" | "camera" | "paste";

const TABS: { id: InputTab; label: string; icon: typeof Upload }[] = [
  { id: "upload", label: "Upload", icon: Upload },
  { id: "camera", label: "Camera", icon: Camera },
  { id: "paste", label: "Paste", icon: Type },
];

/* ── Camera Scanner ── */
function CameraScanner({ onScan }: { onScan: (data: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setActive(true);
      setError("");
    } catch {
      setError("Camera access denied. Please allow camera permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setActive(false);
  }, []);

  // Scan loop
  useEffect(() => {
    if (!active) return;
    let running = true;

    const scan = () => {
      if (!running || !videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        requestAnimationFrame(scan);
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) { requestAnimationFrame(scan); return; }
      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code?.data) {
        stopCamera();
        onScan(code.data);
        return;
      }
      requestAnimationFrame(scan);
    };
    requestAnimationFrame(scan);

    return () => { running = false; };
  }, [active, onScan, stopCamera]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  if (error) {
    return (
      <div className="text-center py-10">
        <Camera className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-destructive mb-3">{error}</p>
        <button onClick={startCamera} className="gold-btn px-4 py-2 rounded-lg text-xs font-semibold">Try Again</button>
      </div>
    );
  }

  if (!active) {
    return (
      <div className="text-center py-10">
        <Camera className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground mb-1">Point your camera at a QR code</p>
        <p className="text-xs text-muted-foreground/60 mb-4">Supports UPI, BharatQR, and EMV codes</p>
        <button onClick={startCamera} className="gold-btn px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
          <Camera className="w-4 h-4" /> Start Camera
        </button>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden">
      <video ref={videoRef} className="w-full rounded-xl" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />
      {/* Scan overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-[15%] border-2 border-gold/50 rounded-2xl" />
        <div className="absolute inset-[15%] border-2 border-gold/20 rounded-2xl animate-pulse" style={{ animationDuration: "2s" }} />
      </div>
      <button onClick={stopCamera} className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors">
        <X className="w-4 h-4" />
      </button>
      <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/70">Scanning...</p>
    </div>
  );
}

/* ── Result display ── */
function ScanResult({ result, onClear }: { result: QRDecodeResult; onClear: () => void }) {
  const { allCards, myBest } = useCardRecommendations(result.v3Key);
  const [copied, setCopied] = useState("");

  const copyField = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Merchant card */}
      <div className="glass-card rounded-2xl overflow-hidden border border-border/20">
        <div className="p-5 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center text-2xl">{result.emoji}</div>
            <div>
              <h3 className="font-serif text-xl font-bold">{result.merchantName}</h3>
              <p className="text-sm text-muted-foreground">{result.description}</p>
              {result.merchantCity && <p className="text-xs text-muted-foreground">{result.merchantCity}</p>}
            </div>
          </div>
          <button onClick={onClear} className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-border/15">
          {[
            { label: "MCC Code", value: result.mcc },
            { label: "Category", value: result.category },
            { label: "Format", value: result.format },
            { label: "Amount", value: result.amount ? `₹${result.amount}` : "N/A" },
          ].map((f) => (
            <div key={f.label} className="px-4 py-3 border-r border-border/15 last:border-r-0">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{f.label}</p>
              <p className="text-sm font-bold mt-0.5">{f.value}</p>
            </div>
          ))}
        </div>

        {result.upiId && (
          <div className="px-5 py-3 border-t border-border/15 flex items-center justify-between">
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">UPI ID</p>
              <p className="text-sm font-mono">{result.upiId}</p>
            </div>
            <button onClick={() => copyField("upi", result.upiId)} className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors">
              {copied === "upi" ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
          </div>
        )}
      </div>

      {/* Best card from wallet */}
      {myBest && (
        <div className="glass-card rounded-xl p-4 border border-green-500/20 bg-green-500/5">
          <p className="text-[10px] text-green-400 uppercase tracking-wider font-bold mb-3">Use This Card From Your Wallet</p>
          <CardRow card={myBest.card} rate={myBest.rate} highlight />
        </div>
      )}

      {/* Top cards */}
      {allCards.length > 0 && (
        <div className="glass-card rounded-xl p-4 border border-border/20">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-3">Best Cards for {result.category}</p>
          <div className="space-y-1">
            {allCards.map(({ card, rate }, i) => (
              <CardRow key={card.id} card={card} rate={rate} rank={i + 1} />
            ))}
          </div>
        </div>
      )}

      {/* Scan another */}
      <button onClick={onClear} className="w-full py-3 rounded-xl border border-gold/30 text-gold text-sm font-semibold hover:bg-gold/5 transition-colors flex items-center justify-center gap-2">
        <ScanLine className="w-4 h-4" /> Scan Another QR Code
      </button>

      <RawDataSection tags={result.rawTags} />
    </motion.div>
  );
}

function CardRow({ card, rate, rank, highlight }: { card: CardV3; rate: number; rank?: number; highlight?: boolean }) {
  return (
    <Link to={`/cards/${card.id}`} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-secondary/30 transition-colors group">
      {rank && <span className="text-xs font-mono text-muted-foreground w-5">{rank}.</span>}
      <div className="w-12 h-[30px] rounded-md overflow-hidden ring-1 ring-white/10 shadow-md shrink-0">
        <CardImage src={card.image} alt="" fallbackColor="#0D0D0D" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${highlight ? "text-green-300" : ""}`}>{card.name}</p>
        <p className="text-[10px] text-muted-foreground">{card.bank}</p>
      </div>
      <span className={`text-sm font-bold font-mono ${highlight ? "text-green-400" : "text-gold"}`}>{rate.toFixed(1)}%</span>
      <ExternalLink className="w-3 h-3 text-muted-foreground/40 group-hover:text-gold transition-colors" />
    </Link>
  );
}

function RawDataSection({ tags }: { tags: Record<string, string> }) {
  const [open, setOpen] = useState(false);
  const entries = Object.entries(tags);
  if (entries.length === 0) return null;

  return (
    <div>
      <button onClick={() => setOpen(!open)} className="text-[10px] text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
        {open ? "Hide" : "Show"} Raw QR Data ({entries.length} fields)
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-2 bg-secondary/20 rounded-xl p-4 font-mono text-xs space-y-1 max-h-48 overflow-y-auto">
              {entries.map(([k, v]) => (
                <div key={k} className="flex gap-3">
                  <span className="text-gold shrink-0">Tag {k}:</span>
                  <span className="text-muted-foreground break-all">{v}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main Page ── */
export default function QRScanner() {
  const [result, setResult] = useState<QRDecodeResult | null>(null);
  const [tab, setTab] = useState<InputTab>("upload");
  const [textInput, setTextInput] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const processQRText = useCallback((text: string) => {
    setError("");
    const decoded = decodeEMVQR(text);
    if (decoded.isValid) {
      playSound("chime");
      setResult(decoded);
      setTextInput("");
    } else {
      setError("Could not parse QR data. Try a UPI or EMV payment QR code.");
    }
  }, []);

  const handleImageFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      // Text file
      const text = await file.text();
      processQRText(text);
      return;
    }
    setProcessing(true);
    setError("");
    const data = await decodeQRFromImage(file);
    setProcessing(false);
    if (data) {
      processQRText(data);
    } else {
      setError("No QR code found in this image. Try a clearer photo.");
    }
  }, [processQRText]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  }, [handleImageFile]);

  const handleClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) processQRText(text.trim());
    } catch {
      toast({ title: "Clipboard access denied", description: "Please paste the QR text manually." });
    }
  }, [processQRText, toast]);

  return (
    <PageLayout>
      <SEO title="QR MCC Scanner" description="Scan any payment QR code to find its MCC and the best credit card to use for maximum rewards." path="/qr-scanner" />

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
            <Link to="/" className="hover:text-gold transition-colors flex items-center gap-1"><Home className="w-3 h-3" /> Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">QR Scanner</span>
          </nav>

          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-7 h-7 text-gold" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
              QR MCC <span className="gold-gradient">Scanner</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Scan any UPI or EMV payment QR code to find the MCC and the best credit card for that merchant.
            </p>
          </motion.div>

          {/* Input area — shown when no result */}
          {!result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-5">
              {/* Tab bar */}
              <div className="glass-card rounded-xl p-1.5 flex gap-1 border border-border/20">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setTab(t.id); setError(""); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      tab === t.id
                        ? "bg-gold text-background shadow-md shadow-gold/20"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <t.icon className="w-4 h-4" />
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="glass-card rounded-2xl border border-dashed border-border/30 overflow-hidden min-h-[280px] flex flex-col">
                <AnimatePresence mode="wait">
                  {/* Upload Tab */}
                  {tab === "upload" && (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col"
                      onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                      onDragLeave={() => setDragActive(false)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                    >
                      <div className={`flex-1 flex flex-col items-center justify-center p-8 transition-colors ${dragActive ? "bg-gold/5" : ""}`}>
                        <div className="w-16 h-16 rounded-2xl bg-secondary/40 flex items-center justify-center mb-4">
                          <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                        </div>
                        <h3 className="font-semibold mb-1">Upload QR Code Image</h3>
                        <p className="text-sm text-muted-foreground mb-5">Supports UPI, BharatQR, and EMV payment QR codes</p>
                        <button
                          onClick={() => fileRef.current?.click()}
                          disabled={processing}
                          className="gold-btn px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-50"
                        >
                          {processing ? (
                            <><span className="w-4 h-4 border-2 border-background/40 border-t-background rounded-full animate-spin" /> Processing...</>
                          ) : (
                            <>Choose File</>
                          )}
                        </button>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/*,.txt"
                          className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = ""; }}
                        />
                        <p className="text-[10px] text-muted-foreground/50 mt-3">or drag & drop an image here</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Camera Tab */}
                  {tab === "camera" && (
                    <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 p-4">
                      <CameraScanner onScan={processQRText} />
                    </motion.div>
                  )}

                  {/* Paste Tab */}
                  {tab === "paste" && (
                    <motion.div key="paste" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
                      <textarea
                        value={textInput}
                        onChange={(e) => { setTextInput(e.target.value); setError(""); }}
                        placeholder={"Paste QR code text here...\n\nExamples:\nupi://pay?pa=merchant@bank&pn=Store&mc=5812\n00020101021126..."}
                        className="flex-1 w-full bg-transparent p-5 text-sm font-mono resize-none placeholder:text-muted-foreground/30 focus:outline-none min-h-[180px]"
                      />
                      <div className="flex items-center gap-2 px-5 pb-4">
                        <button
                          onClick={() => { if (textInput.trim()) processQRText(textInput.trim()); }}
                          disabled={!textInput.trim()}
                          className="gold-btn px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ScanLine className="w-3.5 h-3.5" /> Decode
                        </button>
                        <button
                          onClick={handleClipboard}
                          className="px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground border border-border/20 hover:border-gold/30 transition-colors flex items-center gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5" /> Paste from Clipboard
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Error */}
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive text-center">
                  {error}
                </motion.p>
              )}

              {/* Example QR codes */}
              <div className="glass-card rounded-xl p-4 border border-border/20">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-3">Try an Example</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Amazon India", emoji: "🛒", data: "upi://pay?pa=amazon@apl&pn=Amazon+India&mc=5262&cu=INR" },
                    { label: "Swiggy", emoji: "🍽️", data: "upi://pay?pa=swiggy@paytm&pn=Swiggy&mc=5812&cu=INR" },
                    { label: "Indian Oil", emoji: "⛽", data: "upi://pay?pa=iocl@sbi&pn=Indian+Oil&mc=5541&cu=INR" },
                    { label: "BookMyShow", emoji: "🎬", data: "upi://pay?pa=bms@ybl&pn=BookMyShow&mc=7832&cu=INR" },
                  ].map((ex) => (
                    <button
                      key={ex.label}
                      onClick={() => processQRText(ex.data)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/30 text-left transition-colors border border-border/10 hover:border-gold/20"
                    >
                      <span className="text-lg">{ex.emoji}</span>
                      <span className="text-xs font-medium">{ex.label}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground/30 ml-auto" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Supported formats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "UPI QR", desc: "GPay, PhonePe, Paytm" },
                  { label: "BharatQR", desc: "Visa, MC, RuPay" },
                  { label: "EMV QR", desc: "International codes" },
                ].map((f) => (
                  <div key={f.label} className="glass-card rounded-lg p-3 text-center border border-border/10">
                    <p className="text-xs font-semibold text-gold">{f.label}</p>
                    <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Result */}
          {result && <ScanResult result={result} onClear={() => setResult(null)} />}
        </div>
      </section>
    </PageLayout>
  );
}
