import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sun, Moon, Bell, BellOff, User, LogOut, Shield, ChevronRight,
  Smartphone, Mail, Trash2, HelpCircle, Heart, Info, Volume2, CreditCard,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useMyCards } from "@/hooks/use-my-cards";
import { useFavorites } from "@/hooks/use-favorites";
import { haptic } from "@/lib/haptics";
import { playSound, isSoundEnabled, setSoundEnabled } from "@/lib/sounds";

// ── Section wrapper ────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 px-1 mb-2">
        {title}
      </p>
      <div className="glass-card rounded-2xl overflow-hidden divide-y divide-border/20">
        {children}
      </div>
    </div>
  );
}

// ── Row: toggle ────────────────────────────────────────────────────────────────
function ToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onCheckedChange,
  iconColor = "text-gold",
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  iconColor?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="w-8 h-8 rounded-xl bg-secondary/50 flex items-center justify-center flex-shrink-0">
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

// ── Row: link / action ─────────────────────────────────────────────────────────
function ActionRow({
  icon: Icon,
  label,
  description,
  onClick,
  href,
  iconColor = "text-muted-foreground",
  labelColor = "text-foreground",
  chevron = true,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  onClick?: () => void;
  href?: string;
  iconColor?: string;
  labelColor?: string;
  chevron?: boolean;
}) {
  const inner = (
    <div className="flex items-center gap-3 px-4 py-3.5 w-full">
      <div className="w-8 h-8 rounded-xl bg-secondary/50 flex items-center justify-center flex-shrink-0">
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className={`text-sm font-medium ${labelColor}`}>{label}</p>
        {description && <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {chevron && <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />}
    </div>
  );

  if (href) {
    return <Link to={href} className="block active:bg-secondary/30 transition-colors">{inner}</Link>;
  }
  return (
    <button onClick={onClick} className="block w-full active:bg-secondary/30 transition-colors">
      {inner}
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { count: myCardCount } = useMyCards();
  const { count: favCount } = useFavorites("voucher");

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Guest User";
  const isSignedIn = !!user;

  const [notifRates,    setNotifRates]    = useState(true);
  const [notifWeekly,   setNotifWeekly]   = useState(false);
  const [notifOffers,   setNotifOffers]   = useState(true);
  const [notifEmail,    setNotifEmail]    = useState(false);
  const [soundOn,       setSoundOn]       = useState(isSoundEnabled);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    navigate("/");
  };

  const handleClearData = () => {
    toast({
      title: "Local data cleared",
      description: "Your recent views, favorites, and My Cards have been reset.",
    });
    localStorage.clear();
  };

  return (
    <PageLayout>
      <SEO fullTitle="Settings | CardPerks" description="Manage your CardPerks preferences, notifications, and account." path="/settings" />

      <section className="py-8 pb-24">
        <div className="container mx-auto px-4 max-w-lg">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gold mb-2">Preferences</p>
            <h1 className="font-serif text-3xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">Customise your CardPerks experience.</p>
          </motion.div>

          {/* Account info */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
          >
            <Section title="Account">
              {/* Profile row */}
              <div className="flex items-center gap-3 px-4 py-4">
                <div className="w-11 h-11 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{displayName}</p>
                  <p className="text-[11px] text-muted-foreground">{isSignedIn ? user.email : "Not signed in"}</p>
                </div>
                {!isSignedIn && (
                  <Link
                    to="/login"
                    className="gold-btn px-4 py-1.5 rounded-xl text-xs font-semibold"
                  >
                    Sign In
                  </Link>
                )}
              </div>

              {/* Quick stats */}
              {isSignedIn && (
                <div className="flex items-center gap-4 px-4 py-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CreditCard className="w-3.5 h-3.5 text-gold" />
                    <span className="font-semibold text-foreground">{myCardCount}</span> cards
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Heart className="w-3.5 h-3.5 text-gold" />
                    <span className="font-semibold text-foreground">{favCount}</span> favorites
                  </div>
                </div>
              )}

              <ActionRow
                icon={Shield}
                label="Privacy Policy"
                href="/privacy"
                iconColor="text-muted-foreground"
              />
              <ActionRow
                icon={Info}
                label="About CardPerks"
                href="/about"
                iconColor="text-muted-foreground"
              />
            </Section>
          </motion.div>

          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.35 }}
          >
            <Section title="Appearance">
              <ToggleRow
                icon={theme === "dark" ? Moon : Sun}
                label="Dark Mode"
                description={theme === "dark" ? "Dark theme is active" : "Light theme is active"}
                checked={theme === "dark"}
                onCheckedChange={(v) => { haptic("light"); playSound("switch"); toggleTheme(); }}
                iconColor={theme === "dark" ? "text-gold" : "text-amber-400"}
              />
              <ToggleRow
                icon={Volume2}
                label="UI Sounds"
                description={soundOn ? "Micro-sounds are enabled" : "Sounds are muted"}
                checked={soundOn}
                onCheckedChange={(v) => {
                  setSoundOn(v);
                  setSoundEnabled(v);
                  if (v) playSound("pop");
                }}
                iconColor="text-gold"
              />
            </Section>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26, duration: 0.35 }}
          >
            <Section title="Notifications">
              <ToggleRow
                icon={Bell}
                label="Rate Alerts"
                description="Notify when voucher rates change"
                checked={notifRates}
                onCheckedChange={setNotifRates}
              />
              <ToggleRow
                icon={Smartphone}
                label="Weekly Digest"
                description="Top deals and new vouchers each week"
                checked={notifWeekly}
                onCheckedChange={setNotifWeekly}
              />
              <ToggleRow
                icon={Bell}
                label="Exclusive Offers"
                description="Limited-time promotions and bonuses"
                checked={notifOffers}
                onCheckedChange={setNotifOffers}
              />
              <ToggleRow
                icon={Mail}
                label="Email Updates"
                description="Occasional product updates via email"
                checked={notifEmail}
                onCheckedChange={setNotifEmail}
              />
            </Section>
          </motion.div>

          {/* Data & Support */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34, duration: 0.35 }}
          >
            <Section title="Data">
              <ActionRow
                icon={Trash2}
                label="Clear Local Data"
                description="Reset favorites, recently viewed, and My Cards"
                onClick={handleClearData}
                iconColor="text-red-400"
                chevron={false}
              />
            </Section>

            <Section title="Support">
              <ActionRow
                icon={Heart}
                label="Support Us"
                description="Help keep CardPerks free and independent"
                href="/support"
                iconColor="text-rose-400"
              />
              <ActionRow
                icon={HelpCircle}
                label="Take the Card Quiz"
                description="Find the best card for your lifestyle"
                href="/quiz"
                iconColor="text-gold"
              />
            </Section>
          </motion.div>

          {/* Sign Out */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.35 }}
          >
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-border/40 text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-red-400/40 hover:bg-red-500/5 transition-all active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>

            <p className="text-center text-[10px] text-muted-foreground/40 mt-6">
              CardPerks v1.0 · Built with ♥ for savvy spenders
            </p>
          </motion.div>

        </div>
      </section>
    </PageLayout>
  );
}
