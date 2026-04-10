import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import PopularVouchers from "@/components/PopularVouchers";
import ExploreMore from "@/components/ExploreMore";
import FloatingParticles from "@/components/FloatingParticles";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import BackToTop from "@/components/BackToTop";
import SEO from "@/components/SEO";
import Testimonials from "@/components/Testimonials";
import { Link } from "react-router-dom";
import { cards } from "@/data/cards";
import { ArrowRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import PersonalizedHomeSummary from "@/components/PersonalizedHomeSummary";
import { MyCardsBanner } from "@/components/MyCardsBanner";
import ToolsGrid from "@/components/ToolsGrid";

function FeaturedCards() {
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-10 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <p className="text-sm font-medium tracking-widest uppercase text-gold mb-2">Featured Cards</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold">Premium Cards, <span className="gold-gradient">Premium Perks</span></h2>
          </div>
          <Link to="/cards" className="hidden sm:flex items-center gap-1.5 text-sm text-gold hover:text-gold-light transition-colors font-medium">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isMobile ? (
          <div className="scroll-fade-container">
            <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
              {cards.slice(0, 6).map((card) => (
                <Link key={card.id} to={`/cards/${card.id}`} className="group glass-card rounded-2xl overflow-hidden active:scale-[0.97] transition-transform duration-200 relative flex-shrink-0 w-[72vw] snap-start">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {card.image ? (
                      <img src={card.image} alt={`${card.name} credit card`} className="w-full h-full object-contain" loading="lazy" />
                    ) : (
                      <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}66)` }} />
                    )}
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-background/70 backdrop-blur-sm text-foreground border border-border/30">
                      {card.network}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="font-serif font-bold text-sm text-foreground">{card.name}</h3>
                      <p className="text-[10px] text-muted-foreground">{card.issuer} · {card.rewards} rewards · {card.fee}/yr</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.slice(0, 6).map((card) => (
              <Link key={card.id} to={`/cards/${card.id}`} className="group glass-card rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-gold/10 hover:-translate-y-1 transition-all duration-300 relative">
                <div className="relative aspect-[16/10] overflow-hidden">
                  {card.image ? (
                    <img src={card.image} alt={`${card.name} credit card`} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  ) : (
                    <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}66)` }} />
                  )}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-background/70 backdrop-blur-sm text-foreground border border-border/30">
                    {card.network}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-serif font-bold text-sm text-foreground">{card.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{card.issuer} · {card.rewards} rewards · {card.fee}/yr</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Link to="/cards" className="sm:hidden flex items-center justify-center gap-1.5 text-sm text-gold hover:text-gold-light transition-colors font-medium mt-4">
          View All Cards <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

const Index = () => {
  const isMobile = useIsMobile();
  const [showDecor, setShowDecor] = useState(false);

  useEffect(() => {
    if (isMobile) return;
    const timeoutId = window.setTimeout(() => setShowDecor(true), 900);
    return () => window.clearTimeout(timeoutId);
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-background relative pb-16 lg:pb-0">
      <SEO fullTitle="CardPerks — Track Voucher Rates & Maximize Credit Card Rewards" description="India's premier credit card perks platform. Compare voucher rates, track rewards, and maximize your credit card savings." path="/" />
      {showDecor && <FloatingParticles />}
      <Navbar />
      <div className="pt-16"><MyCardsBanner /></div>
      <HeroSection />

      <PersonalizedHomeSummary />

      <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <ScrollReveal>
        <HowItWorks />
      </ScrollReveal>

      <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <ScrollReveal delay={0.1}>
        <PopularVouchers />
      </ScrollReveal>

      <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <ScrollReveal delay={0.1}>
        <ToolsGrid />
      </ScrollReveal>

      <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <ScrollReveal delay={0.15}>
        <FeaturedCards />
      </ScrollReveal>

      <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <ScrollReveal delay={0.1}>
        <ExploreMore />
      </ScrollReveal>

      <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <ScrollReveal delay={0.1}>
        <Testimonials />
      </ScrollReveal>

      <Footer />
      <BackToTop />
      
    </div>
  );
};

export default Index;
