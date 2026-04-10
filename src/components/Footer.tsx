import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { ArrowRight, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/cardperks-logo.png";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    setSubscribed(true);
    toast({ title: "Subscribed!", description: "You'll receive weekly credit card insights." });
  };

  return (
    <footer className="relative border-t border-border/50 py-6 md:py-16">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8 mb-6 md:mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-2 md:mb-4">
              <img src={logo} alt="CardPerks" className="h-7 md:h-9 w-auto rounded-lg" />
            </Link>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-xs line-clamp-2 md:line-clamp-none">
              India's premier credit card perks and voucher tracking platform. Track rates, compare cards, maximize savings.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold text-xs md:text-sm mb-2 md:mb-4 text-gold">Explore</h4>
            <div className="flex flex-col gap-1.5 md:gap-2.5">
              <Link to="/vouchers" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">Vouchers</Link>
              <Link to="/cards" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">Know Your Cards</Link>
              <Link to="/my-cards" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">My Cards</Link>
              <Link to="/banking" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">Banking</Link>
              <Link to="/guides" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">Guides Hub</Link>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-semibold text-xs md:text-sm mb-2 md:mb-4 text-gold">Tools</h4>
            <div className="flex flex-col gap-1.5 md:gap-2.5">
              <Link to="/compare" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">Compare Cards</Link>
              <Link to="/find-my-card" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">Card Finder Quiz</Link>
              <Link to="/best-for" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">Best by Category</Link>
              <Link to="/optimize-stack" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">Stack Optimizer</Link>
              <Link to="/qr-scanner" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">QR Scanner</Link>
              <Link to="/perk-ai" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">Perk AI</Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-xs md:text-sm mb-2 md:mb-4 text-gold">Company</h4>
            <div className="flex flex-col gap-1.5 md:gap-2.5">
              <Link to="/about" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</Link>
              <Link to="/privacy" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
              <Link to="/devaluation-tracker" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">Devaluation Tracker</Link>
              <Link to="/support" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">Support Us</Link>
            </div>
          </div>

          {/* Subscribe */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-semibold text-xs md:text-sm mb-2 md:mb-4 text-gold">Stay Updated</h4>
            <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-4 hidden md:block">Get weekly insights on the best credit card deals.</p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs md:text-sm text-gold">
                <Check className="w-4 h-4" />
                <span>You're subscribed!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary/50 border-border/50 text-xs md:text-sm h-8 md:h-10 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
                />
                <button type="submit" className="gold-btn px-3 md:px-4 rounded-lg flex items-center">
                  <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-border/30 pt-4 md:pt-8 flex flex-col sm:flex-row items-center justify-between gap-2 md:gap-4">
          <p className="text-[10px] md:text-xs text-muted-foreground">©2026 CardPerks. All rights reserved.</p>
          <p className="text-[10px] md:text-xs text-muted-foreground">Made with ♥ for smart savers</p>
        </div>
      </div>
    </footer>
  );
}
