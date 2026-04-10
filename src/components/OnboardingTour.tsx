import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Ticket, CreditCard, Sparkles } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const STORAGE_KEY = "onboarding_tour_done";

// ── Step definitions ──────────────────────────────────────────────────────────

interface TourStep {
  target: string;
  title: string;
  description: string;
  position: "bottom" | "bottom-left" | "bottom-right";
  icon?: React.ReactNode;
  href?: string;
}

const DESKTOP_STEPS: TourStep[] = [
  {
    target: "vouchers",
    title: "Browse Vouchers",
    description: "Compare voucher rates across 12+ brands and platforms to maximise your savings.",
    position: "bottom",
  },
  {
    target: "know-your-cards",
    title: "Know Your Cards",
    description: "Deep-dive into credit card perks, fees, lounge access, and benefits side by side.",
    position: "bottom",
  },
  {
    target: "search-btn",
    title: "Instant Search",
    description: "Search cards, vouchers, and guides instantly with ⌘K from anywhere on the site.",
    position: "bottom-left",
  },
  {
    target: "theme-toggle",
    title: "Light & Dark Mode",
    description: "Switch between light and dark themes to suit your preference at any time.",
    position: "bottom-left",
  },
];

const MOBILE_STEPS = [
  {
    icon: <Ticket className="w-8 h-8 text-gold" />,
    title: "Browse Vouchers",
    description: "Compare voucher rates across 12+ brands and platforms to maximise your savings. Filter by bank, brand, or category.",
    href: "/vouchers",
  },
  {
    icon: <CreditCard className="w-8 h-8 text-gold" />,
    title: "Compare Cards",
    description: "Side-by-side comparison of credit card perks, fees, lounge access, and cashback — pick the card that fits you best.",
    href: "/compare",
  },
  {
    icon: <Sparkles className="w-8 h-8 text-gold" />,
    title: "Try Perk AI",
    description: "Chat with our AI assistant to get personalised card recommendations and maximise your credit card rewards.",
    href: "/perk-ai",
  },
];

// ── Desktop: Spotlight ────────────────────────────────────────────────────────

function Spotlight({ rect }: { rect: DOMRect }) {
  const PAD = 6;
  return (
    <motion.div
      key={`${rect.top}-${rect.left}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed pointer-events-none z-[9998]"
      style={{
        top: rect.top - PAD,
        left: rect.left - PAD,
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
        borderRadius: 12,
        boxShadow: "0 0 0 3px hsl(var(--gold)), 0 0 0 9999px rgba(0,0,0,0.55)",
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-xl border-2 border-gold/70"
        animate={{ scale: [1, 1.12, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

// ── Desktop: Tooltip ──────────────────────────────────────────────────────────

interface TooltipProps {
  step: TourStep;
  rect: DOMRect;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
}

function Tooltip({ step, rect, stepIndex, totalSteps, onNext, onSkip }: TooltipProps) {
  const isLast = stepIndex === totalSteps - 1;
  const GAP = 20;
  const top = rect.bottom + GAP + window.scrollY;
  let left: number;
  if (step.position === "bottom-left") {
    left = Math.max(16, rect.right - 280);
  } else if (step.position === "bottom-right") {
    left = rect.left;
  } else {
    left = Math.max(16, rect.left + rect.width / 2 - 140);
  }
  const clampedLeft = Math.min(left, window.innerWidth - 296);

  return (
    <motion.div
      key={stepIndex}
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="fixed z-[9999] w-72 glass-card rounded-2xl border border-gold/25 shadow-[0_12px_40px_rgba(0,0,0,0.4)] p-4"
      style={{ top, left: clampedLeft }}
    >
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent rounded-full" />
      <div className="flex items-start justify-between mb-2">
        <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-gold">
          Step {stepIndex + 1} of {totalSteps}
        </span>
        <button onClick={onSkip} className="text-muted-foreground hover:text-foreground transition-colors -mt-0.5" aria-label="Skip tour">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <h3 className="font-serif font-semibold text-base mb-1.5">{step.title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-4">{step.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === stepIndex ? "w-4 h-1.5 bg-gold" : i < stepIndex ? "w-1.5 h-1.5 bg-gold/40" : "w-1.5 h-1.5 bg-border/60"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onSkip} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Skip
          </button>
          <button onClick={onNext} className="gold-btn flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold">
            {isLast ? "Done" : "Next"}
            {!isLast && <ArrowRight className="w-3 h-3" />}
          </button>
        </div>
      </div>
      <div
        className="absolute -top-[7px] w-3 h-3 border-l border-t border-gold/25 rotate-45"
        style={{
          left: step.position === "bottom-left" ? "auto" : step.position === "bottom-right" ? 20 : "calc(50% - 6px)",
          right: step.position === "bottom-left" ? 20 : "auto",
          background: "hsl(var(--card))",
        }}
      />
    </motion.div>
  );
}

// ── Mobile: Fixed Overlay ─────────────────────────────────────────────────────

interface MobileSheetProps {
  stepIndex: number;
  onNext: () => void;
  onSkip: () => void;
}

function MobileOnboardingSheet({ stepIndex, onNext, onSkip }: MobileSheetProps) {
  const step = MOBILE_STEPS[stepIndex];
  const isLast = stepIndex === MOBILE_STEPS.length - 1;
  const total = MOBILE_STEPS.length;

  // Swipe-to-dismiss / swipe-to-advance state
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    dragStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - dragStartX.current;
    const dy = e.changedTouches[0].clientY - dragStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && dx < -50) {
      onNext();
    } else if (dy > 60 && Math.abs(dy) > Math.abs(dx)) {
      onSkip();
    }
  };

  return (
    <motion.div
      key="mobile-sheet-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9997] bg-black/60 flex items-end justify-center pb-24"
      onClick={onSkip}
    >
      <motion.div
        key={`mobile-sheet-${stepIndex}`}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 320, damping: 34, mass: 0.9 }}
        className="relative z-10 rounded-2xl border border-gold/20 bg-card shadow-[0_16px_60px_rgba(0,0,0,0.5)] mx-4 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Gold shimmer accent */}
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent rounded-t-2xl" />

        {/* Skip button */}
        <button
          onClick={onSkip}
          className="absolute top-3 right-4 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors z-10"
          aria-label="Skip tour"
        >
          Skip <X className="w-3.5 h-3.5" />
        </button>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex flex-col items-center px-6 pt-8 pb-6 text-center"
          >
            {/* Icon ring */}
            <div className="relative mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center shadow-[0_0_24px_hsl(var(--gold)/0.15)]">
                {step.icon}
              </div>
              <motion.div
                className="absolute inset-0 rounded-2xl border border-gold/30"
                animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            {/* Step label */}
            <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-gold mb-2">
              {stepIndex + 1} of {total}
            </span>

            <h2 className="font-serif font-bold text-xl mb-2 text-foreground">{step.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{step.description}</p>

            {/* Swipe hint */}
            <p className="mt-3 text-[10px] text-muted-foreground/50 tracking-wide">
              {isLast ? "Tap Done to get started" : "Swipe left or tap Next"}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="px-6 pb-5 pt-1">
          <div className="flex items-center justify-between">
            {/* Step dots */}
            <div className="flex items-center gap-2">
              {Array.from({ length: total }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    width: i === stepIndex ? 20 : 6,
                    backgroundColor: i === stepIndex
                      ? "hsl(var(--gold))"
                      : i < stepIndex
                      ? "hsl(var(--gold) / 0.4)"
                      : "hsl(var(--border) / 0.7)",
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="h-1.5 rounded-full"
                  style={{ width: i === stepIndex ? 20 : 6 }}
                />
              ))}
            </div>

            <button
              onClick={onNext}
              className="gold-btn flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-semibold"
              style={{ touchAction: "manipulation" }}
            >
              {isLast ? "Get Started" : "Next"}
              {!isLast && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main tour controller ──────────────────────────────────────────────────────

export default function OnboardingTour() {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const location = useLocation();
  const isMobile = useIsMobile();

  const isHome = location.pathname === "/";

  useEffect(() => {
    if (!isHome) return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setActive(true), 1600);
    return () => clearTimeout(t);
  }, [isHome]);

  const measureTarget = useCallback((target: string) => {
    const el = document.querySelector(`[data-tour="${target}"]`);
    if (!el) return null;
    return el.getBoundingClientRect();
  }, []);

  useEffect(() => {
    if (!active || isMobile) return;
    const step = DESKTOP_STEPS[stepIndex];
    if (!step) return;
    const r = measureTarget(step.target);
    setRect(r);
  }, [active, stepIndex, isMobile, measureTarget]);

  const complete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "done");
    setActive(false);
  }, []);

  const next = useCallback(() => {
    const steps = isMobile ? MOBILE_STEPS : DESKTOP_STEPS;
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      complete();
    }
  }, [stepIndex, isMobile, complete]);

  if (!active) return null;

  // ── Mobile path ──
  if (isMobile) {
    return (
      <AnimatePresence mode="wait">
        {active && (
          <MobileOnboardingSheet
            key="mobile-sheet"
            stepIndex={stepIndex}
            onNext={next}
            onSkip={complete}
          />
        )}
      </AnimatePresence>
    );
  }

  // ── Desktop path ──
  if (!rect) return null;
  const step = DESKTOP_STEPS[stepIndex];

  return (
    <AnimatePresence mode="wait">
      <Spotlight key={`spot-${stepIndex}`} rect={rect} />
      <Tooltip
        key={`tip-${stepIndex}`}
        step={step}
        rect={rect}
        stepIndex={stepIndex}
        totalSteps={DESKTOP_STEPS.length}
        onNext={next}
        onSkip={complete}
      />
    </AnimatePresence>
  );
}
