import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import { Badge } from "@/components/ui/badge";

interface StatItem {
  value: string;
  label: string;
  icon: React.ElementType;
}

interface FeatureItem {
  icon: React.ElementType;
  title: string;
  desc: string;
}

interface ValueItem {
  icon: React.ElementType;
  title: string;
  desc: string;
}

interface Props {
  stats: StatItem[];
  features: FeatureItem[];
  values: ValueItem[];
}

export default function MobileAboutLayout({ stats, features, values }: Props) {
  return (
    <>
      {/* Hero — tighter on mobile */}
      <section className="relative overflow-hidden pt-8 pb-10 px-5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[250px] bg-gold/6 rounded-full blur-3xl" />
        </div>
        <div className="relative text-center">
          <Badge variant="outline" className="mb-3 border-gold/30 text-gold text-[10px]">About CardPerks</Badge>
          <h1 className="text-2xl font-bold font-serif mb-3 leading-tight">
            India's Smartest<br /><span className="gold-gradient">Credit Card Platform</span>
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-5 max-w-sm mx-auto">
            Most Indians leave thousands on the table by not using their card benefits. We're here to change that.
          </p>
          <div className="flex gap-2 justify-center">
            <Link to="/cards" className="gold-btn px-5 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5">
              Explore Cards <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link to="/perk-ai" className="px-5 py-2.5 rounded-xl text-xs font-semibold glass-card border border-border/40 inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold" /> Perk AI
            </Link>
          </div>
        </div>
      </section>

      {/* Stats — 2x2 compact */}
      <section className="py-6 border-y border-border/20">
        <div className="px-4">
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s, i) => (
              <div key={s.label} className="glass-card rounded-xl p-3.5 text-center border border-border/15">
                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center mx-auto mb-2">
                  <s.icon className="w-4 h-4 text-gold" />
                </div>
                <p className="text-2xl font-serif font-bold gold-gradient">{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission — compact */}
      <section className="py-8 px-4">
        <div className="glass-card rounded-2xl p-5 border border-border/20 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, hsl(var(--gold) / 0.05), transparent 70%)" }} />
          <div className="relative">
            <Badge variant="outline" className="mb-3 border-gold/30 text-gold text-[10px]">Our Mission</Badge>
            <h2 className="text-xl font-serif font-bold mb-3">
              Unlock Every <span className="gold-gradient">Rupee of Value</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We aggregate voucher rates, compare card benefits, and use AI to match cards to your spending. No jargon, no bias.
            </p>
          </div>
        </div>
      </section>

      {/* Features — single column */}
      <section className="pb-8 px-4">
        <h2 className="text-lg font-serif font-bold text-center mb-1">What We Offer</h2>
        <p className="text-muted-foreground text-center text-xs mb-5">Everything to maximise your credit card perks</p>
        <div className="space-y-3">
          {features.map((f) => (
            <div key={f.title} className="glass-card rounded-xl p-4 flex gap-3 border border-border/15">
              <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                <f.icon className="w-4 h-4 text-gold" />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-0.5">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Values — single column */}
      <section className="py-6 bg-secondary/20 px-4">
        <h2 className="text-lg font-serif font-bold text-center mb-1">Our Values</h2>
        <p className="text-muted-foreground text-center text-xs mb-5">The principles behind everything we build</p>
        <div className="space-y-3">
          {values.map((v) => (
            <div key={v.title} className="glass-card rounded-xl p-4 flex gap-3 border border-border/15">
              <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                <v.icon className="w-4 h-4 text-gold" />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-0.5">{v.title}</h3>
                <p className="text-xs text-muted-foreground">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 px-4">
        <div className="glass-card rounded-2xl p-6 text-center border border-gold/10" style={{ background: "linear-gradient(135deg, hsl(var(--gold) / 0.06), transparent)" }}>
          <Sparkles className="w-8 h-8 text-gold mx-auto mb-3" />
          <h2 className="text-xl font-serif font-bold mb-2">Ready to Maximise Your Perks?</h2>
          <p className="text-xs text-muted-foreground mb-5">Let Perk AI analyse your spending and recommend the perfect card.</p>
          <Link to="/perk-ai" className="gold-btn px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Chat with Perk AI
          </Link>
        </div>
      </section>
    </>
  );
}
