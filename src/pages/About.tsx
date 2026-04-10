import { Heart, Target, Users, Zap, CreditCard, BookOpen, Star, ArrowRight, Sparkles, Shield, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageLayout from "@/components/PageLayout";
import ScrollReveal from "@/components/ScrollReveal";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileAboutLayout from "@/components/about/MobileAboutLayout";

const values = [
  { icon: Target, title: "Transparency", desc: "Unbiased, data-driven comparisons — no hidden sponsorships or paid placements." },
  { icon: Zap, title: "Maximize Value", desc: "Every feature is designed to help you extract maximum value from your cards." },
  { icon: Users, title: "Community First", desc: "Built by credit card enthusiasts for enthusiasts. Your feedback shapes us." },
  { icon: Heart, title: "Passion for Perks", desc: "We're obsessed with finding every last reward point, lounge visit, and voucher deal." },
];

const stats = [
  { value: "16", label: "Credit Cards", icon: CreditCard },
  { value: "8", label: "Issuers Covered", icon: Shield },
  { value: "12+", label: "Voucher Brands", icon: Star },
  { value: "500+", label: "Monthly Users", icon: Users },
];

const features = [
  { icon: CreditCard, title: "Card Catalog", desc: "Detailed breakdown of every major Indian credit card — fees, rewards, perks, and more." },
  { icon: TrendingUp, title: "Voucher Tracker", desc: "Live and historical voucher redemption rates across all major platforms." },
  { icon: BookOpen, title: "Guides Hub", desc: "Step-by-step guides to maximise cashback, lounge access, and milestone benefits." },
  { icon: Sparkles, title: "Perk AI", desc: "Our AI assistant helps you find the perfect card for your spending habits instantly." },
];

export default function About() {
  const isMobile = useIsMobile();

  return (
    <PageLayout>
      <SEO title="About Us" description="CardPerks is India's most comprehensive credit card rewards platform. Discover, compare, and maximize your credit card perks." path="/about" />

      {isMobile ? (
        <MobileAboutLayout stats={stats} features={features} values={values} />
      ) : (
        <>
          {/* Hero */}
          <section className="relative overflow-hidden py-20">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gold/6 rounded-full blur-3xl" />
            </div>
            <div className="container mx-auto px-4 relative">
              <ScrollReveal>
                <div className="text-center max-w-3xl mx-auto">
                  <Badge variant="outline" className="mb-5 border-gold/30 text-gold">About CardPerks</Badge>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif mb-6 leading-tight">
                    India's Smartest<br /><span className="gold-gradient">Credit Card Platform</span>
                  </h1>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
                    Most Indians leave thousands of rupees on the table by not fully using their credit card benefits. We're here to change that — one perk at a time.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Link to="/cards" className="gold-btn px-7 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2 shadow-lg shadow-gold/15">
                      Explore Cards <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link to="/perk-ai" className="gold-outline-btn px-7 py-3 rounded-xl text-sm font-semibold border border-gold/40 hover:border-gold/60 transition-colors inline-flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-gold" /> Try Perk AI
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Stats bar */}
          <section className="py-10 border-y border-border/20">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                  <ScrollReveal key={s.label} delay={i * 0.08}>
                    <motion.div whileHover={{ y: -2 }} className="glass-card rounded-2xl p-5 text-center border border-border/15 hover:border-gold/20 transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-gold/15 transition-colors">
                        <s.icon className="w-5 h-5 text-gold" />
                      </div>
                      <p className="text-3xl font-serif font-bold gold-gradient">{s.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                    </motion.div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* Mission */}
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-4xl">
              <ScrollReveal>
                <div className="glass-card rounded-3xl p-8 sm:p-12 border border-border/20 text-center relative overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, hsl(var(--gold) / 0.05), transparent 70%)" }} />
                  <div className="relative">
                    <Badge variant="outline" className="mb-5 border-gold/30 text-gold">Our Mission</Badge>
                    <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-5">
                      Unlock Every <span className="gold-gradient">Rupee of Value</span>
                    </h2>
                    <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto text-base">
                      We aggregate voucher rates, compare card benefits in real-time, and use AI to match cards to your exact spending pattern. No jargon, no bias — just the best possible advice for every wallet.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Features */}
          <section className="pb-12">
            <div className="container mx-auto px-4">
              <ScrollReveal>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center mb-2">What We Offer</h2>
                <p className="text-muted-foreground text-center text-sm mb-10">Everything you need to maximise your credit card perks</p>
              </ScrollReveal>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
                {features.map((f, i) => (
                  <ScrollReveal key={f.title} delay={i * 0.08}>
                    <motion.div whileHover={{ y: -3 }} className="glass-card rounded-2xl p-6 h-full border border-border/15 hover:border-gold/20 transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/15 transition-colors">
                        <f.icon className="w-5 h-5 text-gold" />
                      </div>
                      <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                    </motion.div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* Values */}
          <section className="py-12 bg-secondary/20">
            <div className="container mx-auto px-4">
              <ScrollReveal>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center mb-2">Our Values</h2>
                <p className="text-muted-foreground text-center text-sm mb-10">The principles that guide everything we build</p>
              </ScrollReveal>
              <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
                {values.map((v, i) => (
                  <ScrollReveal key={v.title} delay={i * 0.07}>
                    <motion.div whileHover={{ y: -2 }} className="glass-card rounded-xl p-6 h-full flex gap-4 border border-border/15 hover:border-gold/20 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                        <v.icon className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold mb-1.5">{v.title}</h3>
                        <p className="text-sm text-muted-foreground">{v.desc}</p>
                      </div>
                    </motion.div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <ScrollReveal>
                <div className="glass-card rounded-3xl p-8 sm:p-12 max-w-2xl mx-auto text-center border border-gold/10" style={{ background: "linear-gradient(135deg, hsl(var(--gold) / 0.06), transparent)" }}>
                  <Sparkles className="w-10 h-10 text-gold mx-auto mb-4" />
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-3">Ready to Maximise Your Perks?</h2>
                  <p className="text-muted-foreground text-sm mb-7">Let Perk AI analyse your spending and recommend the perfect card in seconds.</p>
                  <Link to="/perk-ai" className="gold-btn px-8 py-3.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 shadow-lg shadow-gold/15">
                    <Sparkles className="w-4 h-4" /> Chat with Perk AI
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          </section>
        </>
      )}
    </PageLayout>
  );
}
