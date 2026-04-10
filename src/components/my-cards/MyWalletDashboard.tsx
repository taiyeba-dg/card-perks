import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, AreaChart, Area, CartesianGrid,
} from "recharts";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import AddCardsDialogContent from "@/components/my-cards/AddCardsDialog";
import { useMyCards } from "@/hooks/use-my-cards";
import { useExpenses, type Expense } from "@/hooks/use-expenses";
import type { CardV3Data } from "@/data/card-v3-types";
// CreditCard type used implicitly via useMyCards().myCardObjects[].card

/* ─── colour tokens ─── */
const C = {
  bg: "#0e0e14",
  card: "#16161f",
  card2: "#1c1c28",
  border: "#2a2a3a",
  border2: "#3a3a50",
  text: "#e8e8f0",
  dim: "#8888a0",
  dim2: "#5c5c74",
  gold: "#c9a84c",
  goldDim: "#a08838",
  goldBg: "rgba(201,168,76,0.08)",
  green: "#34d399",
  red: "#f87171",
  blue: "#60a5fa",
  purple: "#a78bfa",
};

/* ─── bank themes ─── */
const BANK_THEME: Record<string, { g1: string; g2: string; accent: string; textC: string }> = {
  "American Express": { g1: "#2a1f0a", g2: "#1a1508", accent: "#d4af37", textC: "#f5e6b8" },
  "HDFC Bank":        { g1: "#0a1628", g2: "#060e1a", accent: "#2563eb", textC: "#93c5fd" },
  "ICICI Bank":       { g1: "#280a0e", g2: "#1a0608", accent: "#dc2626", textC: "#fca5a5" },
  "Axis Bank":        { g1: "#280a1e", g2: "#1a0614", accent: "#97144d", textC: "#f9a8d4" },
  "SBI":              { g1: "#0a1428", g2: "#060c1a", accent: "#0033a0", textC: "#93b4fd" },
  "State Bank of India": { g1: "#0a1428", g2: "#060c1a", accent: "#0033a0", textC: "#93b4fd" },
  "Kotak Mahindra Bank": { g1: "#280a0a", g2: "#1a0606", accent: "#ed1c24", textC: "#fca5a5" },
  "IDFC First Bank":  { g1: "#0a2818", g2: "#061a10", accent: "#059669", textC: "#6ee7b7" },
  "IndusInd Bank":    { g1: "#1a0a28", g2: "#100618", accent: "#7c3aed", textC: "#c4b5fd" },
  "AU Small Finance Bank": { g1: "#281e0a", g2: "#1a1406", accent: "#e69500", textC: "#fcd49a" },
  "Bank of Baroda":   { g1: "#1a0a08", g2: "#120604", accent: "#e64a19", textC: "#ffab91" },
  "RBL Bank":         { g1: "#1a0a20", g2: "#100614", accent: "#8e24aa", textC: "#ce93d8" },
  "HSBC":             { g1: "#0a1a18", g2: "#061210", accent: "#db0011", textC: "#ef9a9a" },
  "Standard Chartered": { g1: "#0a1a16", g2: "#06120e", accent: "#0072aa", textC: "#81d4fa" },
  "Yes Bank":         { g1: "#0a1428", g2: "#060c1a", accent: "#004b93", textC: "#90caf9" },
  "Federal Bank":     { g1: "#14140a", g2: "#0c0c06", accent: "#fdd835", textC: "#fff9c4" },
  "OneCard":          { g1: "#14141a", g2: "#0c0c12", accent: "#1de9b6", textC: "#b2dfdb" },
};
const getTheme = (bank: string) =>
  BANK_THEME[bank] || { g1: "#1a1a26", g2: "#12121a", accent: "#c9a84c", textC: "#e8d5a0" };

/* ─── categories ─── */
const CATS = [
  { id: "food",          label: "Dining",    icon: "\u{1F37D}\uFE0F", c: "#fb923c" },
  { id: "groceries",     label: "Groceries", icon: "\u{1F6D2}",       c: "#34d399" },
  { id: "fuel",          label: "Fuel",      icon: "\u26FD",          c: "#60a5fa" },
  { id: "travel",        label: "Travel",    icon: "\u2708\uFE0F",    c: "#a78bfa" },
  { id: "shopping",      label: "Shopping",  icon: "\u{1F6CD}\uFE0F", c: "#f472b6" },
  { id: "health",        label: "Health",    icon: "\u{1F48A}",       c: "#2dd4bf" },
  { id: "entertainment", label: "Fun",       icon: "\u{1F3AC}",       c: "#fb7185" },
  { id: "bills",         label: "Bills",     icon: "\u{1F4F1}",       c: "#22d3ee" },
  { id: "others",        label: "Other",     icon: "\u2726",          c: "#94a3b8" },
];

/* ─── category → V3 key mapping ─── */
const CAT_TO_V3: Record<string, string> = {
  shopping: "online", food: "dining", travel: "travel", fuel: "fuel",
  electronics: "online", entertainment: "entertainment", bills: "utilities",
  groceries: "grocery", health: "base", others: "base",
};

/* ─── helpers ─── */
function getRate(v3: CardV3Data | null, expCat: string): number {
  if (!v3) return 0;
  const v3Key = CAT_TO_V3[expCat] || "base";
  const cat = v3.categories[v3Key];
  return cat ? cat.rate : v3.baseRate;
}

function parseFee(fee: string): number {
  return parseInt(fee.replace(/[₹,]/g, "")) || 0;
}

function fmt(n: number): string {
  return n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${Math.round(n)}`;
}

/* ─── AnimNum: animated counter ─── */
function AnimNum({ to, prefix = "", suffix = "", dur = 700 }: {
  to: number; prefix?: string; suffix?: string; dur?: number;
}) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      setV(Math.round(to * p));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [to, dur]);
  return <span>{prefix}{v.toLocaleString("en-IN")}{suffix}</span>;
}

/* ─── Credit Card Visual ─── */
function CreditCardVisual({ name, bank, rate, accent, g1, g2, textC, mini }: {
  name: string; bank: string; rate: number;
  accent: string; g1: string; g2: string; textC: string; mini?: boolean;
}) {
  const h = mini ? 90 : 130;
  const w = mini ? 152 : 220;
  return (
    <div style={{
      width: w, minWidth: w, height: h, borderRadius: 14,
      background: `linear-gradient(135deg, ${g1}, ${g2})`,
      border: `1px solid ${accent}33`,
      position: "relative", overflow: "hidden", padding: mini ? 10 : 16,
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      boxShadow: `0 4px 24px ${accent}22`,
    }}>
      {/* decorative circles */}
      <div style={{
        position: "absolute", right: -20, top: -20,
        width: mini ? 60 : 80, height: mini ? 60 : 80,
        borderRadius: "50%", background: `${accent}15`,
      }} />
      <div style={{
        position: "absolute", right: 20, bottom: -30,
        width: mini ? 50 : 70, height: mini ? 50 : 70,
        borderRadius: "50%", background: `${accent}10`,
      }} />
      {/* chip + contactless */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative", zIndex: 1 }}>
        <div style={{
          width: mini ? 22 : 30, height: mini ? 16 : 22,
          borderRadius: 4, background: `linear-gradient(135deg,#d4af37,#b8962e)`,
          border: "1px solid #8a6d1b",
        }} />
        <svg width={mini ? 12 : 16} height={mini ? 12 : 16} viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
          <path d="M8.5 16.5a5 5 0 0 1 0-9" /><path d="M5 19a9 9 0 0 1 0-14" /><path d="M12 14a1.5 1.5 0 0 1 0-4" />
        </svg>
      </div>
      {/* card name */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{
          color: textC, fontWeight: 700, fontSize: mini ? 10 : 13,
          letterSpacing: 0.3, lineHeight: 1.2,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          maxWidth: w - (mini ? 24 : 36),
        }}>{name}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
          <span style={{ color: `${textC}88`, fontSize: mini ? 8 : 10 }}>{bank}</span>
          <span style={{
            color: accent, fontSize: mini ? 8 : 10, fontWeight: 600,
            background: `${accent}18`, padding: "1px 5px", borderRadius: 6,
          }}>{rate.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Recharts custom tooltip ─── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8,
      padding: "8px 12px", fontSize: 12,
    }}>
      <div style={{ color: C.dim, marginBottom: 4 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color || C.text }}>
          {p.name}: {typeof p.value === "number" ? `₹${p.value.toLocaleString("en-IN")}` : p.value}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
export default function MyWalletDashboard() {
  /* ─── hooks ─── */
  const { myCardObjects, toggle, has, count } = useMyCards();
  const { expenses, addExpense, deleteExpense } = useExpenses();

  /* ─── responsive ─── */
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 900 : false);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  /* ─── derive cards list with theme info ─── */
  const walletCards = useMemo(() => myCardObjects.map((entry) => {
    const th = getTheme(entry.card.issuer);
    const baseRate = entry.v3 ? entry.v3.baseRate : 0;
    return {
      id: entry.cardId,
      name: entry.card.name,
      bank: entry.card.issuer,
      fee: parseFee(entry.card.fee),
      tier: entry.card.type,
      baseRate,
      v3: entry.v3,
      card: entry.card,
      ...th,
    };
  }), [myCardObjects]);

  /* ─── expense form state ─── */
  const [selCard, setSelCard] = useState<string | null>(null);
  const [amt, setAmt] = useState("");
  const [cat, setCat] = useState("food");
  const [note, setNote] = useState("");
  const [expDate, setExpDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [flash, setFlash] = useState<{ reward: number; missed: number } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [trendMode, setTrendMode] = useState<"spend" | "reward">("spend");
  const [addCardOpen, setAddCardOpen] = useState(false);

  /* auto-select first card */
  useEffect(() => {
    if (!selCard && walletCards.length > 0) setSelCard(walletCards[0].id);
  }, [walletCards, selCard]);

  /* ─── enrich expenses with reward calculation ─── */
  const enriched = useMemo(() => expenses.map((e) => {
    const wc = walletCards.find((c) => c.id === e.cardId);
    const rate = wc ? getRate(wc.v3, e.category) : 0;
    const rewardEarned = Math.round(e.amount * rate) / 100;
    return { ...e, rewardEarned, cardName: wc?.name || "Unknown", bank: wc?.bank || "" };
  }), [expenses, walletCards]);

  /* ─── aggregates ─── */
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthExpenses = useMemo(() =>
    enriched.filter((e) => e.date.startsWith(thisMonth)),
    [enriched, thisMonth]
  );
  const totalSpend = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const totalRewards = monthExpenses.reduce((s, e) => s + e.rewardEarned, 0);
  const totalFees = walletCards.reduce((s, c) => s + c.fee, 0);
  const avgRewardRate = totalSpend > 0 ? (totalRewards / totalSpend) * 100 : 0;

  /* ─── best card per category ─── */
  const getBest = useCallback((catId: string) => {
    if (walletCards.length === 0) return null;
    let best = walletCards[0];
    let bestRate = getRate(best.v3, catId);
    walletCards.forEach((c) => {
      const r = getRate(c.v3, catId);
      if (r > bestRate) { best = c; bestRate = r; }
    });
    return { name: best.name, rate: bestRate, accent: best.accent };
  }, [walletCards]);

  /* ─── chart data: rewards by card ─── */
  const barData = useMemo(() => {
    const map: Record<string, { name: string; rewards: number; accent: string }> = {};
    monthExpenses.forEach((e) => {
      const wc = walletCards.find((c) => c.id === e.cardId);
      if (!wc) return;
      if (!map[e.cardId]) map[e.cardId] = { name: wc.name.split(" ").slice(0, 2).join(" "), rewards: 0, accent: wc.accent };
      map[e.cardId].rewards += e.rewardEarned;
    });
    return Object.values(map);
  }, [monthExpenses, walletCards]);

  /* ─── chart data: category breakdown ─── */
  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    monthExpenses.forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return CATS.filter((c) => map[c.id]).map((c) => ({
      name: c.label, value: map[c.id], color: c.c,
    }));
  }, [monthExpenses]);

  /* ─── chart data: daily trend ─── */
  const trendData = useMemo(() => {
    const map: Record<string, { date: string; spend: number; reward: number }> = {};
    monthExpenses.forEach((e) => {
      const d = e.date.slice(8, 10);
      if (!map[d]) map[d] = { date: d, spend: 0, reward: 0 };
      map[d].spend += e.amount;
      map[d].reward += e.rewardEarned;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [monthExpenses]);

  /* ─── group expenses by date ─── */
  const grouped = useMemo(() => {
    const g: Record<string, typeof enriched> = {};
    enriched.forEach((e) => {
      if (!g[e.date]) g[e.date] = [];
      g[e.date].push(e);
    });
    return Object.entries(g).sort((a, b) => b[0].localeCompare(a[0]));
  }, [enriched]);

  /* ─── reward efficiency score ─── */
  const efficiency = useMemo(() => {
    if (walletCards.length === 0 || totalSpend === 0) return 0;
    // Best possible reward if always using best card per category
    let bestPossible = 0;
    monthExpenses.forEach((e) => {
      const best = getBest(e.category);
      bestPossible += best ? (e.amount * best.rate / 100) : 0;
    });
    return bestPossible > 0 ? Math.min(Math.round((totalRewards / bestPossible) * 100), 100) : 0;
  }, [walletCards, totalSpend, totalRewards, monthExpenses, getBest]);

  /* ─── smart insights ─── */
  const insights = useMemo(() => {
    const out: { text: string; color: string }[] = [];
    // Top spending category
    const catTotals: Record<string, number> = {};
    monthExpenses.forEach((e) => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });
    const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      const topCat = CATS.find((c) => c.id === sorted[0][0]);
      if (topCat) out.push({ text: `${topCat.icon} ${topCat.label} is your top spend category at ${fmt(sorted[0][1])} this month`, color: topCat.c });
    }
    // Best card suggestion
    if (walletCards.length >= 2 && sorted.length > 0) {
      const best = getBest(sorted[0][0]);
      if (best) out.push({ text: `Use ${best.name} for ${sorted[0][0]} to earn ${best.rate.toFixed(1)}% back`, color: best.accent });
    }
    // Fee vs rewards
    if (totalFees > 0 && totalRewards * 12 > totalFees) {
      out.push({ text: `Your annual rewards (est. ₹${Math.round(totalRewards * 12).toLocaleString("en-IN")}) exceed card fees (₹${totalFees.toLocaleString("en-IN")})`, color: C.green });
    } else if (totalFees > 0) {
      out.push({ text: `Annual fees ₹${totalFees.toLocaleString("en-IN")} exceed projected rewards — consider fee-free cards`, color: C.red });
    }
    if (out.length === 0) out.push({ text: "Track more expenses to unlock personalized insights", color: C.gold });
    return out.slice(0, 3);
  }, [monthExpenses, walletCards, totalFees, totalRewards, getBest]);

  /* ─── submit expense ─── */
  const handleSubmit = () => {
    if (!selCard || !amt || parseFloat(amt) <= 0) return;
    const catObj = CATS.find((c) => c.id === cat);
    addExpense({
      cardId: selCard,
      date: expDate,
      merchant: note || (catObj?.label ?? cat),
      amount: parseFloat(amt),
      category: cat,
      note,
    });
    // calculate reward flash
    const wc = walletCards.find((c) => c.id === selCard);
    const rate = wc ? getRate(wc.v3, cat) : 0;
    const reward = Math.round(parseFloat(amt) * rate) / 100;
    // find best card for missed reward hint
    const best = getBest(cat);
    const bestReward = best ? Math.round(parseFloat(amt) * best.rate) / 100 : 0;
    const missed = bestReward > reward ? bestReward - reward : 0;
    setFlash({ reward, missed });
    setTimeout(() => setFlash(null), 3500);
    setAmt("");
    setNote("");
    if (isMobile) setShowForm(false);
  };

  /* ─── find best card for current form category ─── */
  const bestForCat = useMemo(() => {
    if (walletCards.length === 0) return null;
    return getBest(cat);
  }, [cat, walletCards, getBest]);

  const bestCardId = useMemo(() => {
    if (walletCards.length === 0) return null;
    let best = walletCards[0];
    let bestRate = getRate(best.v3, cat);
    walletCards.forEach((c) => {
      const r = getRate(c.v3, cat);
      if (r > bestRate) { best = c; bestRate = r; }
    });
    return best.id;
  }, [cat, walletCards]);

  /* preview reward for form */
  const previewReward = useMemo(() => {
    if (!selCard || !amt) return 0;
    const wc = walletCards.find((c) => c.id === selCard);
    const rate = wc ? getRate(wc.v3, cat) : 0;
    return Math.round(parseFloat(amt || "0") * rate) / 100;
  }, [selCard, amt, cat, walletCards]);

  /* ─── EMPTY STATE ─── */
  if (walletCards.length === 0) {
    return (
      <div style={{
        minHeight: "100vh", background: C.bg, display: "flex",
        alignItems: "center", justifyContent: "center", padding: 24,
      }}>
        <div style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 20,
          padding: 48, textAlign: "center", maxWidth: 420,
          animation: "fadeSlideUp .5s ease-out",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💳</div>
          <h2 style={{ color: C.text, fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            Your Wallet is Empty
          </h2>
          <p style={{ color: C.dim, fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            Add your credit cards to start tracking expenses, earning rewards, and getting smart insights.
          </p>
          <Dialog open={addCardOpen} onOpenChange={setAddCardOpen}>
            <DialogTrigger asChild>
              <button style={{
                background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
                color: "#1a1a26", border: "none", borderRadius: 12,
                padding: "12px 32px", fontSize: 15, fontWeight: 700,
                cursor: "pointer", letterSpacing: 0.3,
              }}>
                + Add Your First Card
              </button>
            </DialogTrigger>
            <AddCardsDialogContent isMyCard={has} toggleMyCard={toggle} />
          </Dialog>
        </div>
        <style>{kfStyles}</style>
      </div>
    );
  }

  /* ─── SIDEBAR (DESKTOP) ─── */
  const sidebar = (
    <div style={{
      width: 260, minWidth: 260, background: C.card,
      borderRight: `1px solid ${C.border}`, padding: 20,
      display: "flex", flexDirection: "column", gap: 16,
      overflowY: "auto", height: "100vh", position: "sticky", top: 0,
    }}>
      {/* heading */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 20 }}>💰</span>
        <span style={{ color: C.gold, fontSize: 18, fontWeight: 700, letterSpacing: 0.5 }}>My Wallet</span>
      </div>
      {/* mini stats */}
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { label: "Cards", val: walletCards.length },
          { label: "Spend", val: fmt(totalSpend) },
          { label: "Reward", val: `₹${Math.round(totalRewards)}` },
        ].map((s) => (
          <div key={s.label} style={{
            flex: 1, background: C.card2, borderRadius: 10,
            padding: "8px 6px", textAlign: "center",
            border: `1px solid ${C.border}`,
          }}>
            <div style={{ color: C.gold, fontSize: 14, fontWeight: 700 }}>{s.val}</div>
            <div style={{ color: C.dim, fontSize: 9, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {/* card list */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>
        {walletCards.map((c) => (
          <div key={c.id} onClick={() => setSelCard(c.id)} style={{ cursor: "pointer", opacity: selCard === c.id ? 1 : 0.6, transition: "opacity .2s" }}>
            <CreditCardVisual
              name={c.name} bank={c.bank} rate={c.baseRate}
              accent={c.accent} g1={c.g1} g2={c.g2} textC={c.textC} mini
            />
          </div>
        ))}
      </div>
      {/* add card */}
      <Dialog open={addCardOpen} onOpenChange={setAddCardOpen}>
        <DialogTrigger asChild>
          <button style={{
            width: "100%", padding: "10px 0", borderRadius: 10,
            border: `1px dashed ${C.border2}`, background: "transparent",
            color: C.dim, fontSize: 13, cursor: "pointer",
            transition: "all .2s",
          }}>
            + Add Card
          </button>
        </DialogTrigger>
        <AddCardsDialogContent isMyCard={has} toggleMyCard={toggle} />
      </Dialog>
    </div>
  );

  /* ─── MOBILE HEADER ─── */
  const mobileHeader = (
    <div style={{
      padding: "16px 16px 12px", display: "flex",
      justifyContent: "space-between", alignItems: "center",
    }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>💰</span>
          <span style={{ color: C.gold, fontSize: 18, fontWeight: 700 }}>My Wallet</span>
        </div>
        <div style={{ color: C.dim, fontSize: 11, marginTop: 2 }}>
          {walletCards.length} card{walletCards.length !== 1 ? "s" : ""} &middot; {new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
        </div>
      </div>
      <Dialog open={addCardOpen} onOpenChange={setAddCardOpen}>
        <DialogTrigger asChild>
          <button style={{
            background: C.card2, border: `1px solid ${C.border}`,
            borderRadius: 10, padding: "8px 14px", color: C.gold,
            fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>
            + Add
          </button>
        </DialogTrigger>
        <AddCardsDialogContent isMyCard={has} toggleMyCard={toggle} />
      </Dialog>
    </div>
  );

  /* ─── MOBILE CARD STRIP ─── */
  const mobileCardStrip = (
    <div style={{
      display: "flex", gap: 12, overflowX: "auto",
      padding: "0 16px 12px", scrollSnapType: "x mandatory",
      WebkitOverflowScrolling: "touch",
    }} className="hide-scrollbar">
      {walletCards.map((c) => (
        <div key={c.id} onClick={() => setSelCard(c.id)} style={{
          scrollSnapAlign: "start", cursor: "pointer",
          opacity: selCard === c.id ? 1 : 0.55, transition: "opacity .2s",
          transform: selCard === c.id ? "scale(1)" : "scale(0.95)",
        }}>
          <CreditCardVisual
            name={c.name} bank={c.bank} rate={c.baseRate}
            accent={c.accent} g1={c.g1} g2={c.g2} textC={c.textC} mini
          />
        </div>
      ))}
    </div>
  );

  /* ─── MAIN CONTENT ─── */
  const mainContent = (
    <div style={{
      flex: 1, overflowY: "auto", padding: isMobile ? 16 : 28,
      display: "flex", flexDirection: "column", gap: 20,
    }}>
      {/* ── Portfolio Stats ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)",
        gap: 12, animation: "fadeSlideUp .4s ease-out",
      }}>
        {[
          { icon: "📊", label: "Total Spend", val: totalSpend, prefix: "₹", color: C.blue },
          { icon: "✨", label: "Rewards Earned", val: Math.round(totalRewards), prefix: "₹", color: C.gold },
          { icon: "📈", label: "Avg. Rate", val: parseFloat(avgRewardRate.toFixed(1)), suffix: "%", color: C.green },
          { icon: "💳", label: "Annual Fees", val: totalFees, prefix: "₹", color: C.purple },
        ].map((s) => (
          <div key={s.label} style={{
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 14, padding: isMobile ? 14 : 18,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              <span style={{ color: C.dim, fontSize: 11 }}>{s.label}</span>
            </div>
            <div style={{ color: s.color, fontSize: isMobile ? 20 : 24, fontWeight: 700 }}>
              <AnimNum to={s.val} prefix={s.prefix || ""} suffix={s.suffix || ""} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Expense Tracker Form ── */}
      {(showForm || !isMobile) && (
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: isMobile ? 16 : 24,
          animation: "fadeSlideUp .4s ease-out",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 18 }}>🧾</span>
            <span style={{ color: C.text, fontSize: 16, fontWeight: 700 }}>Track Expense</span>
          </div>

          {/* Amount */}
          <div style={{ position: "relative", marginBottom: 14 }}>
            <span style={{
              position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              color: C.dim, fontSize: 22, fontWeight: 700,
            }}>₹</span>
            <input
              type="number"
              value={amt}
              onChange={(e) => setAmt(e.target.value)}
              placeholder="0"
              style={{
                width: "100%", background: C.card2, border: `1px solid ${C.border}`,
                borderRadius: 12, padding: "14px 14px 14px 38px",
                color: C.text, fontSize: 26, fontWeight: 700,
                outline: "none",
              }}
            />
          </div>

          {/* Category pills */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(3,1fr)" : "repeat(5,1fr)",
            gap: 6, marginBottom: 14,
          }}>
            {CATS.map((c) => (
              <button key={c.id} onClick={() => setCat(c.id)} style={{
                background: cat === c.id ? `${c.c}20` : C.card2,
                border: `1px solid ${cat === c.id ? c.c + "66" : C.border}`,
                borderRadius: 10, padding: "8px 4px",
                color: cat === c.id ? c.c : C.dim,
                fontSize: 11, cursor: "pointer", transition: "all .15s",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              }}>
                <span style={{ fontSize: 16 }}>{c.icon}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>

          {/* Card selector */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: C.dim, fontSize: 11, marginBottom: 6 }}>Pay with</div>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }} className="hide-scrollbar">
              {walletCards.map((c) => (
                <button key={c.id} onClick={() => setSelCard(c.id)} style={{
                  background: selCard === c.id ? `${c.accent}20` : C.card2,
                  border: `1px solid ${selCard === c.id ? c.accent + "66" : C.border}`,
                  borderRadius: 10, padding: "8px 12px",
                  color: selCard === c.id ? c.accent : C.dim,
                  fontSize: 11, fontWeight: 600, cursor: "pointer",
                  whiteSpace: "nowrap", position: "relative", transition: "all .15s",
                }}>
                  {c.name.split(" ").slice(0, 2).join(" ")}
                  {bestCardId === c.id && (
                    <span style={{
                      position: "absolute", top: -6, right: -4,
                      background: C.gold, color: "#1a1a26",
                      fontSize: 8, fontWeight: 700, padding: "1px 5px",
                      borderRadius: 6,
                    }}>✨ Best</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Date + Note */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <input
              type="date"
              value={expDate}
              onChange={(e) => setExpDate(e.target.value)}
              style={{
                flex: 1, background: C.card2, border: `1px solid ${C.border}`,
                borderRadius: 10, padding: "8px 12px",
                color: C.text, fontSize: 12, outline: "none",
              }}
            />
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optional)"
              style={{
                flex: 2, background: C.card2, border: `1px solid ${C.border}`,
                borderRadius: 10, padding: "8px 12px",
                color: C.text, fontSize: 12, outline: "none",
              }}
            />
          </div>

          {/* Reward preview */}
          {amt && parseFloat(amt) > 0 && (
            <div style={{
              background: `${C.gold}10`, border: `1px solid ${C.gold}30`,
              borderRadius: 10, padding: "10px 14px", marginBottom: 14,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ color: C.dim, fontSize: 12 }}>Estimated Reward</span>
              <span style={{ color: C.gold, fontSize: 18, fontWeight: 700 }}>
                ₹{previewReward.toFixed(1)}
              </span>
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} style={{
            width: "100%", padding: "14px 0", borderRadius: 12,
            background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
            color: "#1a1a26", fontSize: 15, fontWeight: 700,
            border: "none", cursor: "pointer", letterSpacing: 0.3,
          }}>
            Track Expense →
          </button>
        </div>
      )}

      {/* ── Reward Flash ── */}
      {flash && (
        <div style={{
          background: `${C.green}18`, border: `1px solid ${C.green}44`,
          borderRadius: 12, padding: "12px 16px",
          animation: "fadeSlideUp .3s ease-out",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <span style={{ fontSize: 14 }}>🎉</span>
            <span style={{ color: C.green, fontWeight: 700, fontSize: 14, marginLeft: 6 }}>
              +₹{flash.reward.toFixed(1)} reward earned!
            </span>
          </div>
          {flash.missed > 0 && (
            <span style={{ color: C.gold, fontSize: 11 }}>
              💡 Could've earned ₹{flash.missed.toFixed(1)} more with best card
            </span>
          )}
        </div>
      )}

      {/* ── Summary Bar ── */}
      {monthExpenses.length > 0 && (
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: "12px 16px",
          display: "flex", justifyContent: "space-between",
          flexWrap: "wrap", gap: 8,
        }}>
          {[
            { l: "Month", v: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }) },
            { l: "Transactions", v: monthExpenses.length },
            { l: "Rewards", v: `₹${Math.round(totalRewards).toLocaleString("en-IN")}` },
            { l: "Total", v: `₹${Math.round(totalSpend).toLocaleString("en-IN")}` },
          ].map((s) => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <div style={{ color: C.dim, fontSize: 10 }}>{s.l}</div>
              <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{s.v}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Expense List (grouped by date) ── */}
      {grouped.length > 0 && (
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 16, overflow: "hidden",
        }}>
          {grouped.map(([date, items]) => (
            <div key={date}>
              {/* date header */}
              <div style={{
                padding: "10px 16px", background: C.card2,
                borderBottom: `1px solid ${C.border}`,
                display: "flex", justifyContent: "space-between",
              }}>
                <span style={{ color: C.dim, fontSize: 11, fontWeight: 600 }}>
                  {new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                </span>
                <span style={{ color: C.dim2, fontSize: 11 }}>
                  ₹{items.reduce((s, e) => s + e.amount, 0).toLocaleString("en-IN")}
                </span>
              </div>
              {/* rows */}
              {items.map((e) => {
                const catObj = CATS.find((c) => c.id === e.category);
                const th = getTheme(e.bank);
                return (
                  <div key={e.id} style={{
                    padding: "10px 16px", display: "flex", alignItems: "center",
                    gap: 10, borderBottom: `1px solid ${C.border}20`,
                    transition: "background .15s",
                  }}>
                    {/* category icon */}
                    <div style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: `${catObj?.c || C.dim}18`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16,
                    }}>
                      {catObj?.icon || "✦"}
                    </div>
                    {/* info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: C.text, fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {e.note || e.merchant || catObj?.label}
                      </div>
                      {/* card chip */}
                      <span style={{
                        display: "inline-block", marginTop: 2,
                        background: `${th.accent}20`, color: th.accent,
                        fontSize: 9, fontWeight: 600, padding: "1px 7px",
                        borderRadius: 6, border: `1px solid ${th.accent}30`,
                      }}>
                        {e.cardName.split(" ").slice(0, 2).join(" ")}
                      </span>
                    </div>
                    {/* amount + reward */}
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: C.text, fontSize: 14, fontWeight: 700 }}>
                        ₹{e.amount.toLocaleString("en-IN")}
                      </div>
                      <div style={{ color: C.green, fontSize: 10 }}>
                        +₹{e.rewardEarned.toFixed(1)}
                      </div>
                    </div>
                    {/* delete */}
                    <button onClick={() => deleteExpense(e.id)} style={{
                      background: "transparent", border: "none",
                      color: C.dim2, cursor: "pointer", fontSize: 14,
                      padding: 4, borderRadius: 6,
                      transition: "color .15s",
                    }}
                      onMouseEnter={(ev) => { (ev.target as HTMLElement).style.color = C.red; }}
                      onMouseLeave={(ev) => { (ev.target as HTMLElement).style.color = C.dim2; }}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* ── Charts Row ── */}
      {monthExpenses.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 16,
        }}>
          {/* Bar Chart: Rewards by Card */}
          <div style={{
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 16, padding: 18,
          }}>
            <div style={{ color: C.text, fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
              💰 Rewards by Card
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fill: C.dim, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.dim, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="rewards" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.accent} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart: Category Breakdown */}
          <div style={{
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 16, padding: 18,
          }}>
            <div style={{ color: C.text, fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
              📊 Category Split
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* legend */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8, justifyContent: "center" }}>
              {pieData.map((d) => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.dim }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                  {d.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Reward Efficiency ── */}
      {monthExpenses.length > 0 && (
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: isMobile ? 18 : 24,
          display: "flex", alignItems: "center", gap: 24,
          flexDirection: isMobile ? "column" : "row",
        }}>
          {/* SVG Ring */}
          <div style={{ position: "relative", width: 100, height: 100 }}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke={C.border} strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={C.gold} strokeWidth="8"
                strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - efficiency / 100)}`}
                transform="rotate(-90 50 50)" style={{ transition: "stroke-dashoffset 1s ease-out" }}
              />
            </svg>
            <div style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
              flexDirection: "column",
            }}>
              <span style={{ color: C.gold, fontSize: 22, fontWeight: 700 }}>{efficiency}</span>
              <span style={{ color: C.dim, fontSize: 9 }}>score</span>
            </div>
          </div>
          {/* text */}
          <div style={{ flex: 1, textAlign: isMobile ? "center" : "left" }}>
            <div style={{ color: C.text, fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
              Reward Efficiency
            </div>
            <div style={{ color: C.dim, fontSize: 12, lineHeight: 1.6 }}>
              {efficiency >= 90
                ? "Excellent! You're maximizing rewards on almost every purchase."
                : efficiency >= 70
                ? "Good job! Check the 'Best Card by Category' section below for a few tweaks."
                : efficiency >= 40
                ? "Room for improvement — you could earn more by matching cards to categories."
                : "Start tracking expenses to build up your efficiency score."
              }
            </div>
          </div>
        </div>
      )}

      {/* ── Best Card by Category ── */}
      {walletCards.length >= 1 && (
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: isMobile ? 16 : 22,
        }}>
          <div style={{ color: C.text, fontSize: 14, fontWeight: 700, marginBottom: 14 }}>
            🏆 Best Card by Category
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: 8,
          }}>
            {CATS.map((c) => {
              const best = getBest(c.id);
              if (!best) return null;
              return (
                <div key={c.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 10,
                  background: C.card2, border: `1px solid ${C.border}`,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `${c.c}18`, display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: 15,
                  }}>
                    {c.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: C.dim, fontSize: 10 }}>{c.label}</div>
                    <div style={{
                      color: C.text, fontSize: 12, fontWeight: 600,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {best.name}
                    </div>
                  </div>
                  <span style={{
                    color: best.accent, fontSize: 13, fontWeight: 700,
                    background: `${best.accent}15`, padding: "3px 8px",
                    borderRadius: 8,
                  }}>
                    {best.rate.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Daily Trend ── */}
      {trendData.length > 1 && (
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: isMobile ? 16 : 22,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ color: C.text, fontSize: 14, fontWeight: 700 }}>
              📈 Daily Trend
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {(["spend", "reward"] as const).map((m) => (
                <button key={m} onClick={() => setTrendMode(m)} style={{
                  background: trendMode === m ? `${C.gold}20` : C.card2,
                  border: `1px solid ${trendMode === m ? C.gold + "44" : C.border}`,
                  borderRadius: 8, padding: "4px 10px",
                  color: trendMode === m ? C.gold : C.dim,
                  fontSize: 11, fontWeight: 600, cursor: "pointer",
                }}>
                  {m === "spend" ? "Spend" : "Reward"}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={trendMode === "spend" ? C.blue : C.gold} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={trendMode === "spend" ? C.blue : C.gold} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="date" tick={{ fill: C.dim, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.dim, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={trendMode}
                stroke={trendMode === "spend" ? C.blue : C.gold}
                fill="url(#trendGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Smart Insights ── */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 16, padding: isMobile ? 16 : 22,
      }}>
        <div style={{ color: C.text, fontSize: 14, fontWeight: 700, marginBottom: 14 }}>
          💡 Smart Insights
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {insights.map((ins, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 14px", borderRadius: 10,
              background: C.card2, border: `1px solid ${C.border}`,
              borderLeft: `3px solid ${ins.color}`,
            }}>
              <span style={{ color: C.text, fontSize: 12, lineHeight: 1.5 }}>
                {ins.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* bottom spacer for mobile FAB */}
      {isMobile && <div style={{ height: 70 }} />}
    </div>
  );

  /* ─── MOBILE FAB ─── */
  const mobileFab = isMobile && !showForm ? (
    <button onClick={() => setShowForm(true)} style={{
      position: "fixed", bottom: 24, right: 24,
      width: 56, height: 56, borderRadius: "50%",
      background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
      color: "#1a1a26", fontSize: 28, fontWeight: 700,
      border: "none", cursor: "pointer",
      boxShadow: `0 4px 24px ${C.gold}44`,
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 50,
    }}>
      +
    </button>
  ) : null;

  /* ─── RENDER ─── */
  return (
    <div style={{
      display: "flex", minHeight: "100vh", background: C.bg,
      fontFamily: "'Inter','system-ui',sans-serif",
    }}>
      {/* Desktop sidebar */}
      {!isMobile && sidebar}

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {isMobile && mobileHeader}
        {isMobile && mobileCardStrip}
        {mainContent}
      </div>

      {/* Mobile FAB */}
      {mobileFab}

      <style>{kfStyles}</style>
    </div>
  );
}

/* ─── Keyframes & scrollbar styles ─── */
const kfStyles = `
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;
