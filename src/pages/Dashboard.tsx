import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, CreditCard, Heart, TrendingUp, Star, Settings, LogOut, Bell, Gift, BookOpen, ChevronRight, IndianRupee, Sun, Moon, Download, Trash2, Mail, Shield, TrendingDown, Tag, Clock, ArrowRight } from "lucide-react";
import MobileDashboardLayout from "@/components/dashboard/MobileDashboardLayout";
import DesktopDashboardLayout from "@/components/dashboard/DesktopDashboardLayout";
import SEO from "@/components/SEO";
import { useMinLoading } from "@/hooks/use-min-loading";
import { DashboardSkeleton } from "@/components/PageSkeletons";
import { Link, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import PageLayout from "@/components/PageLayout";
import CardImage from "@/components/CardImage";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { cards as allCards } from "@/data/cards";
import { useMyCards } from "@/hooks/use-my-cards";
import { useFavorites } from "@/hooks/use-favorites";
import { vouchers } from "@/data/vouchers";
import { guides } from "@/data/guides";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { useAuth } from "@/contexts/AuthContext";
import { useExpenses } from "@/hooks/use-expenses";
import { getMasterCard } from "@/data/card-v3-master";

const rewardsSummary = [
  { month: "Sep", earned: 2400 },
  { month: "Oct", earned: 1800 },
  { month: "Nov", earned: 3200 },
  { month: "Dec", earned: 4500 },
  { month: "Jan", earned: 2800 },
  { month: "Feb", earned: 3100 },
];

const sparklineRewards = [
  { v: 12 }, { v: 18 }, { v: 15 }, { v: 22 }, { v: 19 }, { v: 25 },
];
const sparklineCards = [
  { v: 1 }, { v: 1 }, { v: 2 }, { v: 2 }, { v: 3 }, { v: 3 },
];
const sparklineVouchers = [
  { v: 2 }, { v: 4 }, { v: 6 }, { v: 10 }, { v: 18 }, { v: 24 },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Notifications data ───────────────────────────────────────────────────────
interface AppNotification {
  id: number;
  icon: typeof Bell;
  iconColor: string;
  title: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  { id: 1, icon: TrendingUp,  iconColor: "hsl(var(--gold))",       title: "HDFC Infinia voucher rate increased to 3.5%",      time: "2 hours ago",  read: false },
  { id: 2, icon: BookOpen,    iconColor: "hsl(var(--gold-light))",  title: "New guide published: Airport Lounge Access Guide", time: "1 day ago",    read: false },
  { id: 3, icon: Tag,         iconColor: "hsl(var(--gold))",        title: "Your Axis Magnus card reward rate updated",        time: "3 days ago",   read: true  },
];

function NotificationsPanel() {
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: number) =>
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Header row */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-gold" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold leading-tight">Notifications</h3>
              <p className="text-xs text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-gold hover:text-gold-light border border-gold/30 hover:border-gold/60 hover:bg-gold/5 px-3 py-1.5 rounded-lg transition-all"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-2">
          {notifications.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => markRead(n.id)}
              className={`relative flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 group ${
                n.read
                  ? "bg-secondary/20 hover:bg-secondary/30"
                  : "bg-gold/5 border border-gold/15 hover:border-gold/30 hover:bg-gold/8"
              }`}
            >
              {/* Unread dot */}
              {!n.read && (
                <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-gold shadow-sm shadow-gold/50 flex-shrink-0" />
              )}

              {/* Icon */}
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                  n.read ? "bg-secondary/50" : "bg-gold/15"
                }`}
              >
                <n.icon
                  className="w-4 h-4"
                  style={{ color: n.read ? "hsl(var(--muted-foreground))" : n.iconColor }}
                />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 pr-4">
                <p className={`text-sm leading-snug ${n.read ? "text-muted-foreground" : "text-foreground font-medium"}`}>
                  {n.title}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {unreadCount === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center pt-3 pb-1"
          >
            <p className="text-xs text-muted-foreground">You're all caught up 🎉</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function SettingsPanel({ defaultName, defaultEmail }: { defaultName: string; defaultEmail: string }) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [currency] = useState("INR");
  const [rateAlerts, setRateAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  const handleThemeToggle = (dark: boolean) => {
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  };

  return (
    <div className="space-y-6">
      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
            <User className="w-4 h-4 text-gold" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold">Profile</h3>
            <p className="text-xs text-muted-foreground">Manage your personal information</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center">
              <User className="w-8 h-8 text-gold" />
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gold text-background flex items-center justify-center text-xs font-bold shadow-lg shadow-gold/20 hover:scale-110 transition-transform">
              ✎
            </button>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Upload a photo to personalize your profile.</p>
            <p className="text-[10px] mt-1">JPG, PNG · Max 2 MB</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 block">Full Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} className="bg-secondary/30 border-border/20 text-sm h-11" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 block">Email Address</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} className="bg-secondary/30 border-border/20 text-sm h-11" />
          </div>
        </div>
        <div className="flex justify-end mt-5">
          <button className="gold-btn px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-gold/10">Save Changes</button>
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
            <Sun className="w-4 h-4 text-gold" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold">Preferences</h3>
            <p className="text-xs text-muted-foreground">Customize your experience</p>
          </div>
        </div>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium flex items-center gap-2">
                {isDark ? <Moon className="w-4 h-4 text-gold" /> : <Sun className="w-4 h-4 text-gold" />}
                Theme
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Currently using {isDark ? "dark" : "light"} mode</p>
            </div>
            <Switch checked={isDark} onCheckedChange={handleThemeToggle} />
          </div>
          <div className="h-px bg-border/20" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-gold" />
                Currency
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">All amounts displayed in {currency}</p>
            </div>
            <span className="text-sm font-medium bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/20">₹ INR</span>
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
            <Bell className="w-4 h-4 text-gold" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold">Notifications</h3>
            <p className="text-xs text-muted-foreground">Choose what updates you receive</p>
          </div>
        </div>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold" />
                Rate Alerts
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Get notified when voucher rates change</p>
            </div>
            <Switch checked={rateAlerts} onCheckedChange={setRateAlerts} />
          </div>
          <div className="h-px bg-border/20" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gold" />
                Weekly Digest
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Weekly summary of top deals and new guides</p>
            </div>
            <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
          </div>
        </div>
      </motion.div>

      {/* Privacy */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-gold" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold">Privacy</h3>
            <p className="text-xs text-muted-foreground">Manage your data and account</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-xl border border-border/10">
            <div>
              <p className="text-sm font-medium flex items-center gap-2">
                <Download className="w-4 h-4 text-gold" />
                Export Your Data
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Download all your saved cards, favorites, and expenses</p>
            </div>
            <button className="px-4 py-2 rounded-xl text-sm font-medium border border-gold/30 text-gold hover:bg-gold/10 transition-colors">
              Export
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-xl border border-destructive/10">
            <div>
              <p className="text-sm font-medium flex items-center gap-2 text-destructive">
                <Trash2 className="w-4 h-4" />
                Delete Account
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Permanently remove your account and all data</p>
            </div>
            <button className="px-4 py-2 rounded-xl text-sm font-medium border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Dashboard() {
  const loading = useMinLoading(0);
  const [activeTab, setActiveTab] = useState("cards");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { has: isMyCard, count: myCardCount } = useMyCards();
  const { isFav: isVoucherFav } = useFavorites("voucher");
  const { isFav: isGuideFav } = useFavorites("guide");
  const { items: recentItems } = useRecentlyViewed();
  const { user, profile, signOut } = useAuth();
  const { expenses } = useExpenses();

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";
  const firstName = displayName.split(" ")[0];
  const lastName = displayName.split(" ").slice(1).join(" ");

  const savedCards = allCards.filter((c) => isMyCard(c.id));
  const favoriteVoucherList = vouchers.filter((v) => isVoucherFav(v.id));
  const savedGuideList = guides.filter((g) => isGuideFav(g.slug));

  const totalRewards = expenses.reduce((sum, e) => {
    const v3 = getMasterCard(e.cardId)?.enrichment;
    const rate = v3?.baseRate || 1;
    return sum + Math.round(e.amount * rate / 100);
  }, 0);

  const unreadNotifCount = INITIAL_NOTIFICATIONS.filter((n) => !n.read).length;

  const sidebarItems = [
    { icon: CreditCard, label: "My Cards", count: savedCards.length, tab: "cards" },
    { icon: Heart, label: "Favorites", count: favoriteVoucherList.length + savedGuideList.length, tab: "favorites" },
    { icon: BookOpen, label: "Saved Guides", count: savedGuideList.length, tab: "favorites" },
    { icon: Bell, label: "Notifications", count: unreadNotifCount, tab: "notifications" },
    { icon: Settings, label: "Settings", tab: "settings" },
  ];

  const handleSidebarClick = (item: typeof sidebarItems[0]) => {
    if (item.tab) {
      setActiveTab(item.tab);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Signed out", description: "You've been signed out successfully." });
    navigate("/");
  };

  const activity = [
    { text: "Welcome to CardPerks!", time: "Just now", icon: Star },
    { text: `${savedCards.length} cards in your wallet`, time: "Current", icon: CreditCard },
    { text: `${favoriteVoucherList.length} vouchers saved`, time: "Current", icon: Gift },
    { text: `${expenses.length} expenses tracked`, time: "Current", icon: TrendingUp },
    { text: "Explore guides to maximize rewards", time: "Tip", icon: BookOpen },
  ];

  const statCards = [
    { label: "Total Rewards", value: `₹${totalRewards.toLocaleString("en-IN")}`, icon: IndianRupee, sub: "Lifetime earned", sparkline: sparklineRewards, color: "hsl(var(--gold))",       tab: "rewards"   },
    { label: "Active Cards",  value: String(savedCards.length),           icon: CreditCard,   sub: "Cards tracked",   sparkline: sparklineCards,   color: "hsl(var(--gold-light))", tab: "cards"     },
    { label: "Vouchers Saved", value: String(favoriteVoucherList.length), icon: Gift,         sub: "Favorited",       sparkline: sparklineVouchers, color: "hsl(var(--gold))",       tab: "favorites" },
  ];

  return (
    <PageLayout>
      <SEO title="Dashboard" description="Your personal CardPerks dashboard. Track rewards, manage cards, and view activity." path="/dashboard" />
      {/* Gradient hero header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/8 via-transparent to-gold/3" />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[150px]"
          style={{ background: "hsl(var(--gold) / 0.06)" }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ repeat: Infinity, duration: 6 }}
        />
        <div className="container mx-auto px-4 py-6 sm:py-10 relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <Link to="/" className="hover:text-gold transition-colors">Home</Link>
            <span>›</span>
            <span className="text-foreground">Dashboard</span>
          </nav>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm text-muted-foreground mb-1">{getGreeting()},</p>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-1">
              {firstName} <span className="gold-gradient">{lastName || ""}</span>
            </h1>
            <p className="text-sm text-muted-foreground">Track your cards, vouchers, and rewards in one place.</p>
          </motion.div>
        </div>
      </section>

      <section className="pb-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="pt-4">
              <DashboardSkeleton />
            </div>
          ) : (
          <div>
          {/* Recently Viewed */}
          {recentItems.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-3.5 h-3.5 text-gold" />
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Recently Viewed</p>
              </div>
              {/* Mobile: circular avatars */}
              <div className="sm:hidden flex gap-4 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
                {recentItems.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07, type: "spring", stiffness: 260, damping: 20 }} className="flex-shrink-0 flex flex-col items-center gap-1.5">
                    <Link to={item.href} className="group flex flex-col items-center gap-1.5">
                      <div className="p-[2.5px] rounded-full" style={{ background: `linear-gradient(135deg, ${item.color}, hsl(var(--gold)))` }}>
                        <div className="p-[2px] rounded-full bg-background">
                          <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center transition-transform duration-200 active:scale-90" style={{ background: `linear-gradient(135deg, ${item.color}22, ${item.color}0a)` }}>
                            {item.image ? <CardImage src={item.image} alt={item.name} fallbackColor={item.color} className="w-full h-full object-cover p-1.5" /> : <Gift className="w-6 h-6" style={{ color: item.color }} />}
                          </div>
                        </div>
                      </div>
                      <p className="text-[10px] font-medium text-center text-foreground/80 w-16 leading-tight line-clamp-2">{item.name}</p>
                    </Link>
                  </motion.div>
                ))}
              </div>
              {/* Desktop: card tiles */}
              <div className="hidden sm:flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                {recentItems.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="flex-shrink-0 w-40">
                    <Link to={item.href} className="group flex flex-col glass-card rounded-xl overflow-hidden border border-border/30 hover:border-gold/35 transition-all duration-200 hover:shadow-[0_4px_20px_-4px_hsl(var(--gold)/0.2)]">
                      <div className="w-full h-20 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${item.color}18, ${item.color}08)` }}>
                        {item.image ? <CardImage src={item.image} alt={item.name} fallbackColor={item.color} className="p-2" /> : <div className="w-full h-full flex items-center justify-center"><Gift className="w-7 h-7" style={{ color: item.color }} /></div>}
                        <span className="absolute top-1.5 left-1.5 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-black/40 text-white/80 backdrop-blur-sm">{item.type}</span>
                      </div>
                      <div className="px-2.5 py-2">
                        <p className="text-[11px] font-semibold leading-tight line-clamp-1 mb-1.5">{item.name}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] text-gold font-medium">View again <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" /></span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Mobile layout */}
          <MobileDashboardLayout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            statCards={statCards}
            savedCards={savedCards}
            favoriteVoucherList={favoriteVoucherList}
            savedGuideList={savedGuideList}
            unreadNotifCount={unreadNotifCount}
            rewardsSummary={rewardsSummary}
            activity={activity}
            handleLogout={handleLogout}
            NotificationsPanel={NotificationsPanel}
            SettingsPanel={() => <SettingsPanel defaultName={displayName} defaultEmail={user?.email || ""} />}
            displayName={displayName}
            userEmail={user?.email || ""}
          />

          {/* Desktop layout */}
          <DesktopDashboardLayout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            statCards={statCards}
            savedCards={savedCards}
            favoriteVoucherList={favoriteVoucherList}
            savedGuideList={savedGuideList}
            unreadNotifCount={unreadNotifCount}
            rewardsSummary={rewardsSummary}
            activity={activity}
            sidebarItems={sidebarItems}
            handleSidebarClick={handleSidebarClick}
            handleLogout={handleLogout}
            NotificationsPanel={NotificationsPanel}
            SettingsPanel={() => <SettingsPanel defaultName={displayName} defaultEmail={user?.email || ""} />}
            displayName={displayName}
            userEmail={user?.email || ""}
          />
          </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}