import { motion } from "framer-motion";
import { CreditCard, Sparkles, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const sections = [
  {
    icon: CreditCard,
    title: "Know Your Cards",
    description: "Deep-dive into every credit card's perks, fees, and hidden benefits. Make informed decisions.",
    href: "/cards",
    badge: "6 premium cards",
    iconBg: "bg-gold/10",
    iconHoverBg: "group-hover:bg-gold/20",
    iconColor: "text-gold",
    gradientFrom: "from-gold/[0.03]",
  },
  {
    icon: Sparkles,
    title: "Perk AI",
    description: "AI-powered recommendations tailored to your spending patterns. Discover perks you didn't know existed.",
    href: "/perk-ai",
    badge: "AI-powered",
    iconBg: "bg-gold/10",
    iconHoverBg: "group-hover:bg-gold/20",
    iconColor: "text-gold",
    gradientFrom: "from-gold/[0.03]",
  },
  {
    icon: BookOpen,
    title: "Guides Hub",
    description: "Expert guides on maximizing rewards, credit card hacks, and smart redemption strategies.",
    href: "/guides",
    badge: "12+ guides",
    iconBg: "bg-gold/10",
    iconHoverBg: "group-hover:bg-gold/20",
    iconColor: "text-gold",
    gradientFrom: "from-gold/[0.03]",
  },
];

export default function ExploreMore() {
  return (
    <section className="py-12 sm:py-16 relative bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <p className="text-sm font-medium tracking-widest uppercase text-gold mb-3">Explore More</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold">
            Unlock Your <span className="gold-gradient">Full Potential</span>
          </h2>
        </motion.div>

        {/* ── Mobile: compact 2-col icon grid ───────────────────────── */}
        <div className="sm:hidden">
          {/* First card spans full width */}
          <motion.div
          initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-3"
          >
            {(() => { const S0 = sections[0]; const Icon0 = S0.icon; return (
              <Link
                to={S0.href}
                className="flex items-center gap-4 glass-card rounded-2xl p-4 group active:scale-[0.98] transition-transform bg-gradient-to-br from-gold/[0.03] to-transparent"
              >
                <div className={`w-12 h-12 rounded-xl ${S0.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <Icon0 className={`w-5 h-5 ${S0.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-block text-[9px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-gold/10 text-gold mb-1">
                    {S0.badge}
                  </span>
                  <h3 className="font-serif text-base font-semibold leading-tight">{S0.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{S0.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gold flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ); })()}
          </motion.div>

          {/* Last two in a 2-col grid */}
          <div className="grid grid-cols-2 gap-3">
            {sections.slice(1).map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i + 1) * 0.1, duration: 0.4 }}
              >
                <Link
                  to={s.href}
                  className={`flex flex-col glass-card rounded-2xl p-4 group active:scale-[0.98] transition-transform h-full bg-gradient-to-br ${s.gradientFrom} to-transparent`}
                >
                  <span className="inline-block text-[9px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-gold/10 text-gold mb-3 self-start">
                    {s.badge}
                  </span>
                  <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-3`}>
                    <s.icon className={`w-4.5 h-4.5 ${s.iconColor}`} style={{ width: '1.1rem', height: '1.1rem' }} />
                  </div>
                  <h3 className="font-serif text-sm font-semibold mb-1">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">{s.description}</p>
                  <span className="inline-flex items-center gap-1 text-xs text-gold font-medium mt-3">
                    Explore <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Desktop: 3-column grid ──────────────────────────────────── */}
        <div className="hidden sm:grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {sections.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 8px 32px -8px hsl(var(--gold) / 0.25), 0 0 0 1px hsl(var(--gold) / 0.3)",
                transition: { duration: 0.3, ease: "easeOut" },
              }}
              className={`block glass-card rounded-2xl h-full bg-gradient-to-br ${s.gradientFrom} to-transparent`}
            >
              <Link to={s.href} className="block p-8 h-full group">
                <span className="inline-block text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-gold/10 text-gold mb-4">
                  {s.badge}
                </span>

                <div className={`w-12 h-12 rounded-xl ${s.iconBg} flex items-center justify-center mb-5 ${s.iconHoverBg} transition-colors`}>
                  <s.icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{s.description}</p>
                <span className="inline-flex items-center gap-1 text-sm text-gold font-medium">
                  Explore{" "}
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
