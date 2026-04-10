import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const TOOLS = [
  { emoji: "📱", label: "Card Finder Quiz", desc: "Personalized card recommendations", href: "/find-my-card" },
  { emoji: "⚔️", label: "Compare Cards", desc: "Side-by-side card comparison", href: "/compare" },
  { emoji: "🔧", label: "Stack Optimizer", desc: "Optimize your card wallet", href: "/optimize-stack" },
  { emoji: "🏅", label: "Know Your Cards", desc: "Deep-dive into card perks", href: "/cards" },
  { emoji: "🏦", label: "Wealth Banking", desc: "Premium banking tiers compared", href: "/banking" },
  { emoji: "📉", label: "Voucher Rates", desc: "Track the best voucher deals", href: "/vouchers" },
  { emoji: "🎯", label: "My Cards", desc: "Track your card portfolio", href: "/my-cards" },
  { emoji: "💰", label: "Fee Worth Calculator", desc: "Is your card fee justified?", href: "/tools/fee-worth-calculator" },
];

export default function ToolsGrid() {
  const isMobile = useIsMobile();

  return (
    <section className="py-10 sm:py-14">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <p className="text-sm font-medium tracking-widest uppercase text-gold mb-2">All Tools</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold">
            Everything You <span className="gold-gradient">Need</span>
          </h2>
        </div>
        <div className={`grid ${isMobile ? "grid-cols-3 gap-2.5" : "grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-4 max-w-3xl mx-auto"}`}>
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              to={tool.href}
              className="glass-card rounded-xl p-3 sm:p-4 text-center hover:shadow-md hover:shadow-gold/5 hover:-translate-y-0.5 transition-all group border border-border/20 hover:border-gold/20"
            >
              <span className={`${isMobile ? "text-xl" : "text-2xl"} block mb-2`}>{tool.emoji}</span>
              <p className={`font-semibold ${isMobile ? "text-[10px]" : "text-xs"} leading-tight`}>{tool.label}</p>
              {!isMobile && (
                <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{tool.desc}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
