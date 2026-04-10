import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import BackToTop from "@/components/BackToTop";
import SEO from "@/components/SEO";
import StickySubNav from "@/components/StickySubNav";
import MobileBankingLayout from "@/components/banking/MobileBankingLayout";
import DesktopBankingLayout from "@/components/banking/DesktopBankingLayout";

const BANKING_SUBNAV = [
  { id: "bk-wealth", label: "Wealth Banking" },
  { id: "bk-family", label: "Family Banking" },
  { id: "bk-compare", label: "Compare Tiers" },
];

export default function Banking() {
  const [activeSection, setActiveSection] = useState<"wealth" | "family">("wealth");
  const heroRef = useRef<HTMLDivElement>(null);

  const handleSubNavClick = (id: string) => {
    if (id === "bk-wealth") setActiveSection("wealth");
    else if (id === "bk-family") setActiveSection("family");
    else if (id === "bk-compare") {
      setActiveSection("wealth");
      setTimeout(() => {
        const el = document.getElementById("bk-compare");
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }, 350);
    }
  };

  const layoutProps = { activeSection, setActiveSection, heroRef };

  return (
    <PageLayout>
      <SEO fullTitle="Premium Banking Tiers | CardPerks" description="Compare wealth banking tiers across HDFC, ICICI, Axis, Kotak, and SBI. Find the best banking program for your needs." path="/banking" />
      <StickySubNav items={BANKING_SUBNAV} triggerRef={heroRef} onItemClick={handleSubNavClick} />
      <section className="py-10 sm:py-16 min-h-screen">
        <div className="absolute top-0 left-0 right-0 h-[300px] pointer-events-none" style={{ background: "radial-gradient(ellipse at center top, hsl(var(--gold) / 0.04), transparent 70%)" }} />
        <div className="container mx-auto px-4 relative">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <Link to="/" className="hover:text-gold transition-colors">Home</Link>
            <span>›</span>
            <span className="text-foreground">Banking</span>
          </nav>

          <MobileBankingLayout {...layoutProps} />
          <DesktopBankingLayout {...layoutProps} />
        </div>
      </section>
      <BackToTop />
    </PageLayout>
  );
}
