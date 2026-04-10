import { useState, useRef } from "react";
import { Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    name: "Rahul M.",
    initials: "RM",
    color: "#F8C534",
    text: "CardPerks helped me save ₹12,000 on vouchers last quarter. The rate comparison is invaluable!",
    card: "ICICI Emeralde Private",
    rating: 5,
  },
  {
    name: "Priya S.",
    initials: "PS",
    color: "#E23744",
    text: "The Perk AI feature is a game changer. It recommended the perfect card for my spending pattern.",
    card: "HDFC Infinia",
    rating: 5,
  },
  {
    name: "Arjun K.",
    initials: "AK",
    color: "#276EF1",
    text: "Finally a platform that tracks voucher rates across platforms. Switched from manual tracking to this.",
    card: "Axis Magnus",
    rating: 4,
  },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const dragRef = useRef<HTMLDivElement>(null);
  const SWIPE_THRESHOLD = 50;

  const goNext = () => setActive((p) => (p + 1) % testimonials.length);
  const goPrev = () => setActive((p) => (p - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-12 sm:py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-sm font-medium tracking-widest uppercase text-gold mb-2">What Users Say</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold">
            Trusted by <span className="gold-gradient">Smart Savers</span>
          </h2>
        </div>

        {/* ── Mobile: swipeable single-card carousel ─────────────────── */}
        <div className="sm:hidden">
          <div ref={dragRef} className="relative overflow-hidden touch-pan-y">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -SWIPE_THRESHOLD) goNext();
                  else if (info.offset.x > SWIPE_THRESHOLD) goPrev();
                }}
                className="glass-card rounded-2xl p-6 flex flex-col cursor-grab active:cursor-grabbing select-none"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(testimonials[active].rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-gold fill-gold" />
                  ))}
                  {[...Array(5 - testimonials[active].rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-muted-foreground/20" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-5 pointer-events-none">
                  "{testimonials[active].text}"
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-border/30 pointer-events-none">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${testimonials[active].color}, ${testimonials[active].color}99)` }}
                  >
                    {testimonials[active].initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{testimonials[active].name}</p>
                    <p className="text-[10px] text-muted-foreground">{testimonials[active].card} user</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Swipe hint + dot indicators */}
          <div className="flex items-center justify-center gap-4 mt-5">
            <button
              onClick={goPrev}
              className="w-8 h-8 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-gold transition-colors active:scale-90"
              aria-label="Previous"
            >
              ‹
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`rounded-full transition-all duration-300 ${i === active ? "w-5 h-2 bg-gold" : "w-2 h-2 bg-gold/20"}`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={goNext}
              className="w-8 h-8 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-gold transition-colors active:scale-90"
              aria-label="Next"
            >
              ›
            </button>
          </div>
        </div>

        {/* ── Desktop: 3-column grid ──────────────────────────────────── */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {testimonials.map((t) => (
            <div key={t.name} className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-gold fill-gold" />
                ))}
                {[...Array(5 - t.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-muted-foreground/20" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-3 border-t border-border/30">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}99)` }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.card} user</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
