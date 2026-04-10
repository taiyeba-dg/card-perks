import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SpecialOffer } from "@/data/card-v3-types";

interface Props {
  offers: SpecialOffer[];
}

export default function SpecialOffersCarousel({ offers }: Props) {
  const now = new Date();
  const activeOffers = offers.filter((o) => new Date(o.validTo) >= now);

  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (activeOffers.length <= 1 || paused) return;
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % activeOffers.length);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [activeOffers.length, paused]);

  if (activeOffers.length === 0) return null;

  return (
    <div
      className="mb-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-xl border border-gold/15 bg-gold/[0.03]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="px-4 py-3 sm:px-5 sm:py-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                <span className="text-lg">🎁</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{activeOffers[current].title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{activeOffers[current].description}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground/60">
                  <span>Valid: {new Date(activeOffers[current].validFrom).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} – {new Date(activeOffers[current].validTo).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                  <span className="px-1.5 py-0.5 rounded bg-secondary/40 text-muted-foreground">{activeOffers[current].category}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dot indicators */}
        {activeOffers.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pb-2">
            {activeOffers.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${i === current ? "w-4 h-1.5 bg-gold" : "w-1.5 h-1.5 bg-gold/20"}`}
                aria-label={`Offer ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
