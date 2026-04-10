export interface CreditCard {
  id: string;
  name: string;
  network: string;
  fee: string;
  rating: number;
  rewards: string;
  lounge: string;
  vouchers: string[];
  color: string;
  image?: string;
  perks: string[];
  issuer: string;
  type: string;
  minIncome: string;
  welcomeBonus: string;
  fuelSurcharge: string;
  forexMarkup: string;
  rewardRate: string;
  milestones: string[];
  insurance: string[];
  bestFor: string[];
}

export const cardImages: Record<string, string> = {};

// V3 master provides merged card data — map to legacy CreditCard for backward compat
import { getAllMasterCards, type CardV3Master } from "./card-v3-master";
import { formatCur } from "@/lib/fee-utils";
import { calculateCardRating } from "./card-v3-rating";

function computeRating(master: CardV3Master): number {
  return calculateCardRating(master.enrichment, master);
}

function masterToLegacy(master: CardV3Master): CreditCard {
  const baseRate = master.baseRate < 1 ? master.baseRate * 100 : master.baseRate;
  return {
    id: master.id,
    name: master.name,
    network: master.networkBase,
    fee: master.feeAnnual === 0 ? "₹0" : formatCur(master.feeAnnual),
    rating: computeRating(master),
    rewards: `${baseRate.toFixed(1)}% value`,
    lounge: master.loungeVisits || "None",
    vouchers: [],
    color: master.color,
    image: master.image,
    perks: [],
    issuer: master.bank,
    type: master.tier,
    minIncome: "",
    welcomeBonus: "",
    fuelSurcharge: "",
    forexMarkup: "",
    rewardRate: `${baseRate.toFixed(1)}%`,
    milestones: [],
    insurance: [],
    bestFor: master.tags,
  };
}

export const cards: CreditCard[] = getAllMasterCards().map(masterToLegacy);

export function getCardById(id: string) {
  return cards.find((c) => c.id === id);
}
