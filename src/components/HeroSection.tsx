import { useEffect, useState, useRef, useMemo, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Scene3D = lazy(() => import("./Scene3D"));

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const steps = 40;
          const increment = target / steps;
          let current = 0;
          const interval = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(interval);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

import { useVouchers } from "@/hooks/use-vouchers";
import { cards } from "@/data/cards";

export default function HeroSection() {
  const isMobile = useIsMobile();
  const { vouchers } = useVouchers();

  const brandCount = vouchers.length;
  const cardCount = cards.length;
  const platformCount = useMemo(() => {
    const set = new Set<string>();
    vouchers.forEach((v) => v.platformRates.forEach((p) => set.add(p.platform)));
    return set.size;
  }, [vouchers]);

  const stats = [
    { value: brandCount, label: "Brands", icon: "🏷️" },
    { value: cardCount, label: "Cards", icon: "💳" },
    { value: platformCount, label: "Platforms", icon: "🌐" },
  ];

  const mobileStats = stats;
  const [showScene, setShowScene] = useState(false);

  useEffect(() => {
    if (isMobile) return;

    const schedule = () => {
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        const idleId = window.requestIdleCallback(() => setShowScene(true), { timeout: 1200 });
        return () => window.cancelIdleCallback(idleId);
      }

      const timeoutId = globalThis.setTimeout(() => setShowScene(true), 700);
      return () => globalThis.clearTimeout(timeoutId);
    };

    if (document.readyState === "complete") {
      return schedule();
    }

    let cleanup = () => {};
    const handleLoad = () => { cleanup = schedule(); };
    window.addEventListener("load", handleLoad, { once: true });

    return () => {
      window.removeEventListener("load", handleLoad);
      cleanup();
    };
  }, [isMobile]);

  if (isMobile) {
    return (
      <section className="relative flex flex-col items-center justify-center overflow-hidden px-5 pt-6 pb-4">
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background z-[1]" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-[1]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full bg-[radial-gradient(ellipse_at_center,hsl(var(--gold)/0.06)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,hsl(var(--gold)/0.12)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative z-10 text-center w-full max-w-sm mx-auto flex flex-col items-center">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }} className="text-[10px] font-semibold tracking-widest uppercase text-gold mb-3">
            India's Premier Credit Card Perks
          </motion.p>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="font-serif text-[2.05rem] leading-[1.2] font-bold mb-3">
            Track Voucher Rates. <span className="gold-gradient">Maximize Savings.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5 }} className="text-muted-foreground text-sm mb-7 leading-relaxed">
            Compare credit card voucher rates across brands. Never miss the best deal again.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.58, duration: 0.5 }} className="flex items-center gap-3 w-full mb-3">
            <Link to="/vouchers" className="gold-btn flex-1 py-3.5 rounded-xl text-sm flex items-center justify-center gap-1.5 group">
              Browse Vouchers
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/quiz" className="flex-1 py-3.5 rounded-xl text-sm flex items-center justify-center gap-1.5 group border border-border/50 hover:border-gold/40 hover:bg-foreground/[0.03] transition-all duration-200 text-muted-foreground hover:text-foreground">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              Find My Card
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.4 }} className="mb-7">
            <Link to="/cards" className="text-xs text-muted-foreground hover:text-gold transition-colors underline underline-offset-2">
              Compare Cards
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.82, duration: 0.5 }} className="relative inline-block w-full mb-7">
            <div className="absolute -inset-[1.5px] rounded-2xl bg-gradient-to-r from-transparent via-gold/25 to-transparent animate-[shimmer_3s_linear_infinite] bg-[length:200%_100%]" />
            <div className="relative inline-flex items-center justify-center gap-0 glass-card rounded-2xl px-6 py-4 w-full">
              {mobileStats.map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-3 flex-1 justify-center">
                  {i > 0 && <div className="w-px h-8 bg-border/60" />}
                  <div className="text-center">
                    <div className="text-base mb-0.5">{stat.icon}</div>
                    <div className="font-serif text-2xl font-bold text-gold">
                      <CountUp target={stat.value} />
                      {stat.label === "Brands" ? "+" : ""}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">{stat.label}</div>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 flex-1 justify-center">
                <div className="w-px h-8 bg-border/60" />
                <div className="text-center">
                  <div className="text-[10px] font-semibold text-gold">Updated</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Daily</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95, duration: 0.5 }} className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>⭐⭐⭐⭐⭐ Trusted by <span className="text-gold font-semibold">10,000+</span> users</span>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {showScene && (
        <Suspense fallback={null}>
          <Scene3D />
        </Suspense>
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background z-[1]" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[1]" />
      {!showScene && <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_35%,hsl(var(--gold)/0.06),transparent_45%)] dark:bg-[radial-gradient(circle_at_50%_35%,hsl(var(--gold)/0.09),transparent_45%)]" />}

      <div className="relative z-10 container mx-auto px-4 text-center pt-16 sm:pt-20">
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="text-xs sm:text-sm font-medium tracking-widest uppercase text-gold mb-3 sm:mb-5">
          India's Premier Credit Card Perks Platform
        </motion.p>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }} className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4 sm:mb-5">
          Track Voucher Rates.
          <br />
          <span className="gold-gradient">Maximize Savings.</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }} className="max-w-xl mx-auto text-muted-foreground text-sm sm:text-base md:text-lg mb-6 sm:mb-8 px-2 sm:px-0">
          Compare credit card voucher rates across brands and platforms.
          Never miss the best deal on your rewards again.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }} className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10 px-4 sm:px-0">
          <Link to="/vouchers" className="gold-btn w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 group">
            Browse Vouchers
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/cards" className="gold-outline-btn w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm text-center">
            Compare Cards
          </Link>
          <Link to="/find-my-card" className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 group border border-border/40 hover:border-gold/30 hover:bg-foreground/[0.03] transition-all duration-200 text-muted-foreground hover:text-foreground">
            <Sparkles className="w-4 h-4 text-gold" />
            Find My Card
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.6 }} className="relative inline-block mb-8">
          <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-transparent via-gold/30 to-transparent animate-[shimmer_3s_linear_infinite] bg-[length:200%_100%]" />
          <div className="relative inline-flex items-center glass-card rounded-2xl px-6 sm:px-10 py-4 sm:py-5">
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex items-center">
                {i > 0 && <div className="w-px h-12 bg-border/40 mx-5 sm:mx-8" />}
                <div className="text-center min-w-[70px] sm:min-w-[90px]">
                  <div className="text-lg sm:text-xl mb-1">{stat.icon}</div>
                  <div className="font-serif text-2xl sm:text-4xl font-bold text-gold">
                    <CountUp target={stat.value} />
                    {stat.label === "Brands" ? "+" : ""}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
            <div className="w-px h-12 bg-border/40 mx-5 sm:mx-8" />
            <div className="text-center min-w-[70px]">
              <div className="text-lg sm:text-xl mb-1">🔄</div>
              <div className="font-serif text-lg sm:text-2xl font-bold text-gold">Live</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">Updated</div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3, duration: 0.6 }} className="flex items-center justify-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
          <div className="flex -space-x-2.5">
            {["#F8C534", "#E23744", "#276EF1", "#00A651"].map((color, i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}>
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <span>Trusted by <span className="text-gold font-medium">10,000+</span> cardholders</span>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.6 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <motion.div animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="flex flex-col items-center gap-1 text-muted-foreground/50">
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}