import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import { Coffee, Star, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const supportOptions = [
  {
    emoji: "☕",
    icon: Coffee,
    title: "Buy Us a Coffee",
    desc: "Your support helps us maintain real-time voucher rates and build new tools.",
    buttonLabel: "Buy a Coffee — ₹99",
    action: () => window.open("https://buymeacoffee.com", "_blank"),
  },
  {
    emoji: "⭐",
    icon: Star,
    title: "Rate & Review",
    desc: "Leave a review to help others discover CardPerks.",
    buttonLabel: "Rate on Google",
    action: () => window.open("https://g.page/review", "_blank"),
  },
  {
    emoji: "📢",
    icon: Share2,
    title: "Spread the Word",
    desc: "Share CardPerks with friends who use credit cards.",
    buttonLabel: "Share",
    action: async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: "CardPerks - Track Voucher Rates",
            text: "Check out CardPerks — the best free tool for maximizing credit card rewards in India!",
            url: window.location.origin,
          });
        } catch {}
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        toast.success("Link copied to clipboard!");
      }
    },
  },
];

export default function SupportUs() {
  return (
    <PageLayout>
      <SEO title="Support Us" description="Help keep CardPerks free and ad-free for everyone." path="/support-us" />

      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Breadcrumb */}
          <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1.5">
            <Link to="/" className="hover:text-gold transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Support Us</span>
          </nav>

          {/* Heading */}
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            Support <span className="gold-gradient">CardPerks</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mb-8">
            Help us keep this platform free and ad-free for everyone.
          </p>

          {/* Support cards */}
          <div className="space-y-4">
            {supportOptions.map((opt) => (
              <div
                key={opt.title}
                className="bg-white/5 border border-white/10 rounded-xl p-6"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-1">{opt.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{opt.desc}</p>
                    <button
                      onClick={opt.action}
                      className="gold-btn px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
                    >
                      <opt.icon className="w-4 h-4" />
                      {opt.buttonLabel}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer text */}
          <p className="text-center text-sm text-muted-foreground mt-10 leading-relaxed">
            CardPerks is built by a small team passionate about helping Indians maximize credit card rewards. Every bit of support helps! 💛
          </p>
        </div>
      </section>
    </PageLayout>
  );
}
