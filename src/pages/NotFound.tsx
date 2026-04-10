import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, CreditCard, Gift, BookOpen, Sparkles } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";

const popularLinks = [
  { label: "Vouchers", href: "/vouchers", icon: Gift },
  { label: "Know Your Cards", href: "/cards", icon: CreditCard },
  { label: "Guides Hub", href: "/guides", icon: BookOpen },
  { label: "Perk AI", href: "/perk-ai", icon: Sparkles },
];

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <PageLayout>
      <SEO title="Page Not Found" description="The page you're looking for doesn't exist." path={location.pathname} />
      <div className="flex items-center justify-center py-24">
        <div className="text-center max-w-lg px-4">
          <div className="w-24 h-24 rounded-3xl bg-gold/10 flex items-center justify-center mx-auto mb-6 relative">
            <CreditCard className="w-10 h-10 text-gold/60" />
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center border-2 border-background">
              <span className="text-destructive text-xs font-bold">!</span>
            </div>
          </div>
          <p className="text-7xl font-serif font-bold gold-gradient mb-4">404</p>
          <h1 className="text-xl font-semibold mb-2">Page not found</h1>
          <p className="text-sm text-muted-foreground mb-8">
            The page <span className="text-foreground font-medium">{location.pathname}</span> doesn't exist or has been moved.
          </p>
          <div className="flex gap-3 justify-center mb-10">
            <Link to="/" className="gold-btn px-6 py-2.5 rounded-xl text-sm font-medium inline-flex items-center gap-2">
              <Home className="w-4 h-4" /> Go Home
            </Link>
            <button onClick={() => window.history.back()} className="px-6 py-2.5 rounded-xl text-sm font-medium glass-card border border-border/40 hover:border-gold/30 transition-colors inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
          </div>
          <div className="glass-card rounded-2xl p-5 border border-border/20">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-4">Popular Pages</p>
            <div className="grid grid-cols-2 gap-2">
              {popularLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary/30 hover:bg-gold/10 hover:text-gold text-sm font-medium transition-colors"
                >
                  <link.icon className="w-4 h-4" /> {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default NotFound;
