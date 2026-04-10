import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { User, CreditCard, Heart, TrendingUp, Bell, Gift, BookOpen, ChevronRight, LogOut, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import type { CreditCard as CardType } from "@/data/cards";
import type { Voucher } from "@/data/vouchers";
import type { Guide } from "@/data/guides";

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
  sidebarItems: Array<{ icon: React.ElementType; label: string; count?: number; tab: string }>;
  handleSidebarClick: (item: { tab: string }) => void;
  handleLogout: () => void;
  NotificationsPanel: React.ComponentType;
  SettingsPanel: React.ComponentType;
  displayName: string;
  userEmail: string;
}

export default function DesktopDashboardLayout({
  activeTab, setActiveTab, statCards,
  savedCards, favoriteVoucherList, savedGuideList,
  unreadNotifCount, rewardsSummary, activity,
  sidebarItems, handleSidebarClick, handleLogout,
  NotificationsPanel, SettingsPanel,
  displayName, userEmail,
}: Props) {
  return (
    <div className="hidden sm:block">
      {/* Desktop: 3-column stat grid */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {statCards.map((s, i) => (
          <motion.button
            key={s.label}
            onClick={() => setActiveTab(s.tab)}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4, boxShadow: "0 8px 30px -8px hsl(var(--gold) / 0.25), 0 0 0 1px hsl(var(--gold) / 0.3)" }}
            whileTap={{ scale: 0.97 }}
            className="glass-card rounded-xl p-5 text-left w-full cursor-pointer transition-colors duration-200 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors duration-200">
                <s.icon className="w-4 h-4 text-gold" />
              </div>
              <div className="w-16 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={s.sparkline}>
                    <defs>
                      <linearGradient id={`spark-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={s.color} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke={s.color} strokeWidth={1.5} fill={`url(#spark-${i})`} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <p className="text-2xl font-serif font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1 group-hover:text-gold transition-colors duration-200">{s.label}</p>
            <p className="text-[10px] text-muted-foreground">{s.sub}</p>
          </motion.button>
        ))}
      </div>

      {/* Desktop: sidebar + tabs */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar — desktop only */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="hidden lg:block lg:col-span-1">
          <div className="glass-card rounded-2xl p-6 mb-6">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center">
                <User className="w-8 h-8 text-gold" />
              </div>
              <motion.div
                className="absolute -inset-1 rounded-full border-2 border-gold/30"
                animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
              />
            </div>
            <h2 className="font-serif text-xl font-bold text-center">{displayName}</h2>
            <p className="text-xs text-muted-foreground text-center mt-1">{userEmail}</p>
            <div className="flex justify-center mt-3">
              <span className="text-[10px] font-bold tracking-wider uppercase shimmer-badge px-4 py-1.5 rounded-full bg-gold/10">
                ✦ Premium Member
              </span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleSidebarClick(item)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-sm ${
                  item.tab === activeTab ? "bg-gold/10 text-gold" : "hover:bg-secondary/30 text-muted-foreground"
                }`}
              >
                <span className="flex items-center gap-2"><item.icon className="w-4 h-4" /> {item.label}</span>
                <span className="flex items-center gap-1">
                  {item.count !== undefined && item.count > 0 && <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded-full">{item.count}</span>}
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                </span>
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-destructive/10 transition-colors text-sm text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </motion.div>

        {/* Main content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-secondary/50 border border-border/50 mb-6">
              <TabsTrigger value="cards" className="data-[state=active]:bg-gold data-[state=active]:text-background text-xs"><CreditCard className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">My </span>Cards</TabsTrigger>
              <TabsTrigger value="favorites" className="data-[state=active]:bg-gold data-[state=active]:text-background text-xs"><Heart className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Favorites</span><span className="sm:hidden">Favs</span></TabsTrigger>
              <TabsTrigger value="rewards" className="data-[state=active]:bg-gold data-[state=active]:text-background text-xs"><TrendingUp className="w-3.5 h-3.5 sm:mr-1" />Rewards</TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-gold data-[state=active]:text-background text-xs"><Bell className="w-3.5 h-3.5 sm:mr-1" />Activity</TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-gold data-[state=active]:text-background text-xs relative">
                <Bell className="w-3.5 h-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Alerts</span>
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-gold text-background text-[8px] font-bold flex items-center justify-center leading-none">{unreadNotifCount}</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-gold data-[state=active]:text-background text-xs"><Settings className="w-3.5 h-3.5 sm:mr-1" /><span className="hidden sm:inline">Settings</span></TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <TabsContent value="cards" forceMount className={activeTab !== "cards" ? "hidden" : ""}>
                  {savedCards.length === 0 ? (
                    <div className="text-center py-16 glass-card rounded-2xl">
                      <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                      <p className="text-lg font-serif font-semibold mb-2">No cards added yet</p>
                      <p className="text-sm text-muted-foreground mb-4">Add cards from the catalog to track them here.</p>
                      <Link to="/cards" className="gold-btn px-6 py-2.5 rounded-xl text-sm inline-block">Browse Cards</Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {savedCards.map((card, i) => (
                        <motion.div key={card.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                          <Link to={`/cards/${card.id}`} className="glass-card rounded-xl p-4 flex items-center justify-between group hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all block">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-10 rounded-lg overflow-hidden shadow-lg shadow-black/30 flex-shrink-0">
                                {card.image ? (
                                  <img src={card.image} alt={`${card.name} credit card`} className="w-full h-full object-contain" />
                                ) : (
                                  <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}88)` }} />
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold text-sm group-hover:text-gold transition-colors">{card.name}</h3>
                                <p className="text-xs text-muted-foreground">{card.network} · {card.issuer}</p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors" />
                          </Link>
                        </motion.div>
                      ))}
                      <Link to="/cards" className="block text-center text-sm text-gold hover:text-gold-light transition-colors mt-4">+ Add more cards</Link>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="favorites" forceMount className={activeTab !== "favorites" ? "hidden" : ""}>
                  {favoriteVoucherList.length === 0 && savedGuideList.length === 0 ? (
                    <div className="text-center py-16 glass-card rounded-2xl">
                      <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                      <p className="text-lg font-serif font-semibold mb-2">No favorites yet</p>
                      <p className="text-sm text-muted-foreground mb-4">Heart vouchers and guides to save them here.</p>
                      <Link to="/vouchers" className="gold-btn px-6 py-2.5 rounded-xl text-sm inline-block">Browse Vouchers</Link>
                    </div>
                  ) : (
                    <>
                      {favoriteVoucherList.length > 0 && (
                        <div className="grid sm:grid-cols-2 gap-4 mb-6">
                          {favoriteVoucherList.map((v, i) => (
                            <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                              <Link to={`/vouchers/${v.id}`} className="glass-card rounded-xl p-4 flex items-center justify-between group hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all block">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${v.color}20` }}>
                                    <Gift className="w-4 h-4" style={{ color: v.color }} />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-sm group-hover:text-gold transition-colors">{v.name}</h3>
                                    <p className="text-xs text-muted-foreground">{v.discount}</p>
                                  </div>
                                </div>
                                <Heart className="w-4 h-4 text-gold fill-gold" />
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      )}
                      {savedGuideList.length > 0 && (
                        <>
                          <h3 className="font-semibold text-sm mb-3 mt-8">Saved Guides</h3>
                          <div className="space-y-3">
                            {savedGuideList.map((g) => (
                              <Link key={g.slug} to={`/guides/${g.slug}`} className="glass-card rounded-xl p-4 flex items-center justify-between group hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all block">
                                <div>
                                  <h4 className="text-sm font-medium group-hover:text-gold transition-colors">{g.title}</h4>
                                  <p className="text-xs text-muted-foreground">{g.readTime} read</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              </Link>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="rewards" forceMount className={activeTab !== "rewards" ? "hidden" : ""}>
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">
                    <h3 className="font-serif text-lg font-semibold mb-1">Rewards Earned</h3>
                    <p className="text-xs text-muted-foreground mb-6">Monthly reward points value (₹)</p>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={rewardsSummary}>
                        <defs>
                          <linearGradient id="barGold" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--gold-light))" stopOpacity={1} />
                            <stop offset="100%" stopColor="hsl(var(--gold-dark))" stopOpacity={0.8} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-stroke))" />
                        <XAxis dataKey="month" tick={{ fill: "hsl(var(--chart-text))", fontSize: 12 }} axisLine={false} />
                        <YAxis tick={{ fill: "hsl(var(--chart-text))", fontSize: 12 }} axisLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
                        <Tooltip contentStyle={{ background: "hsl(var(--tooltip-bg))", border: "1px solid hsl(var(--tooltip-border))", borderRadius: 12, color: "hsl(var(--tooltip-text))", fontSize: 12 }} formatter={(v: number) => [`₹${v.toLocaleString()}`, "Earned"]} />
                        <Bar dataKey="earned" fill="hsl(var(--gold))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                </TabsContent>

                <TabsContent value="activity" forceMount className={activeTab !== "activity" ? "hidden" : ""}>
                  <div className="space-y-3">
                    {activity.map((a, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0"><a.icon className="w-4 h-4 text-gold" /></div>
                          <div><p className="text-sm">{a.text}</p><p className="text-xs text-muted-foreground">{a.time}</p></div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="notifications" forceMount className={activeTab !== "notifications" ? "hidden" : ""}>
                  <NotificationsPanel />
                </TabsContent>

                <TabsContent value="settings" forceMount className={activeTab !== "settings" ? "hidden" : ""}>
                  <SettingsPanel />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
