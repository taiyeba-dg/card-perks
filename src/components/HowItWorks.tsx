import { motion } from "framer-motion";
import { TrendingUp, CreditCard, PieChart } from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    step: "01",
    title: "Track Voucher Rates",
    description: "Monitor real-time voucher conversion rates across 500+ brands. Know exactly when to redeem for maximum value.",
  },
  {
    icon: CreditCard,
    step: "02",
    title: "Compare Cards",
    description: "Side-by-side comparison of premium credit cards. Find the perfect card for your spending habits and lifestyle.",
  },
  {
    icon: PieChart,
    step: "03",
    title: "Savings Dashboard",
    description: "Visualize your savings potential with personalized insights and track how much you've saved over time.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-10 sm:py-16 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-16"
        >
          <p className="text-sm font-medium tracking-widest uppercase text-gold mb-3">How It Works</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold">
            Three Steps to <span className="gold-gradient">Smarter Savings</span>
          </h2>
        </motion.div>

        {/* ── Mobile: vertical timeline ─────────────────── */}
        <div className="sm:hidden px-2">
          <div className="relative">
            {/* Vertical connecting line */}
            <div className="absolute left-5 top-6 bottom-6 w-[2px] bg-white/10" />
            <div className="space-y-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="flex items-start gap-4 relative"
                >
                  <div className="w-10 h-10 rounded-full bg-[#C9A44A]/10 flex items-center justify-center flex-shrink-0 z-10 border-2 border-background">
                    <feature.icon className="w-4 h-4 text-gold" />
                  </div>
                  <div className="pt-1">
                    <p className="text-sm font-medium text-white">{feature.title}</p>
                    <p className="text-xs text-white/50 leading-relaxed mt-0.5">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Desktop: 3-column grid ──────────────────────────────────── */}
        <div className="hidden sm:block">
          <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            <div className="hidden md:block absolute top-1/2 left-[20%] right-[20%] -translate-y-1/2 z-0">
              <div className="border-t-2 border-dashed border-gold/20" />
            </div>

            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative tilt-card glass-card rounded-2xl p-6 sm:p-8 text-center group cursor-default border-t-2 border-transparent hover:border-gold/40 transition-all duration-300 z-10"
              >
                <span className="absolute top-3 right-4 font-serif text-5xl font-bold text-gold/[0.07] select-none pointer-events-none">
                  {feature.step}
                </span>

                <div className="w-16 h-16 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-gold/20 group-hover:shadow-[0_0_20px_hsl(var(--gold)/0.15)] transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-gold" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
