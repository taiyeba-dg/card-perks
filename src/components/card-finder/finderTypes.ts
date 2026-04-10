export interface FinderSpending {
  dining: number;
  groceries: number;
  online: number;
  travel: number;
  fuel: number;
  entertainment: number;
  pharmacy: number;
  telecom: number;
  education: number;
  utilities: number;
  rent: number;
  other: number;
}

export const FINDER_CATEGORIES: { id: keyof FinderSpending; label: string; mobileLabel: string; icon: string }[] = [
  { id: "dining", label: "Dining & Restaurants", mobileLabel: "Dining", icon: "🍕" },
  { id: "groceries", label: "Groceries", mobileLabel: "Groceries", icon: "🛒" },
  { id: "online", label: "Online Shopping", mobileLabel: "Online Shopping", icon: "🛍️" },
  { id: "travel", label: "Travel (Flights & Hotels)", mobileLabel: "Travel", icon: "✈️" },
  { id: "fuel", label: "Fuel", mobileLabel: "Fuel", icon: "⛽" },
  { id: "entertainment", label: "Entertainment & Movies", mobileLabel: "Entertainment", icon: "🎬" },
  { id: "pharmacy", label: "Pharmacy & Healthcare", mobileLabel: "Pharmacy", icon: "💊" },
  { id: "telecom", label: "Telecom & Recharges", mobileLabel: "Telecom", icon: "📱" },
  { id: "education", label: "Education", mobileLabel: "Education", icon: "🏫" },
  { id: "utilities", label: "Utilities & Bills", mobileLabel: "Bills & Utilities", icon: "🏠" },
  { id: "rent", label: "Rent / EMI", mobileLabel: "Rent / EMI", icon: "₹" },
  { id: "other", label: "Everything Else", mobileLabel: "Other", icon: "💳" },
];

import { SPENDING_PRESETS } from "@/data/spending-presets";

export const FINDER_PRESETS: { id: string; label: string; emoji: string; values: FinderSpending }[] = SPENDING_PRESETS.map(p => ({
  id: p.id,
  label: p.label,
  emoji: p.emoji,
  values: {
    dining: p.values.dining ?? 0,
    groceries: p.values.grocery ?? 0,
    online: p.values.online ?? 0,
    travel: p.values.travel ?? 0,
    fuel: p.values.fuel ?? 0,
    entertainment: p.values.entertainment ?? 0,
    pharmacy: p.values.pharmacy ?? 0,
    telecom: p.values.telecom ?? 0,
    education: p.values.education ?? 0,
    utilities: p.values.utilities ?? 0,
    rent: p.values.rent ?? 0,
    other: p.values.other ?? 0,
  },
}));

export interface FinderPriority {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export const FINDER_PRIORITIES: FinderPriority[] = [
  { id: "max-rewards", label: "Maximum Rewards", icon: "💰", description: "Earn the most on every swipe" },
  { id: "lounge", label: "Airport Lounge Access", icon: "✈️", description: "Skip the crowds, fly in style" },
  { id: "low-forex", label: "Low Forex Markup", icon: "🌍", description: "Save on international spending" },
  { id: "premium-perks", label: "Premium Perks", icon: "🏆", description: "Golf, concierge, memberships" },
  { id: "low-fee", label: "Low / No Fee", icon: "💸", description: "Don't want to pay annual fees" },
  { id: "travel-benefits", label: "Travel Benefits", icon: "✈️", description: "Insurance, miles, hotel upgrades" },
  { id: "dining-ent", label: "Dining & Entertainment", icon: "🍕", description: "Food, movies, OTT subscriptions" },
  { id: "cashback", label: "Simple Cashback", icon: "💚", description: "Just give me cash back" },
];

export const INCOME_RANGES = [
  { label: "Under ₹3L", value: "0-3", min: 0, max: 300000 },
  { label: "₹3L – ₹6L", value: "3-6", min: 300000, max: 600000 },
  { label: "₹6L – ₹12L", value: "6-12", min: 600000, max: 1200000 },
  { label: "₹12L – ₹25L", value: "12-25", min: 1200000, max: 2500000 },
  { label: "₹25L+", value: "25+", min: 2500000, max: Infinity },
];

export const BANK_OPTIONS = ["HDFC", "ICICI", "Axis", "SBI", "Kotak", "IDFC FIRST", "AU", "Amex", "Others"];

export interface FinderAnswers {
  spending: FinderSpending;
  priorities: string[]; // 3 selected priority IDs
  income: string;
  hasExistingCard: "no" | "yes" | "multiple";
  existingBanks: string[];
  creditScore: number;
  unknownScore: boolean;
  usesPortals: boolean;
  travelsInternationally: boolean;
  prefersCashback: boolean;
  willingHighFee: boolean;
  // Step 4 preferences
  rewardType?: string; // "points" | "cashback" | "miles" | "no-pref"
  feeComfort?: string[]; // ["free","low","mid","high","ultra"]
  networks?: string[]; // ["Visa","Mastercard","Rupay","Diners Club","Amex"]
}

export const defaultAnswers: FinderAnswers = {
  spending: { dining: 0, groceries: 0, online: 0, travel: 0, fuel: 0, entertainment: 0, pharmacy: 0, telecom: 0, education: 0, utilities: 0, rent: 0, other: 0 },
  priorities: [],
  income: "",
  hasExistingCard: "no",
  existingBanks: [],
  creditScore: 750,
  unknownScore: false,
  usesPortals: false,
  travelsInternationally: false,
  prefersCashback: false,
  willingHighFee: false,
  rewardType: "no-pref",
  feeComfort: ["free", "low", "mid", "high", "ultra"],
  networks: ["Visa", "Mastercard", "Rupay", "Diners Club", "Amex"],
};
