"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from "recharts";
import { useMyCards } from "@/hooks/use-my-cards";
import { useExpenses } from "@/hooks/use-expenses";
import { getMasterCard } from "@/data/card-v3-master";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import AddCardsDialogContent from "@/components/my-cards/AddCardsDialog";
import { playSound } from "@/lib/sounds";

/* ═══════════════════════ FONTS ═══════════════════════ */
const fl = document.createElement("link");
fl.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Outfit:wght@300;400;500;600;700&display=swap";
fl.rel = "stylesheet";
document.head.appendChild(fl);

/* ═══════════════════════ TOKENS ═══════════════════════ */
const C = {
  bg: "#06060b", bg1: "#0d0d14", bg2: "#13131c", bg3: "#1a1a26", bgHov: "#1f1f2e",
  gold: "#c9a84c", goldL: "#e8d5a0", goldLL: "#f5ecd2", goldDim: "rgba(201,168,76,0.12)", goldBorder: "rgba(201,168,76,0.10)", goldGlow: "rgba(201,168,76,0.06)",
  text: "#ececec", textS: "#8e8e9e", textM: "#55556a",
  green: "#5eead4", greenD: "rgba(94,234,212,0.10)",
  red: "#fb7185", redD: "rgba(251,113,133,0.10)",
  amber: "#fcd34d",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'Outfit', system-ui, sans-serif",
};

/* ═══════════════════════ CATEGORIES ═══════════════════════ */
const CATS = [
  { id: "dining", label: "Dining", icon: "🍽️", c: "#fb923c" },
  { id: "groceries", label: "Groceries", icon: "🛒", c: "#34d399" },
  { id: "fuel", label: "Fuel", icon: "⛽", c: "#60a5fa" },
  { id: "travel", label: "Travel", icon: "✈️", c: "#a78bfa" },
  { id: "shopping", label: "Shopping", icon: "🛍️", c: "#f472b6" },
  { id: "health", label: "Health", icon: "💊", c: "#2dd4bf" },
  { id: "entertainment", label: "Fun", icon: "🎬", c: "#fb7185" },
  { id: "bills", label: "Bills", icon: "📱", c: "#22d3ee" },
  { id: "rent", label: "Rent", icon: "🏠", c: "#c084fc" },
  { id: "education", label: "Study", icon: "📚", c: "#facc15" },
  { id: "other", label: "Other", icon: "✦", c: "#94a3b8" },
];

/* ═══════════════════════ BANK THEMES ═══════════════════════ */
const BANK_THEME = {
  "American Express": { g1: "#2a1f0a", g2: "#1a1508", accent: "#d4af37", textC: "#f5e6b8" },
  "HDFC Bank": { g1: "#0a1628", g2: "#060e1a", accent: "#2563eb", textC: "#93c5fd" },
  "ICICI Bank": { g1: "#280a0e", g2: "#1a0608", accent: "#dc2626", textC: "#fca5a5" },
  "Axis Bank": { g1: "#280a1e", g2: "#1a0614", accent: "#97144d", textC: "#f9a8d4" },
  "SBI": { g1: "#0a1428", g2: "#060c1a", accent: "#1e40af", textC: "#93b4fd" },
  "State Bank of India": { g1: "#0a1428", g2: "#060c1a", accent: "#1e40af", textC: "#93b4fd" },
  "SBI Card": { g1: "#0a1428", g2: "#060c1a", accent: "#1e40af", textC: "#93b4fd" },
  "Kotak Mahindra Bank": { g1: "#280a0a", g2: "#1a0606", accent: "#dc2626", textC: "#fca5a5" },
  "IDFC First Bank": { g1: "#0a2818", g2: "#061a10", accent: "#059669", textC: "#6ee7b7" },
  "IDFC FIRST Bank": { g1: "#0a2818", g2: "#061a10", accent: "#059669", textC: "#6ee7b7" },
  "IndusInd Bank": { g1: "#1a0a28", g2: "#100618", accent: "#7c3aed", textC: "#c4b5fd" },
  "Yes Bank": { g1: "#0a1628", g2: "#060e1a", accent: "#2563eb", textC: "#93c5fd" },
  "RBL Bank": { g1: "#280a12", g2: "#1a060a", accent: "#e11d48", textC: "#fda4af" },
  "AU Small Finance Bank": { g1: "#281a0a", g2: "#1a1006", accent: "#d97706", textC: "#fcd34d" },
  "AU Bank": { g1: "#281a0a", g2: "#1a1006", accent: "#d97706", textC: "#fcd34d" },
  "HSBC": { g1: "#280a0a", g2: "#1a0606", accent: "#dc2626", textC: "#fca5a5" },
  "Standard Chartered": { g1: "#0a2818", g2: "#061a10", accent: "#059669", textC: "#6ee7b7" },
  "Bank of Baroda": { g1: "#281408", g2: "#1a0c04", accent: "#ea580c", textC: "#fdba74" },
  "Federal Bank": { g1: "#0a1628", g2: "#060e1a", accent: "#2563eb", textC: "#93c5fd" },
  "OneCard": { g1: "#1a1a26", g2: "#12121a", accent: "#a3a3a3", textC: "#d4d4d4" },
  "Scapia": { g1: "#0a2828", g2: "#061a1a", accent: "#0891b2", textC: "#67e8f9" },
};

/* ═══════════════════════ V3 CATEGORY MAP ═══════════════════════ */
const CAT_TO_V3 = {
  dining: "dining", groceries: "grocery", fuel: "fuel", travel: "travel",
  shopping: "online", health: "base", entertainment: "entertainment",
  bills: "utilities", rent: "base", education: "base", other: "base",
};

function buildRatesFromV3(cardId) {
  const v3 = getMasterCard(cardId)?.enrichment;
  if (!v3) return { dining: 1, groceries: 1, fuel: 1, travel: 1, shopping: 1, health: 1, entertainment: 1, bills: 1, rent: 0.5, education: 1, other: 1 };
  const r = {};
  for (const [catId, v3Key] of Object.entries(CAT_TO_V3)) {
    const cat = v3.categories[v3Key];
    r[catId] = cat ? cat.rate : v3.baseRate;
  }
  return r;
}

function parseFee(fee) {
  if (typeof fee === "number") return fee;
  return parseInt(String(fee).replace(/[₹,]/g, "")) || 0;
}

/* ═══════════════════════ DATA BRIDGE (hooks → component shape) ═══════════════════════ */
let CARDS = []; // populated inside component via hook
let INIT_EXPENSES = [];
const uid = () => Math.random().toString(36).slice(2, 10);

/* ═══════════════════════ HELPERS ═══════════════════════ */
const getCard = id => CARDS.find(c => c.id === id);
const getCat = id => CATS.find(c => c.id === id);
const getBest = catId => CARDS.length === 0 ? null : CARDS.reduce((b, c) => (c.rates?.[catId] || 0) > (b.rates?.[catId] || 0) ? c : b, CARDS[0]);
const fmtK = n => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(1)}K` : `₹${n}`;
const fmtN = n => `₹${n.toLocaleString("en-IN")}`;
const fmtDate = d => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const dateLabel = d => { const t = new Date(); const dd = new Date(d); if (t.toDateString() === dd.toDateString()) return "Today"; const y = new Date(t); y.setDate(y.getDate()-1); if (y.toDateString() === dd.toDateString()) return "Yesterday"; return dd.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" }); };

/* ═══════════════════════ COMPONENTS ═══════════════════════ */
function AnimNum({ value, prefix = "₹" }) {
  const [d, setD] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let s = 0; const step = value / 50;
    clearInterval(ref.current);
    ref.current = setInterval(() => { s += step; if (s >= value) { setD(value); clearInterval(ref.current); } else setD(Math.floor(s)); }, 16);
    return () => clearInterval(ref.current);
  }, [value]);
  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{prefix}{d.toLocaleString("en-IN")}</span>;
}

function CreditCardVisual({ card, isActive, onClick, compact }) {
  const theme = BANK_THEME[card.bank] || { g1: "#1a1a26", g2: "#12121a", accent: "#c9a84c", textC: "#e8d5a0" };
  return (
    <button onClick={onClick} style={{
      width: "100%", padding: 0,
      background: `linear-gradient(145deg, ${theme.g1}, ${theme.g2})`,
      border: `1.5px solid ${isActive ? theme.accent + "80" : theme.accent + "20"}`,
      borderRadius: 14, cursor: "pointer", textAlign: "left", position: "relative", overflow: "hidden",
      transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)", fontFamily: C.sans,
      transform: isActive ? "scale(1.02)" : "scale(1)",
      boxShadow: isActive ? `0 4px 24px ${theme.accent}15, inset 0 1px 0 ${theme.accent}15` : `inset 0 1px 0 ${theme.accent}08`,
    }}>
      {/* Card image */}
      {card.image ? (
        <div style={{ width: "100%", aspectRatio: "16/10", borderRadius: "12px 12px 0 0", overflow: "hidden", background: card.color || "#0D0D0D" }}>
          <img src={card.image} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
        </div>
      ) : (
        <div style={{ width: "100%", aspectRatio: "16/10", borderRadius: "12px 12px 0 0", background: `linear-gradient(135deg, ${theme.g1}, ${theme.accent}20)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 20, borderRadius: 3, background: `linear-gradient(135deg, #d4a84080, #b8943580)`, border: "1px solid #d4a84030" }} />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.accent + "60"} strokeWidth="2"><path d="M2 12C2 6.5 6.5 2 12 2"/><path d="M5 12a7 7 0 017-7"/><path d="M8 12a4 4 0 014-4"/></svg>
          </div>
        </div>
      )}
      {/* Card info bar */}
      <div style={{ padding: compact ? "10px 14px" : "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: compact ? 12 : 13, fontWeight: 600, color: theme.textC, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.name}</div>
          <div style={{ fontSize: 10, color: theme.textC + "80", marginTop: 2 }}>{card.bank}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: theme.accent }}>{card.rates?.other || 1}%</span>
          {isActive && <div style={{ width: 7, height: 7, borderRadius: "50%", background: theme.accent, boxShadow: `0 0 8px ${theme.accent}` }} />}
        </div>
      </div>
    </button>
  );
}

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.bg2, border: `1px solid ${C.goldBorder}`, borderRadius: 12, padding: "10px 14px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", backdropFilter: "blur(12px)" }}>
      <div style={{ fontSize: 11, color: C.textM, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 14, fontWeight: 600, color: p.color || C.gold, fontVariantNumeric: "tabular-nums" }}>
          {formatter ? formatter(p.value) : fmtN(p.value)}
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════ MAIN ═══════════════════════ */
export default function MyCards() {
  // ── Real data from hooks ──
  const { myCardObjects, toggle, has } = useMyCards();
  const { expenses: rawExpenses, addExpense: hookAddExpense, deleteExpense: hookDeleteExpense } = useExpenses();

  // Build CARDS array from user's actual wallet
  CARDS = useMemo(() => myCardObjects.map(obj => ({
    id: obj.cardId,
    name: obj.card.name,
    bank: obj.card.issuer,
    fee: parseFee(obj.card.fee),
    tier: obj.card.type || "Premium",
    rates: buildRatesFromV3(obj.cardId),
    image: obj.card.image || null,
    color: obj.card.color || "#0D0D0D",
  })), [myCardObjects]);

  // Build expenses with calculated rewards
  const hookExpenses = useMemo(() => rawExpenses.map(e => {
    const card = CARDS.find(c => c.id === e.cardId);
    const catKey = e.category;
    const rate = card?.rates[catKey] || card?.rates.other || 1;
    return { ...e, rewardEarned: Math.round(e.amount * rate / 100) };
  }), [rawExpenses, CARDS]);

  const [selCard, setSelCard] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [amt, setAmt] = useState("");
  const [cat, setCat] = useState(null);
  const [payCard, setPayCard] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [flash, setFlash] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [chartMode, setChartMode] = useState("spend");
  const [isMobile, setIsMobile] = useState(false);

  // Sync hook expenses → local state
  useEffect(() => { setExpenses(hookExpenses); }, [hookExpenses]);
  // Set default pay card when cards load
  useEffect(() => { if (CARDS.length > 0 && !payCard) setPayCard(CARDS[0].id); }, [CARDS.length]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Computed
  const filtered = useMemo(() => {
    let e = [...expenses];
    if (selCard) e = e.filter(x => x.cardId === selCard);
    return e.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, selCard]);

  const grouped = useMemo(() => {
    const m = {};
    filtered.forEach(e => { const k = e.date; if (!m[k]) m[k] = []; m[k].push(e); });
    return Object.entries(m).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  }, [filtered]);

  const totalFees = CARDS.reduce((s, c) => s + c.fee, 0);
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const totalReward = expenses.reduce((s, e) => s + e.rewardEarned, 0);
  const net = totalReward - totalFees;
  const maxReward = expenses.reduce((s, e) => { const b = getBest(e.category); return s + (b ? e.amount * (b.rates?.[e.category] || 0) / 100 : 0); }, 0);
  const eff = maxReward > 0 ? Math.round(totalReward / maxReward * 100) : 0;

  const catData = useMemo(() => {
    const m = {};
    expenses.forEach(e => {
      const c = getCat(e.category);
      if (!m[e.category]) m[e.category] = { name: c.label, value: 0, reward: 0, color: c.c, icon: c.icon };
      m[e.category].value += e.amount;
      m[e.category].reward += e.rewardEarned;
    });
    return Object.values(m).sort((a, b) => b.value - a.value);
  }, [expenses]);

  const cardRewardData = useMemo(() => {
    const m = {};
    expenses.forEach(e => {
      const c = getCard(e.cardId);
      if (!c) return;
      const theme = BANK_THEME[c.bank];
      if (!m[e.cardId]) m[e.cardId] = { name: c.name.length > 14 ? c.name.slice(0, 14) + "…" : c.name, value: 0, fill: theme?.accent || C.gold };
      m[e.cardId].value += e.rewardEarned;
    });
    return Object.values(m).sort((a, b) => b.value - a.value);
  }, [expenses]);

  const dailyData = useMemo(() => {
    const d = [];
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) d.push({ day: i, spend: 0, reward: 0 });
    expenses.forEach(e => {
      const day = new Date(e.date).getDate();
      if (d[day - 1]) { d[day - 1].spend += e.amount; d[day - 1].reward += e.rewardEarned; }
    });
    return d;
  }, [expenses]);

  const smartBest = cat ? getBest(cat) : null;

  // Actions — wired to persistent hooks
  const addExpense = () => {
    if (!amt || !cat || !payCard) return;
    const a = parseFloat(amt.replace(/,/g, ""));
    if (isNaN(a) || a <= 0) return;
    const card = getCard(payCard);
    const rate = card?.rates[cat] || 0;
    const reward = Math.round(a * rate / 100);
    const best = getBest(cat);
    const bestR = best ? Math.round(a * best.rates[cat] / 100) : reward;
    // Persist via hook (localStorage)
    hookAddExpense({ cardId: payCard, date, merchant: note || getCat(cat)?.label || cat, amount: a, category: cat, note });
    setFlash({ reward, missed: bestR - reward, bestName: best?.name || "", bestId: best?.id || "", usedId: payCard });
    playSound("chime");
    setTimeout(() => setFlash(null), 4500);
    setAmt(""); setCat(null); setNote(""); setShowForm(false);
  };

  const deleteExp = id => {
    playSound("pop");
    setDeleting(id);
    setTimeout(() => { hookDeleteExpense(id); setDeleting(null); }, 300);
  };

  /* ═══════════════════════ RENDER ═══════════════════════ */
  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: C.sans, color: C.text }}>

      {/* ═══ MOBILE HEADER ═══ */}
      {isMobile && (
        <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.goldBorder}` }}>
          <h1 style={{ fontFamily: C.serif, fontSize: 24, margin: 0, fontWeight: 600 }}>My Wallet</h1>
          <div style={{ background: C.goldDim, color: C.gold, fontSize: 12, fontWeight: 600, padding: "4px 14px", borderRadius: 20, border: `1px solid ${C.goldBorder}` }}>{CARDS.length} cards</div>
        </div>
      )}

      <div style={{ maxWidth: 1440, margin: "0 auto", display: "flex", gap: 28, padding: isMobile ? "0" : "0 28px" }}>

        {/* ═══════════════════ SIDEBAR ═══════════════════ */}
        {!isMobile && (
          <div style={{ width: 300, flexShrink: 0, paddingTop: 32, paddingBottom: 60, position: "sticky", top: 0, height: "100vh", overflowY: "auto", overflowX: "hidden" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h1 style={{ fontFamily: C.serif, fontSize: 26, margin: 0, fontWeight: 600 }}>My Wallet</h1>
              <div style={{ background: C.goldDim, color: C.gold, fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20, border: `1px solid ${C.goldBorder}` }}>{CARDS.length}</div>
            </div>

            {/* Mini stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 24 }}>
              {[{ v: CARDS.length, l: "Cards", c: C.text }, { v: fmtK(totalFees), l: "Fees", c: C.text, raw: true }, { v: fmtK(totalReward), l: "Earned", c: C.green, raw: true }].map((s, i) => (
                <div key={i} style={{ background: C.bg2, borderRadius: 10, padding: "12px 6px", textAlign: "center", border: `1px solid ${C.goldBorder}` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: s.c, fontVariantNumeric: "tabular-nums" }}>{s.raw ? s.v : s.v}</div>
                  <div style={{ fontSize: 9, color: C.textM, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 3 }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Card visuals */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {CARDS.map(c => (
                <div key={c.id} style={{ position: "relative" }} className="group/card">
                  <CreditCardVisual card={c} isActive={selCard === c.id} compact
                    onClick={() => { playSound("tap"); setSelCard(selCard === c.id ? null : c.id); }} />
                  <button
                    onClick={(e) => { e.stopPropagation(); playSound("pop"); toggle(c.id); if (selCard === c.id) setSelCard(null); }}
                    className="opacity-0 group-hover/card:opacity-100"
                    style={{
                      position: "absolute", top: 8, right: 8, width: 24, height: 24, borderRadius: 8,
                      background: "rgba(251,113,133,0.15)", border: "1px solid rgba(251,113,133,0.3)",
                      color: "#fb7185", fontSize: 11, cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center", transition: "opacity 0.2s", zIndex: 10,
                    }}
                    title="Remove card"
                  >✕</button>
                </div>
              ))}
            </div>

            <button onClick={() => { playSound("tap"); setShowAddCard(true); }} style={{
              width: "100%", padding: "14px", borderRadius: 12,
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldL})`, color: "#0a0a0f",
              border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: C.sans,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: `0 4px 20px ${C.gold}20`, transition: "all 0.2s",
            }}>
              <span style={{ fontSize: 20, lineHeight: 1 }}>+</span> Add Card
            </button>

            {/* Filter */}
            {selCard && (
              <button onClick={() => setSelCard(null)} style={{ marginTop: 12, width: "100%", padding: "10px", borderRadius: 10, background: C.redD, border: `1px solid ${C.red}30`, color: C.red, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}>
                ✕ Clear filter
              </button>
            )}
          </div>
        )}

        {/* ═══════════════════ MAIN ═══════════════════ */}
        <div style={{ flex: 1, minWidth: 0, paddingTop: isMobile ? 16 : 32, paddingBottom: 80, paddingLeft: isMobile ? 16 : 0, paddingRight: isMobile ? 16 : 0 }}>

          {/* ─── MOBILE CARD STRIP ─── */}
          {isMobile && (
            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 16, marginBottom: 4, scrollSnapType: "x mandatory" }}>
              {CARDS.map(c => (
                <div key={c.id} style={{ minWidth: "70%", scrollSnapAlign: "start", flexShrink: 0 }}>
                  <CreditCardVisual card={c} isActive={selCard === c.id}
                    onClick={() => { playSound("tap"); setSelCard(selCard === c.id ? null : c.id); }} />
                </div>
              ))}
            </div>
          )}

          {/* ─── PORTFOLIO DASHBOARD ─── */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textM, marginBottom: 14 }}>Portfolio Overview</div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: isMobile ? 10 : 14 }}>
              {[
                { icon: "₹", label: "Annual Fees", value: totalFees, color: C.textS },
                { icon: "◆", label: "Rewards Earned", value: totalReward, color: C.green },
                { icon: "⬡", label: "Net Value", value: Math.abs(net), color: net >= 0 ? C.green : C.red, prefix: net < 0 ? "-₹" : "₹" },
                { icon: "◎", label: "Total Tracked", value: totalSpent, color: C.gold },
              ].map((s, i) => (
                <div key={i} style={{
                  background: C.bg1, border: `1px solid ${C.goldBorder}`, borderRadius: 16,
                  padding: isMobile ? "18px 16px" : "22px 24px", position: "relative", overflow: "hidden",
                  animation: `fadeSlideUp 0.5s ease ${i * 0.08}s both`,
                }}>
                  <div style={{ fontSize: 13, color: s.color, opacity: 0.5, marginBottom: 12, fontWeight: 600 }}>{s.icon}</div>
                  <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, color: s.color, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>
                    <AnimNum value={s.value} prefix={s.prefix || "₹"} />
                  </div>
                  <div style={{ fontSize: 10, color: C.textM, textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 8, fontWeight: 500 }}>{s.label}</div>
                  <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `${s.color}06` }} />
                </div>
              ))}
            </div>
          </div>

          {/* ═══════════ EXPENSE TRACKER ═══════════ */}
          <div style={{
            background: C.bg1, border: `1px solid ${C.goldBorder}`, borderRadius: 20, overflow: "hidden", marginBottom: 24,
            boxShadow: `0 0 80px ${C.goldGlow}`,
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "18px 18px" : "22px 28px", borderBottom: `1px solid ${C.goldBorder}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.gold}20, ${C.gold}08)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: `1px solid ${C.goldBorder}` }}>💳</div>
                <div>
                  <div style={{ fontFamily: C.serif, fontSize: isMobile ? 18 : 22, fontWeight: 600 }}>Expenses</div>
                </div>
              </div>
              <button onClick={() => setShowForm(!showForm)} style={{
                background: showForm ? C.bg3 : `linear-gradient(135deg, ${C.gold}, ${C.goldL})`,
                color: showForm ? C.textS : "#0a0a0f", border: showForm ? `1px solid ${C.goldBorder}` : "none",
                borderRadius: 12, padding: isMobile ? "10px 16px" : "11px 22px", fontWeight: 600, cursor: "pointer",
                fontFamily: C.sans, fontSize: 13, transition: "all 0.25s", display: "flex", alignItems: "center", gap: 6,
              }}>
                {showForm ? "✕ Cancel" : "＋ Add"}
              </button>
            </div>

            {/* ─── EXPENSE FORM ─── */}
            <div style={{ maxHeight: showForm ? 700 : 0, overflow: "hidden", transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)" }}>
              <div style={{ padding: isMobile ? "20px 18px" : "28px 28px 24px", background: `linear-gradient(180deg, ${C.bg2}, ${C.bg1})`, borderBottom: `1px solid ${C.goldBorder}` }}>

                {/* Amount */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textM, marginBottom: 10 }}>Amount</div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 4, background: C.bg, borderRadius: 16,
                    padding: "16px 20px", border: `1.5px solid ${amt ? C.gold + "60" : C.goldBorder}`, transition: "border-color 0.2s",
                  }}>
                    <span style={{ fontSize: 36, fontWeight: 300, color: C.textM, fontFamily: C.serif }}>₹</span>
                    <input type="text" inputMode="numeric" placeholder="0" value={amt}
                      autoFocus={showForm}
                      onChange={e => { const r = e.target.value.replace(/[^0-9]/g, ""); setAmt(r ? parseInt(r).toLocaleString("en-IN") : ""); }}
                      style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: C.text, fontSize: 40, fontWeight: 700, fontFamily: C.sans, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }} />
                    {amt && (
                      <button onClick={() => setAmt("")} style={{ background: C.bg3, border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: C.textS, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textM, marginBottom: 10 }}>Category</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {CATS.map(c => {
                      const active = cat === c.id;
                      return (
                        <button key={c.id} onClick={() => { setCat(c.id); const b = getBest(c.id); if (b) setPayCard(b.id); }}
                          style={{
                            display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 12,
                            border: `1.5px solid ${active ? c.c + "70" : C.goldBorder}`,
                            background: active ? c.c + "15" : "transparent", cursor: "pointer", fontSize: 13, fontWeight: 500,
                            color: active ? c.c : C.textS, fontFamily: C.sans, transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
                            transform: active ? "scale(1.05)" : "scale(1)",
                            boxShadow: active ? `0 2px 12px ${c.c}15` : "none",
                          }}>
                          <span style={{ fontSize: 15 }}>{c.icon}</span>{c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Card selector */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textM, marginBottom: 10 }}>Pay With</div>
                  <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
                    {CARDS.map(c => {
                      const active = payCard === c.id;
                      const isBest = smartBest?.id === c.id && cat;
                      const rate = cat ? (c.rates?.[cat] || 0) : (c.rates?.other || 0);
                      const theme = BANK_THEME[c.bank] || { g1: "#1a1a26", g2: "#12121a", accent: "#c9a84c", textC: "#e8d5a0" };
                      return (
                        <button key={c.id} onClick={() => setPayCard(c.id)}
                          style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, flexShrink: 0,
                            background: active ? `linear-gradient(145deg, ${theme.g1}, ${theme.g2})` : C.bg,
                            border: `1.5px solid ${active ? theme.accent + "50" : C.goldBorder}`,
                            cursor: "pointer", fontFamily: C.sans, transition: "all 0.2s", position: "relative",
                          }}>
                          {c.image ? (
                            <img src={c.image} alt="" style={{ width: 40, height: 25, borderRadius: 4, objectFit: "cover", border: `1px solid ${theme?.accent || C.goldBorder}30` }} loading="lazy" />
                          ) : (
                            <div style={{ width: 40, height: 25, borderRadius: 4, background: `linear-gradient(135deg, ${theme?.accent || C.gold}30, ${theme?.accent || C.gold}10)`, border: `1px solid ${theme?.accent || C.goldBorder}30` }} />
                          )}
                          <div style={{ textAlign: "left" }}>
                            <div style={{ fontSize: 12, fontWeight: 500, color: active ? theme.textC : C.textS }}>{c.name.length > 16 ? c.name.slice(0, 16) + "…" : c.name}</div>
                            <div style={{ fontSize: 11, color: active ? theme.accent : C.textM, fontWeight: 600 }}>{rate}%</div>
                          </div>
                          {isBest && (
                            <div style={{ position: "absolute", top: -8, right: -6, background: `linear-gradient(135deg, ${C.gold}, ${C.goldL})`, color: "#0a0a0f", fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 8, boxShadow: `0 2px 8px ${C.gold}30` }}>✨ Best</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date + Note */}
                <div style={{ display: "flex", gap: 12, marginBottom: 24, flexDirection: isMobile ? "column" : "row" }}>
                  <div style={{ flex: isMobile ? "auto" : "0 0 170px" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textM, marginBottom: 8 }}>Date</div>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                      style={{ width: "100%", background: C.bg, border: `1.5px solid ${C.goldBorder}`, borderRadius: 12, padding: "12px 14px", color: C.text, fontFamily: C.sans, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textM, marginBottom: 8 }}>Note</div>
                    <input type="text" placeholder="What was this for?" value={note} onChange={e => setNote(e.target.value)}
                      style={{ width: "100%", background: C.bg, border: `1.5px solid ${C.goldBorder}`, borderRadius: 12, padding: "12px 14px", color: C.text, fontFamily: C.sans, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>

                {/* Reward preview + Submit */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  {amt && cat && payCard && (() => {
                    const a = parseFloat(amt.replace(/,/g, ""));
                    const r = getCard(payCard)?.rates?.[cat] || 0;
                    const rw = Math.round(a * r / 100);
                    return (
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, animation: "fadeSlideUp 0.3s ease" }}>
                        <span style={{ fontSize: 13, color: C.textS }}>You'll earn</span>
                        <span style={{ fontSize: 24, fontWeight: 700, color: C.green, fontVariantNumeric: "tabular-nums" }}>{fmtN(rw)}</span>
                        <span style={{ fontSize: 12, color: C.textM }}>({r}%)</span>
                      </div>
                    );
                  })()}
                  {!(amt && cat && payCard) && <div />}
                  <button onClick={addExpense} disabled={!amt || !cat}
                    style={{
                      background: (!amt || !cat) ? C.bg3 : `linear-gradient(135deg, ${C.gold}, ${C.goldL})`,
                      color: (!amt || !cat) ? C.textM : "#0a0a0f", border: "none", borderRadius: 14,
                      padding: "14px 36px", fontWeight: 700, cursor: (!amt || !cat) ? "not-allowed" : "pointer",
                      fontFamily: C.sans, fontSize: 15, transition: "all 0.25s",
                      boxShadow: (amt && cat) ? `0 4px 20px ${C.gold}25` : "none",
                    }}>
                    Track Expense →
                  </button>
                </div>
              </div>
            </div>

            {/* ─── REWARD FLASH ─── */}
            {flash && (
              <div style={{ padding: "14px 28px", background: C.greenD, borderBottom: `1px solid ${C.green}20`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, animation: "fadeSlideUp 0.3s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22 }}>🎉</span>
                  <span style={{ fontSize: 15, color: C.green, fontWeight: 700 }}>+{fmtN(flash.reward)} earned!</span>
                </div>
                {flash.missed > 0 && flash.usedId !== flash.bestId && (
                  <span style={{ fontSize: 12, color: C.amber, fontWeight: 500 }}>
                    💡 {flash.bestName.slice(0, 20)} → +₹{flash.missed} more
                  </span>
                )}
              </div>
            )}

            {/* ─── SUMMARY BAR ─── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "14px 18px" : "16px 28px", borderBottom: `1px solid ${C.goldBorder}`, flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</span>
                <span style={{ fontSize: 12, color: C.textM, background: C.bg2, padding: "3px 10px", borderRadius: 6 }}>{filtered.length} txns</span>
                <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>+{fmtN(filtered.reduce((s, e) => s + e.rewardEarned, 0))}</span>
              </div>
              <span style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmtN(filtered.reduce((s, e) => s + e.amount, 0))}</span>
            </div>

            {/* ─── EXPENSE LIST ─── */}
            <div style={{ maxHeight: 460, overflowY: "auto" }}>
              {grouped.length === 0 ? (
                <div style={{ padding: "72px 28px", textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>💳</div>
                  <div style={{ fontSize: 16, color: C.textS, fontWeight: 500, marginBottom: 6 }}>No expenses yet</div>
                  <div style={{ fontSize: 13, color: C.textM, maxWidth: 300, margin: "0 auto" }}>Add your first expense to see rewards calculated in real-time</div>
                </div>
              ) : grouped.map(([dateKey, exps]) => (
                <div key={dateKey}>
                  {/* Date header */}
                  <div style={{ padding: "10px 28px 6px", fontSize: 11, fontWeight: 600, color: C.textM, textTransform: "uppercase", letterSpacing: "0.1em", background: C.bg + "80" }}>
                    {dateLabel(dateKey)}
                  </div>
                  {exps.map(exp => {
                    const ec = getCat(exp.category) || { label: exp.category, icon: "✦", c: "#94a3b8" };
                    const eCard = getCard(exp.cardId);
                    const eCardName = eCard?.name || exp.cardId;
                    const eCardBank = eCard?.bank || "";
                    const isDel = deleting === exp.id;
                    return (
                      <div key={exp.id} style={{
                        display: "flex", alignItems: "center", padding: isMobile ? "14px 18px" : "16px 28px", gap: isMobile ? 12 : 16,
                        borderBottom: `1px solid ${C.goldBorder}`, transition: "all 0.3s",
                        opacity: isDel ? 0 : 1, transform: isDel ? "translateX(40px)" : "translateX(0)",
                        cursor: "default",
                      }}
                        onMouseEnter={e => { if (!isMobile) { e.currentTarget.style.background = C.bg2; const d = e.currentTarget.querySelector(".del-btn"); if (d) d.style.opacity = "1"; }}}
                        onMouseLeave={e => { if (!isMobile) { e.currentTarget.style.background = "transparent"; const d = e.currentTarget.querySelector(".del-btn"); if (d) d.style.opacity = "0"; }}}
                      >
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: `${ec.c}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, border: `1px solid ${ec.c}15` }}>{ec.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 500 }}>{ec.label}</span>
                            {exp.note && <span style={{ fontSize: 12, color: C.textM, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>— {exp.note}</span>}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                            <span style={{ fontSize: 10, color: BANK_THEME[eCardBank]?.accent || C.textM, background: (BANK_THEME[eCardBank]?.accent || C.textM) + "12", padding: "2px 8px", borderRadius: 5, fontWeight: 500 }}>{eCardName.length > 18 ? eCardName.slice(0, 18) + "…" : eCardName}</span>
                            <span style={{ fontSize: 10, color: C.textM }}>{fmtDate(exp.date)}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
                          <div>
                            <div style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmtN(exp.amount)}</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: C.green, marginTop: 2 }}>+{fmtN(exp.rewardEarned)}</div>
                          </div>
                          <button className="del-btn" onClick={() => deleteExp(exp.id)} style={{ opacity: isMobile ? 0.5 : 0, background: C.redD, border: `1px solid ${C.red}20`, borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: C.red, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity 0.2s", flexShrink: 0 }}>✕</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* ═══════════ CHARTS ROW ═══════════ */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 24 }}>

            {/* Rewards by Card */}
            <div style={{ background: C.bg1, border: `1px solid ${C.goldBorder}`, borderRadius: 18, padding: isMobile ? "20px 16px" : "24px 28px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textM, marginBottom: 20 }}>Rewards by Card</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={cardRewardData} layout="vertical" margin={{ left: 0, right: 12, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fill: C.textS, fontSize: 11, fontFamily: C.sans }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip formatter={v => fmtN(v)} />} cursor={false} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={22}>
                    {cardRewardData.map((d, i) => <Cell key={i} fill={d.fill} fillOpacity={0.85} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Donut */}
            <div style={{ background: C.bg1, border: `1px solid ${C.goldBorder}`, borderRadius: 18, padding: isMobile ? "20px 16px" : "24px 28px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textM, marginBottom: 16 }}>Spending Breakdown</div>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ flexShrink: 0 }}>
                  <ResponsiveContainer width={140} height={140}>
                    <PieChart>
                      <Pie data={catData} dataKey="value" innerRadius={40} outerRadius={65} paddingAngle={3} strokeWidth={0}>
                        {catData.map((c, i) => <Cell key={i} fill={c.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {catData.slice(0, 6).map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: C.textS, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.icon} {c.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.text, fontVariantNumeric: "tabular-nums" }}>{fmtK(c.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════ EFFICIENCY ═══════════ */}
          <div style={{ background: C.bg1, border: `1px solid ${C.goldBorder}`, borderRadius: 18, padding: isMobile ? "22px 18px" : "28px 32px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textM, marginBottom: 8 }}>Reward Efficiency</div>
              <div style={{ fontFamily: C.serif, fontSize: isMobile ? 20 : 24, fontWeight: 600, marginBottom: 8 }}>
                {eff >= 90 ? "Excellent strategy" : eff >= 70 ? "Good card usage" : "Room to grow"}
              </div>
              <div style={{ fontSize: 13, color: C.textS, lineHeight: 1.6, maxWidth: 440 }}>
                {eff >= 90
                  ? "You're using the optimal card for almost every category. Maximum value captured."
                  : `By switching to the best card per category, you could earn an additional ${fmtN(Math.round(maxReward - totalReward))} in rewards.`}
              </div>
              {/* Mini bar */}
              <div style={{ marginTop: 16, height: 6, borderRadius: 3, background: C.bg3, width: "100%", maxWidth: 300, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 3, background: eff >= 90 ? C.gold : eff >= 70 ? C.green : C.amber, width: `${eff}%`, transition: "width 1s ease" }} />
              </div>
            </div>
            {/* Score ring */}
            <div style={{ position: "relative", width: 110, height: 110, flexShrink: 0 }}>
              <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r="46" fill="none" stroke={C.bg3} strokeWidth="7" />
                <circle cx="55" cy="55" r="46" fill="none"
                  stroke={eff >= 90 ? C.gold : eff >= 70 ? C.green : C.amber}
                  strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 46 * eff / 100} ${2 * Math.PI * 46}`}
                  transform="rotate(-90 55 55)" style={{ transition: "stroke-dasharray 1.2s ease", filter: `drop-shadow(0 0 6px ${eff >= 90 ? C.gold : eff >= 70 ? C.green : C.amber}40)` }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: eff >= 90 ? C.gold : eff >= 70 ? C.green : C.amber, fontVariantNumeric: "tabular-nums" }}>{eff}%</span>
                <span style={{ fontSize: 9, color: C.textM, textTransform: "uppercase", letterSpacing: "0.1em" }}>Score</span>
              </div>
            </div>
          </div>

          {/* ═══════════ BEST CARD PER CATEGORY ═══════════ */}
          <div style={{ background: C.bg1, border: `1px solid ${C.goldBorder}`, borderRadius: 18, padding: isMobile ? "20px 16px" : "24px 28px", marginBottom: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textM, marginBottom: 18 }}>Best Card by Category</div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
              {CATS.slice(0, 8).map(c => {
                const best = getBest(c.id);
                if (!best) return null;
                const theme = BANK_THEME[best.bank] || { accent: C.gold };
                return (
                  <div key={c.id} style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14,
                    background: C.bg2, border: `1px solid ${C.goldBorder}`, transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = (theme.accent || C.gold) + "40"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.goldBorder; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${c.c}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, border: `1px solid ${c.c}10` }}>{c.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: C.textM, marginBottom: 2 }}>{c.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{best.name.length > 20 ? best.name.slice(0, 20) + "…" : best.name}</div>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: theme.accent || C.gold, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{best.rates?.[c.id] || 0}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ═══════════ SPENDING TREND ═══════════ */}
          <div style={{ background: C.bg1, border: `1px solid ${C.goldBorder}`, borderRadius: 18, padding: isMobile ? "20px 16px" : "24px 28px", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textM }}>Daily Trend — {new Date().toLocaleDateString("en-IN", { month: "long" })}</div>
              <div style={{ display: "flex", background: C.bg2, borderRadius: 10, padding: 3, border: `1px solid ${C.goldBorder}` }}>
                {["spend", "reward"].map(v => (
                  <button key={v} onClick={() => setChartMode(v)}
                    style={{ padding: "6px 16px", fontSize: 11, fontWeight: 500, border: "none", borderRadius: 8, cursor: "pointer", fontFamily: C.sans, textTransform: "capitalize", background: chartMode === v ? C.goldDim : "transparent", color: chartMode === v ? C.gold : C.textM, transition: "all 0.2s" }}>{v === "spend" ? "Spending" : "Rewards"}</button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyData} margin={{ left: -10, right: 4, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="gFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartMode === "spend" ? C.gold : C.green} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={chartMode === "spend" ? C.gold : C.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.goldBorder} vertical={false} />
                <XAxis dataKey="day" tick={{ fill: C.textM, fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
                <YAxis tick={{ fill: C.textM, fontSize: 10 }} axisLine={false} tickLine={false} width={45} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                <Tooltip content={<CustomTooltip formatter={v => fmtN(v)} />} />
                <Area type="monotone" dataKey={chartMode === "spend" ? "spend" : "reward"}
                  stroke={chartMode === "spend" ? C.gold : C.green} fill="url(#gFill)" strokeWidth={2.5}
                  dot={false} activeDot={{ r: 5, fill: chartMode === "spend" ? C.gold : C.green, stroke: C.bg, strokeWidth: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* ═══════════ INSIGHTS ═══════════ */}
          <div style={{ background: C.bg1, border: `1px solid ${C.goldBorder}`, borderRadius: 18, padding: isMobile ? "20px 16px" : "24px 28px" }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textM, marginBottom: 16 }}>Smart Insights</div>
            {[
              { icon: "✈️", text: (() => { const t = catData.find(c => c.name === "Travel"); const best = getBest("travel"); return t && t.value > 0 ? `Travel earned you ${fmtN(t.reward)} in rewards${best ? ` — ${best.name} at ${best.rates.travel}%` : ""}.` : "Track travel expenses to see your reward potential."; })(), c: "#a78bfa" },
              { icon: "🍽️", text: (() => { const d = catData.find(c => c.name === "Dining"); const best = getBest("dining"); return d && d.value > 0 ? `Dining earned you ${fmtN(d.reward)}${best ? ` via ${best.name} at ${best.rates.dining}%` : ""}.` : "Add dining expenses to track restaurant rewards."; })(), c: "#fb923c" },
              { icon: "💡", text: eff < 85 ? `Optimizing card selection could add ${fmtN(Math.round(maxReward - totalReward))} more in monthly rewards.` : "Your card strategy is near-optimal. Keep tracking to maintain efficiency!", c: C.amber },
            ].map((ins, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 18px", borderRadius: 14,
                background: C.bg2, marginBottom: i < 2 ? 10 : 0, borderLeft: `3px solid ${ins.c}`,
                animation: `fadeSlideUp 0.4s ease ${0.1 * i}s both`,
              }}>
                <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{ins.icon}</span>
                <span style={{ fontSize: 13, color: C.textS, lineHeight: 1.65 }}>{ins.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ MOBILE FAB ═══ */}
      {isMobile && !showForm && (
        <button onClick={() => setShowForm(true)} style={{
          position: "fixed", bottom: 90, right: 20, width: 60, height: 60, borderRadius: 18,
          background: `linear-gradient(135deg, ${C.gold}, ${C.goldL})`, border: "none", cursor: "pointer",
          boxShadow: `0 8px 32px ${C.gold}35`, zIndex: 50, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 30, color: "#0a0a0f", fontWeight: 300,
        }}>+</button>
      )}

      {/* ═══ ADD CARD DIALOG ═══ */}
      <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogTitle className="sr-only">Add Cards</DialogTitle>
          <AddCardsDialogContent isMyCard={(id) => CARDS.some(c => c.id === id)} toggleMyCard={(id) => { toggle(id); setShowAddCard(false); }} />
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        *::-webkit-scrollbar { width: 5px; height: 5px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: ${C.bg3}; border-radius: 3px; }
        *::-webkit-scrollbar-thumb:hover { background: ${C.bgHov}; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.7); cursor: pointer; }
        input::placeholder { color: ${C.textM}; }
        button:hover { filter: brightness(1.08); }
        button:active { transform: scale(0.97) !important; }
      `}</style>
    </div>
  );
}
