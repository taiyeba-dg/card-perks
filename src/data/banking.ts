import { Landmark, Users, Diamond, Crown, Shield, Star, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface BankingTier {
  name: string;
  color: string;
  eligibility: string;
  eligibleCards: string[];
  benefits: string[];
  hasRM: boolean;
  keyTakeaways: string[];
}

export interface BankData {
  id: string;
  name: string;
  color: string;
  tiers: BankingTier[];
}

export const banks: BankData[] = [
  {
    id: "hdfc",
    name: "HDFC Bank",
    color: "#003D8F",
    tiers: [
      { name: "Classic", color: "#6B7280", eligibility: "AMB of ₹1 Lakh in Savings OR ₹2 Lakhs in Current OR ₹1 Lakh net salary credit OR ₹5 Lakhs in Savings+FD combined", eligibleCards: ["HDFC Classic"], benefits: ["Standard locker rates apply", "Standard Demat account charges", "Nil charges on non-maintenance of minimum balance", "Free NEFT/RTGS through online mode", "Free chequebook issuance", "Priority branch servicing", "Dedicated customer care line"], hasRM: false, keyTakeaways: ["Best card: HDFC Classic"] },
      { name: "Preferred", color: "#06B6D4", eligibility: "AMB of ₹2 Lakhs in Savings OR ₹5 Lakhs in Current OR ₹2 Lakhs net salary credit OR ₹15 Lakhs Retail Liability Value (Savings+FD)", eligibleCards: ["HDFC Preferred Platinum Chip"], benefits: ["Domestic Lounge: 4/year", "50% discount on annual locker rent for first locker per group", "Free Demat AMC with at least 1 transaction", "Preferred Platinum Chip Debit Card with premium benefits", "Dedicated Relationship Manager", "Priority processing for loans", "Preferential forex rates", "Free demand drafts"], hasRM: true, keyTakeaways: ["Best card: HDFC Preferred Platinum Chip", "Dedicated RM included"] },
      { name: "Imperia", color: "#F59E0B", eligibility: "AMB of ₹10 Lakhs in Savings OR AQB ₹15 Lakhs in Current OR ₹3 Lakhs net salary credit OR ₹30 Lakhs in Savings+FD combined", eligibleCards: ["HDFC Imperia Platinum Chip"], benefits: ["Domestic Lounge: Unlimited", "International Lounge: 6/year", "Free locker (first locker per group)", "Free Demat AMC for life with Special Demat Value Plan", "Premium Imperia welcome kit with Imperia Platinum Chip Debit Card and exclusive lifestyle privileges", "Dedicated senior Relationship Manager", "Preferential pricing on home & auto loans", "Complimentary golf rounds"], hasRM: true, keyTakeaways: ["Best card: HDFC Imperia Platinum Chip", "Dedicated RM included"] },
      { name: "Private Banking", color: "#A855F7", eligibility: "NRV of ₹10 Crores or above with HDFC Bank. By invitation only.", eligibleCards: ["HDFC Private World"], benefits: ["Domestic Lounge: Unlimited", "International Lounge: Unlimited", "Complimentary premium locker", "Free Demat with dedicated investment advisory and priority IPO processing", "Exclusive onboarding experience with personalized wealth assessment", "Private banking suite access at select branches", "Family banking privileges for immediate family", "Bespoke travel & lifestyle concierge"], hasRM: true, keyTakeaways: ["Best card: HDFC Private World", "Dedicated RM included"] },
    ],
  },
  {
    id: "icici",
    name: "ICICI Bank",
    color: "#F58220",
    tiers: [
      { name: "Privilege", color: "#06B6D4", eligibility: "AMB of ₹1 Lakh in Savings OR ₹2 Lakhs in Current OR total relationship value ₹5 Lakhs", eligibleCards: ["ICICI Privilege Debit Card"], benefits: ["Priority branch servicing", "Preferential FD rates", "Free NEFT/RTGS", "Locker discount 25%", "Free chequebook"], hasRM: false, keyTakeaways: ["Entry-level wealth tier"] },
      { name: "Wealth", color: "#F59E0B", eligibility: "AMB of ₹10 Lakhs in Savings OR NRV ₹25 Lakhs OR ₹3 Lakhs monthly salary credit", eligibleCards: ["ICICI Sapphiro Debit Card"], benefits: ["Domestic Lounge: 8/year", "International Lounge: 4/year", "Dedicated Relationship Manager", "Preferential loan pricing", "50% off on locker charges", "Free Demat AMC", "Priority processing"], hasRM: true, keyTakeaways: ["Best card: ICICI Sapphiro", "Dedicated RM included"] },
      { name: "Private Banking", color: "#A855F7", eligibility: "NRV of ₹5 Crores or above with ICICI Bank. By invitation only.", eligibleCards: ["ICICI Private Banking Debit Card"], benefits: ["Domestic & International Lounge: Unlimited", "Complimentary premium locker", "Dedicated Private Banker", "Bespoke investment advisory", "Exclusive event invitations", "Family banking privileges", "Priority IPO processing"], hasRM: true, keyTakeaways: ["Top-tier private banking", "Dedicated Private Banker"] },
    ],
  },
  {
    id: "axis",
    name: "Axis Bank",
    color: "#97144D",
    tiers: [
      { name: "Priority", color: "#06B6D4", eligibility: "AMB of ₹2 Lakhs in Savings OR ₹5 Lakhs in Current OR ₹2 Lakhs net salary credit", eligibleCards: ["Axis Priority Debit Card"], benefits: ["Domestic Lounge: 4/year", "Priority branch servicing", "Preferential FD rates", "Free demand drafts", "Dedicated helpline"], hasRM: false, keyTakeaways: ["Entry-level priority banking"] },
      { name: "Burgundy", color: "#F59E0B", eligibility: "AMB of ₹5 Lakhs in Savings OR NRV ₹30 Lakhs OR ₹5 Lakhs monthly salary credit", eligibleCards: ["Axis Burgundy Debit Card"], benefits: ["Domestic Lounge: Unlimited", "International Lounge: 8/year", "Dedicated Relationship Manager", "Complimentary Burgundy Debit Card", "Preferential loan & forex rates", "Free locker (first year)", "Golf access: 4 rounds/year"], hasRM: true, keyTakeaways: ["Best card: Axis Burgundy", "Dedicated RM included"] },
      { name: "Burgundy Private", color: "#A855F7", eligibility: "NRV of ₹5 Crores or above. By invitation only.", eligibleCards: ["Axis Burgundy Private World"], benefits: ["Domestic & International Lounge: Unlimited", "Dedicated Private Banker", "Complimentary premium locker", "Bespoke wealth management", "Exclusive lifestyle privileges", "Family banking benefits", "Priority IPO & mutual fund processing"], hasRM: true, keyTakeaways: ["Top-tier Burgundy experience", "Dedicated Private Banker"] },
    ],
  },
  {
    id: "sbi",
    name: "State Bank of India",
    color: "#0033A0",
    tiers: [
      { name: "Gold", color: "#F59E0B", eligibility: "AMB of ₹1 Lakh OR ₹50,000 net salary credit OR ₹5 Lakhs in FD", eligibleCards: ["SBI Gold Debit Card"], benefits: ["Priority branch servicing", "Free NEFT/RTGS/IMPS", "Preferential FD rates", "Free chequebook & demand drafts", "Locker preference"], hasRM: false, keyTakeaways: ["Largest branch network benefit"] },
      { name: "Wealth", color: "#06B6D4", eligibility: "NRV of ₹10 Lakhs OR ₹3 Lakhs monthly salary credit OR ₹30 Lakhs in FD", eligibleCards: ["SBI Wealth Debit Card"], benefits: ["Domestic Lounge: 8/year", "Dedicated Relationship Manager", "Preferential loan pricing", "Free Demat AMC", "50% off locker charges", "Priority processing for government schemes"], hasRM: true, keyTakeaways: ["Best for government employees", "Dedicated RM included"] },
    ],
  },
  {
    id: "kotak",
    name: "Kotak Mahindra Bank",
    color: "#ED1C24",
    tiers: [
      { name: "Privy League", color: "#06B6D4", eligibility: "AMB of ₹5 Lakhs OR NRV ₹10 Lakhs OR ₹2 Lakhs salary credit", eligibleCards: ["Kotak Privy League Debit Card"], benefits: ["Domestic Lounge: 4/year", "Dedicated Relationship Manager", "Preferential rates on loans & FDs", "Free chequebook & demand drafts", "Priority servicing"], hasRM: true, keyTakeaways: ["Good entry-level wealth banking"] },
      { name: "Privy League Signature", color: "#F59E0B", eligibility: "AMB of ₹10 Lakhs OR NRV ₹30 Lakhs OR ₹5 Lakhs salary credit", eligibleCards: ["Kotak Privy League Signature Debit Card"], benefits: ["Domestic Lounge: Unlimited", "International Lounge: 6/year", "Senior Relationship Manager", "Complimentary locker", "Golf access: 4 rounds/year", "Preferential pricing on all products", "Free Demat with advisory"], hasRM: true, keyTakeaways: ["Best mid-tier wealth banking", "Senior RM included"] },
    ],
  },
];

export function getBankById(id: string) {
  return banks.find((b) => b.id === id);
}

/* ═══════════════════════ ENRICHED BANKING DATA ═══════════════════════
 * Used by the BankingGuides page — includes numeric eligibility thresholds,
 * structured lounge/locker/demat fields, and family banking data.
 * This is the single source of truth for all banking tier comparisons.
 */

export interface EnrichedTier {
  name: string;
  tier: "basic" | "preferred" | "premium" | "ultra";
  eligibility: string;
  eligNum: { s: number | null; c: number | null; sal: number | null; n: number | null };
  card: string;
  dl: string;
  il: string;
  locker: string;
  demat: string;
  rm: boolean;
  perks: string[];
}

export interface FamilyBanking {
  max: number;
  members: string[];
  elig: string;
  benefits: string[];
  insight: string;
}

export interface EnrichedBankData {
  tiers: EnrichedTier[];
  family: FamilyBanking;
}

export const ENRICHED_BANKS: Record<string, EnrichedBankData> = {
  hdfc: {
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
