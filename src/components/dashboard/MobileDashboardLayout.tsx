import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { User, CreditCard, Heart, TrendingUp, Bell, Gift, ChevronRight, LogOut, Settings } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import type { CreditCard as CardType } from "@/data/cards";
import type { Voucher } from "@/data/vouchers";
import type { Guide } from "@/data/guides";
import CardImage from "@/components/CardImage";

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  statCards: Array<{
    label: string;
    value: string;
    icon: React.ElementType;
    sub: string;
    sparkline: Array<{ v: number }>;
    color: string;
    tab: string;
  }>;
  savedCards: CardType[];
  favoriteVoucherList: Voucher[];
  savedGuideList: Guide[];
  unreadNotifCount: number;
  rewardsSummary: Array<{ month: string; earned: number }>;
  activity: Array<{ text: string; time: string; icon: React.ElementType }>;
  handleLogout: () => void;
  NotificationsPanel: React.ComponentType;
  SettingsPanel: React.ComponentType;
  displayName: string;
  userEmail: string;
}

export default function MobileDashboardLayout({
  activeTab, setActiveTab, statCards,
  savedCards, favoriteVoucherList, savedGuideList,
  unreadNotifCount, rewardsSummary, activity,
  handleLogout, NotificationsPanel, SettingsPanel,
  displayName, userEmail,
}: Props) {
  const sections = [
    { id: "cards", label: "My Cards", icon: CreditCard, badge: savedCards.length },
    { id: "favorites", label: "Favorites", icon: Heart, badge: favoriteVoucherList.length + savedGuideList.length },
    { id: "rewards", label: "Rewards", icon: TrendingUp, badge: 0 },
    { id: "activity", label: "Activity", icon: Bell, badge: 0 },
    { id: "notifications", label: "Alerts", icon: Bell, badge: unreadNotifCount },
    { id: "settings", label: "Settings", icon: Settings, badge: 0 },
  ];

  return (
    <div className="sm:hidden">
      {/* Mobile profile header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 glass-card rounded-2xl p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-serif font-bold text-base truncate">{displayName}</h2>
          <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
        </div>
        <span className="text-[9px] font-bold tracking-wider uppercase shimmer-badge px-3 py-1 rounded-full bg-gold/10 flex-shrink-0">
          ✦ Premium
        </span>
        <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0" title="Sign Out">
          <LogOut className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Mobile stat cards — scroll-snap */}
      <div
        className="flex gap-3 overflow-x-auto pb-2 mb-6 scrollbar-hide -mx-4 px-4"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        {statCards.map((s, i) => (
          <motion.button
            key={s.label}
            onClick={() => setActiveTab(s.tab)}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            whileTap={{ scale: 0.97 }}
            className="glass-card rounded-2xl p-5 text-left flex-shrink-0 flex flex-col gap-3 border border-border/30 active:scale-[0.97] transition-transform"
            style={{ width: 272, scrollSnapAlign: "start" }}
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                <s.icon className="w-5 h-5 text-gold" />
              </div>
              <div className="w-20 h-9">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={s.sparkline}>
                    <defs>
                      <linearGradient id={`spark-m-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke={s.color} strokeWidth={1.5} fill={`url(#spark-m-${i})`} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <p className="text-2xl font-serif font-bold leading-none">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              {s.sub && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{s.sub}</p>}
            </div>
            <p className="text-[10px] text-gold/60 font-medium flex items-center gap-1">
              View details <ChevronRight className="w-3 h-3" />
            </p>
          </motion.button>
        ))}
        <div className="flex-shrink-0 w-4" aria-hidden />
      </div>

      {/* Mobile: collapsible accordion sections */}
      <div className="space-y-3">
        {sections.map((section) => {
          const open = activeTab === section.id;
          return (
            <div key={section.id} className="glass-card rounded-2xl overflow-hidden">
              <button
                onClick={() => setActiveTab(open ? "" : section.id)}
                className="w-full flex items-center justify-between px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${open ? "bg-gold/20" : "bg-secondary/50"}`}>
                    <section.icon className={`w-4 h-4 ${open ? "text-gold" : "text-muted-foreground"}`} />
                  </div>
                  <span className={`text-sm font-medium ${open ? "text-gold" : ""}`}>{section.label}</span>
                  {section.badge > 0 && (
                    <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded-full font-semibold">{section.badge}</span>
                  )}
                </div>
                <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-1 border-t border-border/20">
                      {section.id === "cards" && (
                        savedCards.length === 0 ? (
                          <div className="text-center py-8">
                            <CreditCard className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                            <p className="text-sm font-semibold mb-2">No cards added yet</p>
                            <Link to="/cards" className="gold-btn px-5 py-2 rounded-xl text-xs inline-block">Browse Cards</Link>
                          </div>
                        ) : (
                          <div className="space-y-3 mt-3">
                            {savedCards.map((card) => (
                              <Link key={card.id} to={`/cards/${card.id}`} className="glass-card rounded-xl p-3 flex items-center justify-between group hover:border-gold/30 transition-all">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-8 rounded-lg overflow-hidden shadow-md flex-shrink-0">
                                    {card.image ? <img src={card.image} alt={card.name} className="w-full h-full object-contain" /> : <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}88)` }} />}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-xs group-hover:text-gold transition-colors">{card.name}</h3>
                                    <p className="text-[10px] text-muted-foreground">{card.issuer}</p>
                                  </div>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                              </Link>
                            ))}
                            <Link to="/cards" className="block text-center text-xs text-gold mt-2">+ Add more cards</Link>
                          </div>
                        )
                      )}
                      {section.id === "favorites" && (
                        favoriteVoucherList.length === 0 && savedGuideList.length === 0 ? (
                          <div className="text-center py-8">
                            <Heart className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                            <p className="text-sm font-semibold mb-2">No favorites yet</p>
                            <Link to="/vouchers" className="gold-btn px-5 py-2 rounded-xl text-xs inline-block">Browse Vouchers</Link>
                          </div>
                        ) : (
                          <div className="space-y-2 mt-3">
                            {favoriteVoucherList.map((v) => (
                              <Link key={v.id} to={`/vouchers/${v.id}`} className="glass-card rounded-xl p-3 flex items-center justify-between group hover:border-gold/30 transition-all">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${v.color}20` }}><Gift className="w-3.5 h-3.5" style={{ color: v.color }} /></div>
                                  <div><p className="text-xs font-semibold">{v.name}</p><p className="text-[10px] text-muted-foreground">{v.discount}</p></div>
                                </div>
                                <Heart className="w-3.5 h-3.5 text-gold fill-gold" />
                              </Link>
                            ))}
                          </div>
                        )
                      )}
                      {section.id === "rewards" && (
                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground mb-3">Monthly reward points value (₹)</p>
                          <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={rewardsSummary}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-stroke))" />
                              <XAxis dataKey="month" tick={{ fill: "hsl(var(--chart-text))", fontSize: 10 }} axisLine={false} />
                              <YAxis tick={{ fill: "hsl(var(--chart-text))", fontSize: 10 }} axisLine={false} tickFormatter={(v) => `₹${v / 1000}K`} width={36} />
                              <Tooltip contentStyle={{ background: "hsl(var(--tooltip-bg))", border: "1px solid hsl(var(--tooltip-border))", borderRadius: 10, color: "hsl(var(--tooltip-text))", fontSize: 11 }} formatter={(v: number) => [`₹${v.toLocaleString()}`, "Earned"]} />
                              <Bar dataKey="earned" fill="hsl(var(--gold))" radius={[6, 6, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                      {section.id === "activity" && (
                        <div className="space-y-2 mt-3">
                          {activity.map((a, i) => (
                            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border/20 last:border-0">
                              <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0"><a.icon className="w-3.5 h-3.5 text-gold" /></div>
                              <div className="flex-1 min-w-0"><p className="text-xs leading-snug">{a.text}</p><p className="text-[10px] text-muted-foreground mt-0.5">{a.time}</p></div>
                            </div>
                          ))}
                        </div>
                      )}
                      {section.id === "notifications" && <div className="mt-2"><NotificationsPanel /></div>}
                      {section.id === "settings" && <div className="mt-2"><SettingsPanel /></div>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
