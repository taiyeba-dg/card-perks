"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ENRICHED_BANKS } from "@/data/banking";

/* ═══════════════════════ FONTS ═══════════════════════ */
const fl = document.createElement("link");
fl.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Outfit:wght@300;400;500;600;700&display=swap";
fl.rel = "stylesheet";
document.head.appendChild(fl);

/* ═══════════════════════ TOKENS ═══════════════════════ */
const C = {
  bg: "#06060b", bg1: "#0c0c13", bg2: "#121219", bg3: "#1a1a25", bgHov: "#1f1f2c",
  gold: "#c9a84c", goldL: "#e8d5a0", goldDim: "rgba(201,168,76,0.12)",
  goldBorder: "rgba(201,168,76,0.10)", goldGlow: "rgba(201,168,76,0.05)",
  text: "#ececec", textS: "#8e8e9e", textM: "#50506a",
  green: "#5eead4", red: "#fb7185", amber: "#fcd34d",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'Outfit', system-ui, sans-serif",
};

/* ═══════════════════════ BANK THEMES ═══════════════════════ */
const BT = {
  hdfc: { name: "HDFC Bank", short: "HDFC", accent: "#3b82f6", accentL: "#93c5fd", g1: "#0c1a30", g2: "#080e1c", icon: "🏦" },
  icici: { name: "ICICI Bank", short: "ICICI", accent: "#ef4444", accentL: "#fca5a5", g1: "#2a0a0e", g2: "#180608", icon: "🏛️" },
  axis: { name: "Axis Bank", short: "Axis", accent: "#8b5cf6", accentL: "#c4b5fd", g1: "#1a0e30", g2: "#100820", icon: "⚡" },
  sbi: { name: "State Bank of India", short: "SBI", accent: "#0ea5e9", accentL: "#7dd3fc", g1: "#081a28", g2: "#060e18", icon: "🏗️" },
  kotak: { name: "Kotak Mahindra", short: "Kotak", accent: "#f43f5e", accentL: "#fda4af", g1: "#280a12", g2: "#180610", icon: "🔴" },
  indusind: { name: "IndusInd Bank", short: "IndusInd", accent: "#f97316", accentL: "#fdba74", g1: "#281408", g2: "#180c04", icon: "🌀" },
  yes: { name: "Yes Bank", short: "Yes", accent: "#22c55e", accentL: "#86efac", g1: "#0a2010", g2: "#061408", icon: "✅" },
  idfc: { name: "IDFC First", short: "IDFC", accent: "#a855f7", accentL: "#d8b4fe", g1: "#1c0a30", g2: "#120620", icon: "💜" },
  federal: { name: "Federal Bank", short: "Federal", accent: "#eab308", accentL: "#fde047", g1: "#201c08", g2: "#141204", icon: "🟡" },
  bob: { name: "Bank of Baroda", short: "BoB", accent: "#f97316", accentL: "#fb923c", g1: "#281408", g2: "#1a0c06", icon: "🟠" },
  hsbc: { name: "HSBC India", short: "HSBC", accent: "#dc2626", accentL: "#f87171", g1: "#280808", g2: "#1a0404", icon: "🔶" },
  sc: { name: "Standard Chartered", short: "StanChart", accent: "#059669", accentL: "#6ee7b7", g1: "#061c12", g2: "#04120a", icon: "🟢" },
};

const TIER_C = {
  basic: { accent: "#94a3b8" }, preferred: { accent: "#e8d5a0" },
  premium: { accent: "#c9a84c" }, ultra: { accent: "#f5ecd2" },
};

/* ═══════════════════════ BANK DATA (12 BANKS) ═══════════════════════ */
/* Banking data imported from src/data/banking.ts — single source of truth */
const BANKS = ENRICHED_BANKS;

/* eslint-disable */ const _OLD = {
  _hdfc: {
    tiers: [
      { name: "Classic", tier: "basic", eligibility: "₹1L Savings AMB OR ₹2L Current OR ₹1L salary OR ₹5L Sav+FD", eligNum: { s: 100000, c: 200000, sal: 100000, n: 500000 }, card: "HDFC Classic", dl: "—", il: "—", locker: "Standard", demat: "Standard", rm: false, perks: ["Free NEFT/RTGS online", "Free chequebook", "Nil non-maintenance charges"] },
      { name: "Preferred", tier: "preferred", eligibility: "₹2L Savings AMB OR ₹5L Current OR ₹2L salary OR ₹15L Sav+FD", eligNum: { s: 200000, c: 500000, sal: 200000, n: 1500000 }, card: "Preferred Platinum Chip", dl: "4/year", il: "—", locker: "50% off", demat: "Free AMC (1 txn)", rm: true, perks: ["Preferred Platinum Debit", "Dedicated RM", "50% locker discount", "Premium welcome kit"] },
      { name: "Imperia", tier: "premium", eligibility: "₹10L Savings AMB OR ₹15L Current OR ₹3L salary OR ₹30L Sav+FD", eligNum: { s: 1000000, c: 1500000, sal: 300000, n: 3000000 }, card: "Imperia Platinum Chip", dl: "Unlimited", il: "6/year", locker: "Free (1st group)", demat: "Free AMC for life", rm: true, perks: ["Unlimited domestic lounge", "6 intl. lounge/yr", "Free locker", "Imperia Platinum Debit", "Lifestyle privileges"] },
      { name: "Private Banking", tier: "ultra", eligibility: "₹10 Crores+ NRV. Invitation only.", eligNum: { s: 100000000, c: 100000000, sal: null, n: null }, card: "HDFC Private World", dl: "Unlimited", il: "Unlimited", locker: "Complimentary premium", demat: "Free + IPO priority", rm: true, perks: ["Personalized wealth assessment", "Priority IPO", "Premium locker", "Global concierge", "Exclusive onboarding"] },
    ],
    family: { max: 8, members: ["Spouse", "Parents", "Children"], elig: "Pool balances across up to 8 family members", benefits: ["Pooled balance for tier", "Shared locker", "Combined SmartStatement", "Single family RM"], insight: "8 members can pool balances for higher tiers" },
  },
  icici: {
    tiers: [
      { name: "Savings", tier: "basic", eligibility: "₹10,000 Savings AMB", eligNum: { s: 10000, c: null, sal: null, n: null }, card: "ICICI Coral", dl: "—", il: "—", locker: "Standard", demat: "Standard", rm: false, perks: ["Free online NEFT/RTGS", "Coral debit card", "iMobile Pay"] },
      { name: "Privilege", tier: "preferred", eligibility: "₹2L+ Savings OR ₹5L+ Current AMB", eligNum: { s: 200000, c: 500000, sal: null, n: null }, card: "ICICI Sapphiro", dl: "4/year", il: "2/year", locker: "Discounted", demat: "Free AMC", rm: true, perks: ["Sapphiro Debit Card", "Dedicated RM", "Priority servicing", "Preferential FD rates"] },
      { name: "Wealth Mgmt", tier: "premium", eligibility: "₹50L+ NRV (Savings + FD + Investments)", eligNum: { s: 5000000, c: 5000000, sal: null, n: 5000000 }, card: "Wealth Debit", dl: "Unlimited", il: "Unlimited", locker: "Free", demat: "Free + Research", rm: true, perks: ["Dedicated Wealth Manager", "Unlimited lounge", "Curated advisory", "Exclusive events", "Tax planning"] },
    ],
    family: { max: 5, members: ["Spouse", "Parents", "Children"], elig: "Combined NRV ₹50L for Wealth Management", benefits: ["Combined NRV qualification", "Family health insurance", "Shared lounge pool", "Single RM"], insight: "₹50L combined NRV across 5 members for Wealth tier" },
  },
  axis: {
    tiers: [
      { name: "Easy Access", tier: "basic", eligibility: "₹25,000 Savings AMB", eligNum: { s: 25000, c: null, sal: null, n: null }, card: "Classic Debit", dl: "—", il: "—", locker: "Standard", demat: "Standard", rm: false, perks: ["Free NEFT/IMPS", "Basic debit card"] },
      { name: "Priority", tier: "preferred", eligibility: "₹2L Savings OR ₹5L Current OR ₹2L salary", eligNum: { s: 200000, c: 500000, sal: 200000, n: null }, card: "Priority Platinum", dl: "4/year", il: "—", locker: "25% off", demat: "Free AMC", rm: true, perks: ["Priority Platinum Debit", "RM assigned", "Priority branches"] },
      { name: "Burgundy", tier: "premium", eligibility: "₹30L+ NRV across all products", eligNum: { s: 3000000, c: 3000000, sal: null, n: 3000000 }, card: "Burgundy Debit", dl: "Unlimited", il: "8/year", locker: "Free", demat: "Free lifetime", rm: true, perks: ["Burgundy Debit Card", "Wealth Advisor", "Exclusive investments", "Concierge", "Golf benefits"] },
      { name: "Burgundy Private", tier: "ultra", eligibility: "₹5 Crores+ NRV. Invitation only.", eligNum: { s: 50000000, c: 50000000, sal: null, n: null }, card: "Burgundy Private World", dl: "Unlimited", il: "Unlimited", locker: "Premium free", demat: "Free + IPO", rm: true, perks: ["Private Banker", "Bespoke advisory", "Global concierge", "Art & lifestyle events"] },
    ],
    family: { max: 6, members: ["Spouse", "Parents", "Children"], elig: "₹30L combined NRV for Burgundy", benefits: ["Pooled NRV", "Family insurance", "Combined lounge", "Single Advisor"], insight: "6 family members can pool for Burgundy tier" },
  },
  sbi: {
    tiers: [
      { name: "Regular", tier: "basic", eligibility: "No minimum (Basic Savings)", eligNum: { s: 0, c: null, sal: null, n: null }, card: "SBI Classic", dl: "—", il: "—", locker: "Standard", demat: "Standard", rm: false, perks: ["Zero balance option", "YONO access", "Free NEFT"] },
      { name: "Gold", tier: "preferred", eligibility: "₹1L Savings OR ₹2L Current AMB", eligNum: { s: 100000, c: 200000, sal: null, n: null }, card: "SBI Gold", dl: "2/year", il: "—", locker: "25% off", demat: "Reduced AMC", rm: false, perks: ["Gold Debit Card", "Preferential FD rates", "Free demand drafts"] },
      { name: "Wealth", tier: "premium", eligibility: "₹20L+ NRV", eligNum: { s: 2000000, c: 2000000, sal: null, n: 2000000 }, card: "Wealth Debit", dl: "Unlimited", il: "4/year", locker: "Free", demat: "Free AMC", rm: true, perks: ["Dedicated RM", "Wealth Debit Card", "Priority service", "Investment advisory"] },
    ],
    family: { max: 4, members: ["Spouse", "Parents", "Children"], elig: "Combined NRV for Wealth tier", benefits: ["Pooled balance", "Shared locker", "Combined statement", "Single RM"], insight: "4 members can pool NRV for Wealth tier" },
  },
  kotak: {
    tiers: [
      { name: "Classic", tier: "basic", eligibility: "₹10K AMB (811: Zero balance)", eligNum: { s: 10000, c: null, sal: null, n: null }, card: "Kotak Debit", dl: "—", il: "—", locker: "Standard", demat: "Standard", rm: false, perks: ["811 zero-balance", "Free digital banking"] },
      { name: "Privy League", tier: "preferred", eligibility: "₹5L Savings OR ₹10L Current OR ₹7.5L salary", eligNum: { s: 500000, c: 1000000, sal: 750000, n: null }, card: "Privy Signature", dl: "4/year", il: "2/year", locker: "50% off", demat: "Free AMC", rm: true, perks: ["Privy Signature Debit", "Dedicated RM", "Preferential rates"] },
      { name: "Privy Signature", tier: "premium", eligibility: "₹30L+ NRV across Kotak products", eligNum: { s: 3000000, c: 3000000, sal: null, n: 3000000 }, card: "Privy Insignia", dl: "Unlimited", il: "8/year", locker: "Free", demat: "Free lifetime", rm: true, perks: ["Insignia Debit", "Wealth Manager", "Exclusive access", "Golf benefits", "Health check-up"] },
    ],
    family: { max: 6, members: ["Spouse", "Parents", "Children"], elig: "₹30L combined NRV for Privy Signature", benefits: ["Combined NRV", "Family health check", "Shared lounge", "Single Manager"], insight: "6 members pool for Privy League benefits" },
  },
  indusind: {
    tiers: [
      { name: "Classic", tier: "basic", eligibility: "₹10K Savings AMB", eligNum: { s: 10000, c: null, sal: null, n: null }, card: "IndusInd Debit", dl: "—", il: "—", locker: "Standard", demat: "Standard", rm: false, perks: ["Free NEFT/RTGS", "Basic debit card"] },
      { name: "Indus Select", tier: "preferred", eligibility: "₹2L Savings OR ₹5L Current AMB", eligNum: { s: 200000, c: 500000, sal: null, n: null }, card: "Select Debit", dl: "4/year", il: "—", locker: "Discounted", demat: "Free AMC", rm: true, perks: ["Select Debit Card", "Dedicated RM", "Priority servicing"] },
      { name: "Indus Pioneer", tier: "premium", eligibility: "₹25L+ NRV", eligNum: { s: 2500000, c: 2500000, sal: null, n: 2500000 }, card: "Pioneer Debit", dl: "Unlimited", il: "6/year", locker: "Free", demat: "Free lifetime", rm: true, perks: ["Pioneer Debit Card", "Wealth Advisor", "Unlimited lounge", "Concierge services"] },
    ],
    family: { max: 4, members: ["Spouse", "Parents", "Children"], elig: "Combined NRV for Pioneer tier", benefits: ["Pooled NRV", "Shared locker", "Single RM", "Combined statements"], insight: "4 members pool for Pioneer benefits" },
  },
  yes: {
    tiers: [
      { name: "Savings", tier: "basic", eligibility: "₹10K Savings AMB", eligNum: { s: 10000, c: null, sal: null, n: null }, card: "Yes Debit", dl: "—", il: "—", locker: "Standard", demat: "Standard", rm: false, perks: ["Free NEFT/RTGS", "Digital banking"] },
      { name: "Yes Premia", tier: "preferred", eligibility: "₹3L Savings OR ₹5L Current AMB", eligNum: { s: 300000, c: 500000, sal: null, n: null }, card: "Premia Debit", dl: "4/year", il: "2/year", locker: "Discounted", demat: "Free AMC", rm: true, perks: ["Premia Debit Card", "Dedicated RM", "Preferential rates"] },
      { name: "Yes Private", tier: "premium", eligibility: "₹1 Crore+ NRV", eligNum: { s: 10000000, c: 10000000, sal: null, n: 10000000 }, card: "Private Debit", dl: "Unlimited", il: "Unlimited", locker: "Free premium", demat: "Free lifetime", rm: true, perks: ["Private Debit Card", "Wealth Advisory", "Unlimited lounge", "Exclusive events"] },
    ],
    family: { max: 4, members: ["Spouse", "Parents", "Children"], elig: "Combined NRV for Private tier", benefits: ["Pooled NRV", "Family insurance", "Shared lounge", "Wealth Advisor"], insight: "Pool ₹1Cr+ combined for Yes Private" },
  },
  idfc: {
    tiers: [
      { name: "Savings", tier: "basic", eligibility: "₹10K AMB (or Zero via salary)", eligNum: { s: 10000, c: null, sal: 0, n: null }, card: "IDFC Classic", dl: "—", il: "—", locker: "N/A", demat: "Standard", rm: false, perks: ["High savings rate", "Free NEFT/IMPS", "Zero balance salary a/c"] },
      { name: "Select", tier: "preferred", eligibility: "₹5L Savings OR ₹10L Current AMB", eligNum: { s: 500000, c: 1000000, sal: null, n: null }, card: "Select Debit", dl: "4/year", il: "—", locker: "N/A", demat: "Free AMC", rm: true, perks: ["Select Debit Card", "Relationship Manager", "Preferential FD rates"] },
      { name: "Wealth", tier: "premium", eligibility: "₹30L+ NRV", eligNum: { s: 3000000, c: 3000000, sal: null, n: 3000000 }, card: "Wealth Debit", dl: "Unlimited", il: "4/year", locker: "N/A", demat: "Free lifetime", rm: true, perks: ["Wealth Debit Card", "Dedicated Wealth RM", "Exclusive FD rates", "Priority processing"] },
    ],
    family: { max: 4, members: ["Spouse", "Parents", "Children"], elig: "Combined NRV for Wealth tier", benefits: ["Pooled NRV", "Family FD benefits", "Single RM", "Combined statements"], insight: "Pool NRV with 4 members for Wealth access" },
  },
  federal: {
    tiers: [
      { name: "Savings", tier: "basic", eligibility: "₹10K Savings AMB", eligNum: { s: 10000, c: null, sal: null, n: null }, card: "Federal Debit", dl: "—", il: "—", locker: "Standard", demat: "Standard", rm: false, perks: ["FedMobile banking", "Free NEFT/RTGS"] },
      { name: "Fed Prestige", tier: "preferred", eligibility: "₹2L Savings OR ₹5L Current AMB", eligNum: { s: 200000, c: 500000, sal: null, n: null }, card: "Prestige Debit", dl: "2/year", il: "—", locker: "Discounted", demat: "Free AMC", rm: true, perks: ["Prestige Debit Card", "RM assigned", "Preferential rates"] },
      { name: "Imperia", tier: "premium", eligibility: "₹25L+ NRV", eligNum: { s: 2500000, c: 2500000, sal: null, n: 2500000 }, card: "Imperia Debit", dl: "Unlimited", il: "4/year", locker: "Free", demat: "Free lifetime", rm: true, perks: ["Imperia Debit Card", "Wealth Advisory", "Unlimited lounge", "Priority service"] },
    ],
    family: { max: 4, members: ["Spouse", "Parents", "Children"], elig: "Combined NRV for Imperia tier", benefits: ["Pooled NRV", "Shared locker", "Single RM"], insight: "4 members pool for Federal Imperia" },
  },
  bob: {
    tiers: [
      { name: "Regular", tier: "basic", eligibility: "₹5K Savings AMB", eligNum: { s: 5000, c: null, sal: null, n: null }, card: "BoB Debit", dl: "—", il: "—", locker: "Standard", demat: "Standard", rm: false, perks: ["bob World app", "Free NEFT/RTGS"] },
      { name: "Radiance", tier: "preferred", eligibility: "₹2L Savings OR ₹5L Current AMB", eligNum: { s: 200000, c: 500000, sal: null, n: null }, card: "Radiance Debit", dl: "2/year", il: "—", locker: "Discounted", demat: "Free AMC", rm: true, perks: ["Radiance Debit Card", "RM assigned", "Priority servicing"] },
      { name: "Privilege", tier: "premium", eligibility: "₹25L+ NRV", eligNum: { s: 2500000, c: 2500000, sal: null, n: 2500000 }, card: "Privilege Debit", dl: "Unlimited", il: "4/year", locker: "Free", demat: "Free lifetime", rm: true, perks: ["Privilege Debit Card", "Wealth Advisory", "Unlimited lounge"] },
    ],
    family: { max: 4, members: ["Spouse", "Parents", "Children"], elig: "Combined NRV for Privilege tier", benefits: ["Pooled NRV", "Shared locker", "Single RM"], insight: "4 members pool for BoB Privilege" },
  },
  hsbc: {
    tiers: [
      { name: "Advance", tier: "basic", eligibility: "₹1L Savings AMB", eligNum: { s: 100000, c: null, sal: null, n: null }, card: "HSBC Advance", dl: "—", il: "—", locker: "Standard", demat: "N/A", rm: false, perks: ["Free FX transfers", "Global view", "Advance card"] },
      { name: "Premier", tier: "premium", eligibility: "₹30L+ Total Relationship Balance", eligNum: { s: 3000000, c: 3000000, sal: null, n: 3000000 }, card: "HSBC Premier", dl: "Unlimited", il: "Unlimited", locker: "Free", demat: "N/A", rm: true, perks: ["Premier Debit Card", "Unlimited global lounge", "Global Premier transfers", "Wealth advisory", "Preferential FX rates"] },
    ],
    family: { max: 4, members: ["Spouse", "Parents", "Children"], elig: "₹30L TRB for Premier designation", benefits: ["Family Premier status", "Global transfers", "Shared lounge", "Single RM"], insight: "Premier status extends globally across 30+ countries" },
  },
  sc: {
    tiers: [
      { name: "Classic", tier: "basic", eligibility: "₹1L Savings AMB", eligNum: { s: 100000, c: null, sal: null, n: null }, card: "SC Debit", dl: "—", il: "—", locker: "N/A", demat: "N/A", rm: false, perks: ["SC Mobile app", "Free NEFT/RTGS"] },
      { name: "Priority", tier: "preferred", eligibility: "₹10L+ Total Relationship Value", eligNum: { s: 1000000, c: 1000000, sal: null, n: 1000000 }, card: "Priority Debit", dl: "4/year", il: "2/year", locker: "N/A", demat: "N/A", rm: true, perks: ["Priority Debit", "RM assigned", "Preferential rates", "Priority Pass"] },
      { name: "Priority Private", tier: "ultra", eligibility: "₹3.5 Crore+ AUM. Invitation only.", eligNum: { s: 35000000, c: 35000000, sal: null, n: null }, card: "Private Debit", dl: "Unlimited", il: "Unlimited", locker: "N/A", demat: "N/A", rm: true, perks: ["Private Banker", "Bespoke investment", "Global banking", "Unlimited lounge", "Exclusive events"] },
    ],
    family: { max: 4, members: ["Spouse", "Parents", "Children"], elig: "₹10L combined TRV for Priority", benefits: ["Family Priority status", "Global banking", "Shared lounge", "Single RM"], insight: "Priority benefits extend across SC's global network" },
  },
};

const BANK_IDS = Object.keys(BANKS);
const ROWS = [
  { key: "card", label: "Card", type: "chip" },
  { key: "dl", label: "Dom. Lounge", type: "hl" },
  { key: "il", label: "Intl. Lounge", type: "hl" },
  { key: "locker", label: "Locker", type: "text" },
  { key: "demat", label: "Demat", type: "text" },
  { key: "rm", label: "RM", type: "bool" },
];

/* ═══════════════════════ TOOLTIP ═══════════════════════ */
function Tip({ text, children }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", cursor: "help" }} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span style={{
          position: "absolute", bottom: "120%", left: "50%", transform: "translateX(-50%)",
          background: C.bg3, color: C.text, fontSize: 12, padding: "8px 14px", borderRadius: 10,
          border: `1px solid ${C.goldBorder}`, whiteSpace: "nowrap", zIndex: 50,
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)", animation: "tipIn 0.15s ease",
          pointerEvents: "none", fontWeight: 400,
        }}>{text}</span>
      )}
    </span>
  );
}

/* ═══════════════════════ PARTICLES ═══════════════════════ */
function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, particles = [], raf;
    const resize = () => { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 0.5, o: Math.random() * 0.4 + 0.1,
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,168,76,${p.o})`; ctx.fill();
      });
      // Lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(201,168,76,${0.06 * (1 - dist / 120)})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

/* ═══════════════════════ MAIN ═══════════════════════ */
export default function BankingGuides() {
  const [tab, setTab] = useState("wealth");
  const [bankId, setBankId] = useState("hdfc");
  const [showElig, setShowElig] = useState(false);
  const [eligAmt, setEligAmt] = useState("");
  const [eligType, setEligType] = useState("savings");
  const [eligResults, setEligResults] = useState(null);
  const [mobileTier, setMobileTier] = useState(0);
  const [expanded, setExpanded] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [compare, setCompare] = useState(null); // { a: bankId, b: bankId }
  const [familyView, setFamilyView] = useState("cards"); // "cards" | "compare"
  const [transKey, setTransKey] = useState(0);
  const scrollRef = useRef(null);
  const stickyRef = useRef(null);

  useEffect(() => { const c = () => setIsMobile(window.innerWidth < 960); c(); window.addEventListener("resize", c); return () => window.removeEventListener("resize", c); }, []);
  useEffect(() => { const s = () => { if (stickyRef.current) setIsSticky(stickyRef.current.getBoundingClientRect().top <= 0); }; window.addEventListener("scroll", s); return () => window.removeEventListener("scroll", s); }, []);

  const switchBank = (id) => { setBankId(id); setMobileTier(0); setExpanded({}); setTransKey(k => k + 1); };

  const bt = BT[bankId]; const bank = BANKS[bankId]; const tiers = bank?.tiers || [];
  const toggle = k => setExpanded(p => ({ ...p, [k]: !p[k] }));
  const scrollToTier = i => { setMobileTier(i); scrollRef.current?.children[i]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" }); };

  // ─── ELIGIBILITY CALC WITH BEST BANK ───
  const calcElig = () => {
    const amt = parseFloat(eligAmt.replace(/,/g, ""));
    if (isNaN(amt) || amt <= 0) return;
    const res = BANK_IDS.map(bid => {
      const b = BANKS[bid]; const theme = BT[bid]; let best = null;
      for (let i = b.tiers.length - 1; i >= 0; i--) {
        const t = b.tiers[i]; const n = t.eligNum;
        const m = (eligType === "savings" && n.s !== null && amt >= n.s) || (eligType === "current" && n.c !== null && amt >= n.c) || (eligType === "salary" && n.sal !== null && amt >= n.sal) || (eligType === "combined" && n.n !== null && amt >= n.n);
        if (m) { best = t; break; }
      }
      return { bid, ...theme, tier: best, total: b.tiers.length, idx: best ? b.tiers.indexOf(best) : -1 };
    }).sort((a, b) => b.idx - a.idx); // Sort best tier first
    setEligResults(res);
  };

  const bestBank = eligResults?.find(r => r.tier && r.idx === Math.max(...eligResults.filter(x => x.tier).map(x => x.idx)));

  // ─── CROSS BANK COMPARE ───
  const compA = compare ? BANKS[compare.a] : null;
  const compB = compare ? BANKS[compare.b] : null;
  const compBtA = compare ? BT[compare.a] : null;
  const compBtB = compare ? BT[compare.b] : null;

  // ─── FAMILY COMPARE DATA ───
  const familyCompare = useMemo(() => BANK_IDS.map(bid => ({ bid, ...BT[bid], ...BANKS[bid].family })), []);

  // ─── CELL RENDERER ───
  const renderCell = (val, type, tier) => {
    const tc = TIER_C[tier];
    if (type === "bool") return val ? <span style={{ background: `${C.gold}12`, color: C.gold, padding: "3px 12px", borderRadius: 7, fontSize: 11, fontWeight: 600, border: `1px solid ${C.gold}15` }}>✓ Yes</span> : <span style={{ color: C.textM }}>✗</span>;
    if (type === "chip") return <span style={{ background: `${tc.accent}10`, color: tc.accent, padding: "4px 12px", borderRadius: 7, fontSize: 11, fontWeight: 600, border: `1px solid ${tc.accent}15`, display: "inline-block", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</span>;
    if (type === "hl") return <span style={{ color: val === "—" || val === "N/A" ? C.textM : val === "Unlimited" ? C.green : C.text, fontWeight: val === "Unlimited" ? 600 : 400, fontSize: 13 }}>{val === "Unlimited" ? "♾ Unlimited" : val}</span>;
    return <span style={{ color: val === "—" || val === "N/A" ? C.textM : C.text, fontSize: 13 }}>{val}</span>;
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: C.sans, color: C.text }}>

      {/* ═══════════════════ HERO WITH PARTICLES ═══════════════════ */}
      <div style={{ position: "relative", overflow: "hidden", padding: isMobile ? "56px 20px 44px" : "80px 28px 64px", textAlign: "center" }}>
        <Particles />
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 900px 500px at 50% 35%, ${C.gold}0a 0%, transparent 70%)`, pointerEvents: "none" }} />
        {/* Animated gradient orbs */}
        <div className="orb orb1" style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${C.gold}06 0%, transparent 70%)`, top: "10%", left: "-5%", pointerEvents: "none" }} />
        <div className="orb orb2" style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${C.gold}04 0%, transparent 70%)`, bottom: "0", right: "5%", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${C.gold}08`, border: `1px solid ${C.gold}15`, borderRadius: 24, padding: "7px 20px", marginBottom: 28, backdropFilter: "blur(8px)" }}>
            <span style={{ fontSize: 13 }}>🏦</span>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: C.gold }}>Banking Guides</span>
          </div>
          <h1 style={{ fontFamily: C.serif, fontSize: isMobile ? 40 : 60, fontWeight: 700, margin: "0 0 8px", lineHeight: 1.08, letterSpacing: "-0.02em" }}>
            Understand{" "}
            <span style={{ color: C.gold, fontStyle: "italic", position: "relative", display: "inline-block" }}>
              Wealth Tiers
              <svg style={{ position: "absolute", bottom: -6, left: 0, width: "100%", height: 10, overflow: "visible" }} viewBox="0 0 200 10"><path d="M0 7 Q40 0 80 5 T160 3 T200 6" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" opacity="0.35" /></svg>
            </span>
          </h1>
          <p style={{ fontSize: isMobile ? 15 : 17, color: C.textS, maxWidth: 560, margin: "18px auto 44px", lineHeight: 1.65 }}>
            Compare wealth banking programs & family benefits across <strong style={{ color: C.goldL }}>12 Indian banks</strong>
          </p>

          {/* Toggle */}
          <div style={{ display: "inline-flex", background: C.bg1, borderRadius: 16, padding: 5, border: `1px solid ${C.goldBorder}`, position: "relative", boxShadow: `0 4px 30px ${C.goldGlow}` }}>
            <div style={{ position: "absolute", top: 5, left: tab === "wealth" ? 5 : "50%", width: "calc(50% - 5px)", height: "calc(100% - 10px)", background: `linear-gradient(135deg, ${C.gold}, ${C.goldL})`, borderRadius: 12, transition: "left 0.35s cubic-bezier(0.4,0,0.2,1)", zIndex: 0, boxShadow: `0 2px 16px ${C.gold}30` }} />
            {[{ id: "wealth", icon: "💎", l: "Wealth Banking" }, { id: "family", icon: "👨‍👩‍👧‍👦", l: "Family Banking" }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ position: "relative", zIndex: 1, padding: isMobile ? "13px 22px" : "14px 36px", border: "none", borderRadius: 12, background: "transparent", cursor: "pointer", fontFamily: C.sans, fontSize: isMobile ? 13 : 15, fontWeight: 600, color: tab === t.id ? "#0a0a0f" : C.textS, display: "flex", alignItems: "center", gap: 8, transition: "color 0.3s" }}>
                <span>{t.icon}</span>{isMobile ? t.l.split(" ")[0] : t.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════ ELIGIBILITY ═══════════════════ */}
      <div style={{ maxWidth: 1200, margin: "0 auto 24px", padding: "0 20px" }}>
        <div style={{ background: C.bg1, border: `1px solid ${showElig ? C.gold + "20" : C.goldBorder}`, borderRadius: 20, overflow: "hidden", transition: "all 0.3s", boxShadow: showElig ? `0 0 50px ${C.goldGlow}` : "none" }}>
          <button onClick={() => { setShowElig(!showElig); setEligResults(null); }} style={{ width: "100%", padding: isMobile ? "18px 20px" : "22px 32px", border: "none", background: "transparent", cursor: "pointer", fontFamily: C.sans, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${C.gold}15, ${C.gold}05)`, border: `1px solid ${C.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎯</div>
              <div style={{ textAlign: "left" }}><div style={{ fontSize: 16, fontWeight: 600 }}>Check My Eligibility</div><div style={{ fontSize: 12, color: C.textS, marginTop: 2 }}>Find the best tier across 12 banks</div></div>
            </div>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: C.bg3, display: "flex", alignItems: "center", justifyContent: "center", color: C.gold, transform: showElig ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s", fontSize: 14 }}>▾</div>
          </button>
          <div style={{ maxHeight: showElig ? 1000 : 0, overflow: "hidden", transition: "max-height 0.5s cubic-bezier(0.4,0,0.2,1)" }}>
            <div style={{ padding: isMobile ? "0 20px 28px" : "0 32px 32px" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                {[{ id: "savings", l: "Savings AMB" }, { id: "current", l: "Current AMB" }, { id: "salary", l: "Salary" }, { id: "combined", l: "NRV / Combined" }].map(t => (
                  <button key={t.id} onClick={() => setEligType(t.id)} style={{ padding: "10px 18px", borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: C.sans, border: `1.5px solid ${eligType === t.id ? C.gold + "60" : C.goldBorder}`, background: eligType === t.id ? C.goldDim : "transparent", color: eligType === t.id ? C.gold : C.textS, transition: "all 0.2s" }}>{t.l}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: "flex", alignItems: "center", background: C.bg, borderRadius: 16, padding: "14px 18px", border: `1.5px solid ${eligAmt ? C.gold + "50" : C.goldBorder}` }}>
                    <span style={{ fontSize: 28, fontWeight: 300, color: C.textM, fontFamily: C.serif, marginRight: 8 }}>₹</span>
                    <input type="text" inputMode="numeric" placeholder="Enter amount" value={eligAmt} onChange={e => { const r = e.target.value.replace(/[^0-9]/g, ""); setEligAmt(r ? parseInt(r).toLocaleString("en-IN") : ""); }} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: C.text, fontSize: 26, fontWeight: 700, fontFamily: C.sans, fontVariantNumeric: "tabular-nums" }} />
                  </div>
                </div>
                <button onClick={calcElig} style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldL})`, color: "#0a0a0f", border: "none", borderRadius: 14, padding: "16px 36px", fontWeight: 700, cursor: "pointer", fontFamily: C.sans, fontSize: 15, boxShadow: `0 4px 20px ${C.gold}25`, marginBottom: 1 }}>Check →</button>
              </div>

              {/* Results with BEST BANK recommendation */}
              {eligResults && (
                <div style={{ marginTop: 28, animation: "fadeUp 0.4s ease" }}>
                  {bestBank && (
                    <div style={{ padding: "18px 24px", borderRadius: 16, background: `linear-gradient(135deg, ${bestBank.g1}, ${bestBank.g2})`, border: `1.5px solid ${bestBank.accent}30`, marginBottom: 18, display: "flex", alignItems: "center", gap: 16, animation: "fadeUp 0.3s ease", boxShadow: `0 4px 24px ${bestBank.accent}10` }}>
                      <div style={{ width: 50, height: 50, borderRadius: 14, background: `${bestBank.accent}15`, border: `1px solid ${bestBank.accent}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🏆</div>
                      <div>
                        <div style={{ fontSize: 11, color: C.textS, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, marginBottom: 4 }}>Best Match</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: bestBank.accentL }}>{bestBank.name} — <span style={{ fontFamily: C.serif }}>{bestBank.tier.name}</span></div>
                        <div style={{ fontSize: 12, color: C.textS, marginTop: 4 }}>Highest tier you qualify for across all 12 banks</div>
                      </div>
                    </div>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 10 }}>
                    {eligResults.map((r, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 14, background: r.tier ? `linear-gradient(145deg, ${r.g1}, ${r.g2})` : C.bg2, border: `1px solid ${r.tier ? r.accent + "20" : C.goldBorder}`, animation: `fadeUp 0.3s ease ${i * 0.04}s both`, position: "relative", overflow: "hidden" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${r.accent}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{r.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{r.short}</div>
                          {r.tier ? (
                            <div style={{ fontSize: 14, fontWeight: 700, color: r.accentL }}>{r.tier.name}</div>
                          ) : <div style={{ fontSize: 12, color: C.textM }}>Below min</div>}
                        </div>
                        {r.tier && (
                          <div style={{ display: "flex", gap: 2 }}>
                            {Array.from({ length: r.total }, (_, ti) => <div key={ti} style={{ width: 12, height: 3, borderRadius: 2, background: ti <= r.idx ? r.accent : `${r.accent}15` }} />)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ BANK SELECTOR (+ sticky mobile bottom) ═══════════════════ */}
      <div ref={stickyRef} style={{ position: "sticky", top: 0, zIndex: 30, padding: "12px 0", background: isSticky ? `${C.bg}e8` : "transparent", backdropFilter: isSticky ? "blur(20px) saturate(1.2)" : "none", borderBottom: isSticky ? `1px solid ${C.goldBorder}` : "1px solid transparent", transition: "all 0.3s" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", alignItems: "center" }}>
          {BANK_IDS.map(bid => {
            const b = BT[bid]; const active = bankId === bid;
            return (
              <button key={bid} onClick={() => switchBank(bid)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: C.sans, whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.25s", background: active ? `linear-gradient(135deg, ${b.g1}, ${b.g2})` : "transparent", border: `1.5px solid ${active ? b.accent + "50" : C.goldBorder}`, color: active ? b.accentL : C.textS, boxShadow: active ? `0 2px 10px ${b.accent}12` : "none" }}>
                <span style={{ fontSize: 12 }}>{b.icon}</span>{b.short}
              </button>
            );
          })}

          {/* Cross-bank compare button */}
          {tab === "wealth" && !compare && (
            <button onClick={() => setCompare({ a: "hdfc", b: "icici" })} style={{ marginLeft: "auto", padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: C.sans, background: C.goldDim, border: `1px solid ${C.goldBorder}`, color: C.gold, flexShrink: 0, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
              ⚖️ Compare Banks
            </button>
          )}
          {compare && (
            <button onClick={() => setCompare(null)} style={{ marginLeft: "auto", padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: C.sans, background: `${C.red}12`, border: `1px solid ${C.red}25`, color: C.red, flexShrink: 0 }}>
              ✕ Exit Compare
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════════ CONTENT ═══════════════════ */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "24px 16px 100px" : "36px 20px 80px" }}>

        {/* ════════════ CROSS-BANK COMPARE MODE ════════════ */}
        {compare && tab === "wealth" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
              <h2 style={{ fontFamily: C.serif, fontSize: isMobile ? 22 : 30, fontWeight: 600, margin: 0 }}>Compare <span style={{ color: C.gold }}>Banks</span></h2>
              <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                {["a", "b"].map(k => (
                  <select key={k} value={compare[k]} onChange={e => setCompare({ ...compare, [k]: e.target.value })} style={{ background: C.bg2, border: `1px solid ${C.goldBorder}`, borderRadius: 10, padding: "8px 14px", color: C.text, fontFamily: C.sans, fontSize: 13, outline: "none", cursor: "pointer" }}>
                    {BANK_IDS.map(bid => <option key={bid} value={bid}>{BT[bid].short}</option>)}
                  </select>
                ))}
              </div>
            </div>
            {compA && compB && (
              <div style={{ background: C.bg1, border: `1px solid ${C.goldBorder}`, borderRadius: 20, overflow: "hidden", boxShadow: `0 0 60px ${C.goldGlow}` }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "18px 24px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.textM, background: C.bg2, borderBottom: `1px solid ${C.goldBorder}`, width: 120 }}>Feature</th>
                      {compA.tiers.map((t, i) => <th key={`a-${i}`} style={{ padding: "18px 16px", textAlign: "center", borderBottom: `1px solid ${C.goldBorder}`, background: `${compBtA.accent}04`, borderTop: `3px solid ${compBtA.accent}` }}><div style={{ fontSize: 10, color: compBtA.accentL, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{compBtA.short}</div><div style={{ fontFamily: C.serif, fontSize: 15, color: TIER_C[t.tier].accent }}>{t.name}</div></th>)}
                      {compB.tiers.map((t, i) => <th key={`b-${i}`} style={{ padding: "18px 16px", textAlign: "center", borderBottom: `1px solid ${C.goldBorder}`, background: `${compBtB.accent}04`, borderTop: `3px solid ${compBtB.accent}` }}><div style={{ fontSize: 10, color: compBtB.accentL, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{compBtB.short}</div><div style={{ fontFamily: C.serif, fontSize: 15, color: TIER_C[t.tier].accent }}>{t.name}</div></th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map(row => (
                      <tr key={row.key} onMouseEnter={e => e.currentTarget.style.background = C.goldGlow} onMouseLeave={e => e.currentTarget.style.background = "transparent"} style={{ transition: "background 0.15s" }}>
                        <td style={{ padding: "14px 24px", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: C.textS, borderBottom: `1px solid ${C.goldBorder}`, background: C.bg1 }}>{row.label}</td>
                        {compA.tiers.map((t, i) => <td key={`a-${i}`} style={{ padding: "14px 16px", textAlign: "center", borderBottom: `1px solid ${C.goldBorder}`, background: `${compBtA.accent}02` }}>{renderCell(t[row.key], row.type, t.tier)}</td>)}
                        {compB.tiers.map((t, i) => <td key={`b-${i}`} style={{ padding: "14px 16px", textAlign: "center", borderBottom: `1px solid ${C.goldBorder}`, background: `${compBtB.accent}02` }}>{renderCell(t[row.key], row.type, t.tier)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ════════════ SINGLE BANK WEALTH ════════════ */}
        {!compare && tab === "wealth" && bank && (
          <div key={transKey} style={{ animation: "slideIn 0.35s cubic-bezier(0.4,0,0.2,1)" }}>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontFamily: C.serif, fontSize: isMobile ? 24 : 34, fontWeight: 600, margin: 0, lineHeight: 1.2 }}>{bt.name} <span style={{ color: bt.accentL }}>Wealth Tiers</span></h2>
              <div style={{ width: 56, height: 3, borderRadius: 2, background: `linear-gradient(90deg, ${bt.accent}, transparent)`, marginTop: 14 }} />
            </div>

            {/* Desktop table */}
            {!isMobile && (
              <div style={{ background: C.bg1, border: `1px solid ${C.goldBorder}`, borderRadius: 22, overflow: "hidden", marginBottom: 28, boxShadow: `0 0 60px ${C.goldGlow}` }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "22px 28px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textM, background: C.bg2, borderBottom: `1px solid ${C.goldBorder}`, width: 140, position: "sticky", left: 0, zIndex: 2 }}>Feature</th>
                      {tiers.map((t, i) => {
                        const tc = TIER_C[t.tier];
                        return (
                          <th key={i} style={{ padding: "22px 24px", textAlign: "center", borderBottom: `1px solid ${C.goldBorder}`, background: t.tier === "ultra" ? `${C.gold}05` : C.bg2, position: "relative" }}>
                            {t.tier === "ultra" && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.gold}, ${C.goldL})` }} />}
                            <Tip text={t.eligibility}>
                              <div style={{ fontFamily: C.serif, fontSize: 19, fontWeight: 600, color: tc.accent, cursor: "help" }}>{t.name}</div>
                            </Tip>
                            <div style={{ display: "flex", justifyContent: "center", gap: 3, marginTop: 8 }}>
                              {tiers.map((_, ti) => <div key={ti} style={{ width: 16, height: 3, borderRadius: 2, background: ti <= i ? tc.accent : `${tc.accent}15` }} />)}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map((row, ri) => (
                      <tr key={row.key} className="tbl-row" style={{ transition: "background 0.15s" }}>
                        <td style={{ padding: "16px 28px", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.textS, borderBottom: `1px solid ${C.goldBorder}`, background: C.bg1, position: "sticky", left: 0, zIndex: 1 }}>{row.label}</td>
                        {tiers.map((t, ti) => (
                          <td key={ti} className="tbl-cell" style={{ padding: "16px 24px", textAlign: "center", borderBottom: `1px solid ${C.goldBorder}`, background: t.tier === "ultra" ? `${C.gold}02` : "transparent", transition: "background 0.15s" }}>
                            {renderCell(t[row.key], row.type, t.tier)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <td style={{ padding: "18px 28px", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.textS, background: C.bg1, verticalAlign: "top", position: "sticky", left: 0, zIndex: 1 }}>Perks</td>
                      {tiers.map((t, ti) => {
                        const tc = TIER_C[t.tier];
                        return (
                          <td key={ti} style={{ padding: "18px 24px", verticalAlign: "top", background: t.tier === "ultra" ? `${C.gold}02` : "transparent" }}>
                            {t.perks.slice(0, 3).map((p, pi) => (
                              <Tip key={pi} text={p}><div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8, fontSize: 12, color: C.textS, lineHeight: 1.5, cursor: "help" }}><span style={{ color: tc.accent, fontSize: 7, marginTop: 5, flexShrink: 0 }}>●</span><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160, display: "inline-block" }}>{p}</span></div></Tip>
                            ))}
                            {t.perks.length > 3 && <div style={{ fontSize: 11, color: tc.accent, fontWeight: 500 }}>+{t.perks.length - 3} more</div>}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Mobile cards */}
            {isMobile && (
              <div>
                <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", scrollbarWidth: "none" }}>
                  {tiers.map((t, i) => { const tc = TIER_C[t.tier]; return (
                    <button key={i} onClick={() => scrollToTier(i)} style={{ padding: "9px 18px", borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: C.sans, whiteSpace: "nowrap", flexShrink: 0, border: `1.5px solid ${mobileTier === i ? tc.accent + "50" : C.goldBorder}`, background: mobileTier === i ? `${tc.accent}10` : "transparent", color: mobileTier === i ? tc.accent : C.textM, transition: "all 0.2s" }}>{t.name}</button>
                  ); })}
                </div>
                <div ref={scrollRef} style={{ display: "flex", gap: 14, overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none", paddingBottom: 8 }}
                  onScroll={e => { const idx = Math.round(e.target.scrollLeft / (e.target.offsetWidth * 0.88)); if (idx >= 0 && idx < tiers.length && idx !== mobileTier) setMobileTier(idx); }}>
                  {tiers.map((t, i) => {
                    const tc = TIER_C[t.tier];
                    return (
                      <div key={i} style={{ minWidth: "88%", scrollSnapAlign: "start", flexShrink: 0, background: `linear-gradient(160deg, ${bt.g1}, ${bt.g2})`, border: `1px solid ${bt.accent}20`, borderRadius: 20, padding: "24px 22px", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${tc.accent}, ${tc.accent}30)` }} />
                        <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: `${bt.accent}05` }} />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                          <div><div style={{ fontFamily: C.serif, fontSize: 24, fontWeight: 600, color: tc.accent }}>{t.name}</div><div style={{ display: "flex", gap: 3, marginTop: 6 }}>{tiers.map((_, ti) => <div key={ti} style={{ width: 20, height: 3, borderRadius: 2, background: ti <= i ? tc.accent : `${tc.accent}15` }} />)}</div></div>
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${bt.accent}12`, border: `1px solid ${bt.accent}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{bt.icon}</div>
                        </div>
                        <div style={{ padding: "12px 14px", borderRadius: 12, background: `${tc.accent}06`, border: `1px solid ${tc.accent}10`, marginBottom: 16, fontSize: 13, color: C.textS, lineHeight: 1.55 }}>{t.eligibility}</div>
                        <div style={{ marginBottom: 16 }}><span style={{ background: `${tc.accent}10`, color: tc.accent, padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${tc.accent}15` }}>{t.card}</span></div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                          {[{ l: "Dom. Lounge", v: t.dl }, { l: "Intl. Lounge", v: t.il }, { l: "Locker", v: t.locker }, { l: "RM", v: t.rm ? "✓ Yes" : "✗ No" }].map((s, si) => (
                            <div key={si} style={{ padding: "10px 12px", borderRadius: 10, background: `${C.bg}60`, border: `1px solid ${C.goldBorder}` }}>
                              <div style={{ fontSize: 9, color: C.textM, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>{s.l}</div>
                              <div style={{ fontSize: 12, fontWeight: 500, color: s.v === "—" || s.v === "N/A" || s.v.startsWith("✗") ? C.textM : s.v.includes("Unlimited") ? C.green : C.text }}>{s.v.includes("Unlimited") ? "♾ Unlimited" : s.v}</div>
                            </div>
                          ))}
                        </div>
                        {t.perks.slice(0, 3).map((p, pi) => <div key={pi} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 12, color: C.textS, lineHeight: 1.5 }}><span style={{ color: tc.accent, fontSize: 7, marginTop: 5 }}>●</span>{p}</div>)}
                        {t.perks.length > 3 && <button onClick={() => toggle(`mp-${bankId}-${i}`)} style={{ background: "transparent", border: "none", color: tc.accent, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: C.sans }}>{expanded[`mp-${bankId}-${i}`] ? "Less ↑" : `+${t.perks.length - 3} more`}</button>}
                        {expanded[`mp-${bankId}-${i}`] && t.perks.slice(3).map((p, pi) => <div key={pi} style={{ display: "flex", gap: 8, marginBottom: 8, marginTop: 4, fontSize: 12, color: C.textS }}><span style={{ color: tc.accent, fontSize: 7, marginTop: 5 }}>●</span>{p}</div>)}
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 14 }}>
                  {tiers.map((_, i) => <div key={i} onClick={() => scrollToTier(i)} style={{ width: mobileTier === i ? 24 : 6, height: 6, borderRadius: 3, background: mobileTier === i ? bt.accent : C.bg3, transition: "all 0.3s", cursor: "pointer" }} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════ FAMILY BANKING ════════════ */}
        {tab === "family" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
              <div>
                <h2 style={{ fontFamily: C.serif, fontSize: isMobile ? 24 : 34, fontWeight: 600, margin: 0 }}>Family <span style={{ color: C.gold, fontStyle: "italic" }}>Banking</span></h2>
                <div style={{ width: 56, height: 3, borderRadius: 2, background: `linear-gradient(90deg, ${C.gold}, transparent)`, marginTop: 14 }} />
              </div>
              {/* View toggle */}
              <div style={{ display: "flex", background: C.bg2, borderRadius: 10, padding: 3, border: `1px solid ${C.goldBorder}` }}>
                {[{ id: "cards", l: "Cards" }, { id: "compare", l: "Compare" }].map(v => (
                  <button key={v.id} onClick={() => setFamilyView(v.id)} style={{ padding: "7px 18px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: C.sans, border: "none", background: familyView === v.id ? C.goldDim : "transparent", color: familyView === v.id ? C.gold : C.textM, transition: "all 0.2s" }}>{v.l}</button>
                ))}
              </div>
            </div>

            {/* Family Compare Table */}
            {familyView === "compare" && !isMobile && (
              <div style={{ background: C.bg1, border: `1px solid ${C.goldBorder}`, borderRadius: 20, overflow: "auto", marginBottom: 28, boxShadow: `0 0 60px ${C.goldGlow}` }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "18px 24px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.textM, background: C.bg2, borderBottom: `1px solid ${C.goldBorder}`, width: 140, position: "sticky", left: 0, zIndex: 2 }}>Feature</th>
                      {familyCompare.map(f => <th key={f.bid} style={{ padding: "18px 16px", textAlign: "center", borderBottom: `1px solid ${C.goldBorder}`, background: `${f.accent}04`, borderTop: `3px solid ${f.accent}`, minWidth: 120 }}><div style={{ fontSize: 14, fontWeight: 600, color: f.accentL }}>{f.short}</div></th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { l: "Max Members", k: "max" },
                      { l: "Members", k: "members" },
                      { l: "Eligibility", k: "elig" },
                    ].map(row => (
                      <tr key={row.k} className="tbl-row">
                        <td style={{ padding: "14px 24px", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: C.textS, borderBottom: `1px solid ${C.goldBorder}`, background: C.bg1, position: "sticky", left: 0, zIndex: 1 }}>{row.l}</td>
                        {familyCompare.map(f => (
                          <td key={f.bid} style={{ padding: "14px 16px", textAlign: "center", borderBottom: `1px solid ${C.goldBorder}`, fontSize: 13, color: C.text }}>
                            {row.k === "max" ? <span style={{ fontWeight: 700, color: f.accentL }}>{f[row.k]}</span> :
                             row.k === "members" ? f[row.k].join(", ") :
                             <span style={{ fontSize: 12, color: C.textS }}>{f[row.k]}</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Family Cards */}
            {(familyView === "cards" || isMobile) && (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 18 }}>
                {familyCompare.map((f, fi) => (
                  <div key={f.bid} style={{ background: `linear-gradient(155deg, ${f.g1}, ${f.g2})`, border: `1px solid ${f.accent}15`, borderRadius: 20, padding: isMobile ? "22px 18px" : "28px 26px", position: "relative", overflow: "hidden", transition: "all 0.3s", animation: `fadeUp 0.4s ease ${fi * 0.05}s both` }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = f.accent + "30"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = f.accent + "15"; e.currentTarget.style.transform = "translateY(0)"; }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${f.accent}, ${f.accent}30)` }} />
                    <div style={{ position: "absolute", top: -30, right: -30, width: 90, height: 90, borderRadius: "50%", background: `${f.accent}05` }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.accent}12`, border: `1px solid ${f.accent}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{f.icon}</div>
                      <div><div style={{ fontFamily: C.serif, fontSize: 20, fontWeight: 600 }}>{f.name}</div><div style={{ fontSize: 12, color: f.accentL, fontWeight: 500 }}>Family Banking</div></div>
                    </div>
                    <div style={{ padding: "12px 14px", borderRadius: 12, background: `${f.accent}06`, borderLeft: `3px solid ${f.accent}35`, marginBottom: 16, fontSize: 13, color: C.textS, lineHeight: 1.55 }}>{f.elig}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                      {f.members.map((m, mi) => <span key={mi} style={{ background: `${f.accent}10`, border: `1px solid ${f.accent}18`, color: f.accentL, padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500 }}>{m}</span>)}
                      <span style={{ background: `${C.gold}08`, border: `1px solid ${C.goldBorder}`, color: C.gold, padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>Max {f.max}</span>
                    </div>
                    {f.benefits.slice(0, 3).map((b, bi) => <div key={bi} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 12, color: C.textS }}><span style={{ color: f.accentL, fontSize: 10, marginTop: 3 }}>✓</span>{b}</div>)}
                    <div style={{ padding: "10px 12px", borderRadius: 10, background: `${C.gold}04`, border: `1px solid ${C.gold}08`, marginTop: 12, display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 14 }}>💡</span><span style={{ fontSize: 11, color: C.goldL, lineHeight: 1.5, fontStyle: "italic" }}>{f.insight}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ MOBILE BOTTOM BAR ═══ */}
      {isMobile && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40, background: `${C.bg}f0`, backdropFilter: "blur(20px) saturate(1.3)", borderTop: `1px solid ${C.goldBorder}`, padding: "10px 16px", display: "flex", gap: 8 }}>
          {[{ id: "wealth", icon: "💎", l: "Wealth" }, { id: "family", icon: "👨‍👩‍👧‍👦", l: "Family" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "10px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: C.sans, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: tab === t.id ? C.goldDim : "transparent", color: tab === t.id ? C.gold : C.textM, transition: "all 0.2s" }}>
              <span>{t.icon}</span>{t.l}
            </button>
          ))}
          <button onClick={() => setShowElig(true)} style={{ padding: "10px 16px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: C.sans, fontSize: 13, fontWeight: 600, background: `linear-gradient(135deg, ${C.gold}, ${C.goldL})`, color: "#0a0a0f", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            🎯 Check
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes tipIn { from { opacity: 0; transform: translateX(-50%) translateY(4px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes orbFloat1 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(30px, -20px); } }
        @keyframes orbFloat2 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-20px, 15px); } }
        .orb1 { animation: orbFloat1 8s ease-in-out infinite; }
        .orb2 { animation: orbFloat2 10s ease-in-out infinite; }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        *::-webkit-scrollbar { width: 5px; height: 0; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: ${C.bg3}; border-radius: 3px; }
        input::placeholder { color: ${C.textM}; }
        select option { background: ${C.bg2}; color: ${C.text}; }
        button:hover { filter: brightness(1.06); }
        button:active { transform: scale(0.97) !important; }
        table { border-spacing: 0; }
        .tbl-row:hover { background: ${C.goldGlow}; }
        .tbl-row:hover .tbl-cell { background: ${C.goldGlow}; }
      `}</style>
    </div>
  );
}
