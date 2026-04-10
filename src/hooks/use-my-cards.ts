import { useState, useEffect, useCallback, useMemo } from "react";
import { cards as allCards } from "@/data/cards";
import { getMasterCard } from "@/data/card-v3-master";
import type { CardV3Data } from "@/data/card-v3-types";

const STORAGE_KEY = "cardperks_my_cards";
const DISMISSED_BANNER_KEY = "cardperks_banner_dismissed";
const ONBOARDING_SHOWN_KEY = "cardperks_onboarding_shown";

export interface MyCardEntry {
  cardId: string;
  addedDate: string;
  monthlySpend: number | null;
  currentPoints: number | null;
  annualSpendSoFar: number | null;
}

export interface MyCardsState {
  cards: MyCardEntry[];
  totalMonthlySpend: number | null;
  lastUpdated: string;
}

function loadState(): MyCardsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { cards: [], totalMonthlySpend: null, lastUpdated: new Date().toISOString() };
    const parsed = JSON.parse(raw);
    // Migration: if old format (array of string ids), convert
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "string") {
      const migrated: MyCardsState = {
        cards: parsed.map((id: string) => ({
          cardId: id,
          addedDate: new Date().toISOString(),
          monthlySpend: null,
          currentPoints: null,
          annualSpendSoFar: null,
        })),
        totalMonthlySpend: null,
        lastUpdated: new Date().toISOString(),
      };
      return migrated;
    }
    return parsed as MyCardsState;
  } catch {
    return { cards: [], totalMonthlySpend: null, lastUpdated: new Date().toISOString() };
  }
}

function saveState(state: MyCardsState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useMyCards() {
  const [state, setState] = useState<MyCardsState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const toggle = useCallback((id: string) => {
    setState((prev) => {
      const exists = prev.cards.find((c) => c.cardId === id);
      if (exists) {
        return { ...prev, cards: prev.cards.filter((c) => c.cardId !== id), lastUpdated: new Date().toISOString() };
      }
      return {
        ...prev,
        cards: [...prev.cards, { cardId: id, addedDate: new Date().toISOString(), monthlySpend: null, currentPoints: null, annualSpendSoFar: null }],
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  const has = useCallback((id: string) => state.cards.some((c) => c.cardId === id), [state.cards]);
  const count = state.cards.length;

  const updateCardData = useCallback((cardId: string, data: Partial<Pick<MyCardEntry, "monthlySpend" | "currentPoints" | "annualSpendSoFar">>) => {
    setState((prev) => ({
      ...prev,
      cards: prev.cards.map((c) => c.cardId === cardId ? { ...c, ...data } : c),
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const setTotalMonthlySpend = useCallback((spend: number | null) => {
    setState((prev) => ({ ...prev, totalMonthlySpend: spend, lastUpdated: new Date().toISOString() }));
  }, []);

  const clearAll = useCallback(() => {
    setState({ cards: [], totalMonthlySpend: null, lastUpdated: new Date().toISOString() });
  }, []);

  // Get the full card objects for user's cards
  const myCardObjects = useMemo(
    () => state.cards.map((entry) => {
      const card = allCards.find((c) => c.id === entry.cardId);
      const v3 = getMasterCard(entry.cardId)?.enrichment;
      return card ? { ...entry, card, v3 } : null;
    }).filter(Boolean) as (MyCardEntry & { card: typeof allCards[0]; v3: CardV3Data | undefined })[],
    [state.cards]
  );

  // Primary card = highest monthly spend, or first card
  const primaryCard = useMemo(() => {
    if (myCardObjects.length === 0) return null;
    const withSpend = myCardObjects.filter((c) => c.monthlySpend && c.monthlySpend > 0);
    if (withSpend.length > 0) return withSpend.reduce((a, b) => (a.monthlySpend! > b.monthlySpend! ? a : b));
    return myCardObjects[0];
  }, [myCardObjects]);

  // Estimated annual value across all cards
  const estimatedAnnualValue = useMemo(() => {
    return myCardObjects.reduce((total, entry) => {
      const spend = entry.monthlySpend ?? 0;
      const rate = entry.v3?.baseRate ?? 1;
      const baseValue = entry.v3?.redemption.baseValue ?? 0.25;
      return total + Math.round(spend * (rate / 100) * 12 * baseValue);
    }, 0);
  }, [myCardObjects]);

  // Fee waiver tracking
  const feeWaiverStatus = useMemo(() => {
    return myCardObjects.map((entry) => {
      const threshold = entry.v3?.fees.waivedOn;
      const spent = entry.annualSpendSoFar ?? 0;
      const onTrack = threshold ? spent >= threshold * (new Date().getMonth() / 12) : false;
      return { cardId: entry.cardId, cardName: entry.card.name, threshold, spent, onTrack, progress: threshold ? Math.min((spent / threshold) * 100, 100) : 0 };
    }).filter((s) => s.threshold !== null && s.threshold !== undefined);
  }, [myCardObjects]);

  // Banner/onboarding state
  const bannerDismissed = typeof window !== "undefined" ? localStorage.getItem(DISMISSED_BANNER_KEY) === "true" : true;
  const dismissBanner = useCallback(() => { localStorage.setItem(DISMISSED_BANNER_KEY, "true"); }, []);
  const onboardingShown = typeof window !== "undefined" ? localStorage.getItem(ONBOARDING_SHOWN_KEY) === "true" : true;
  const markOnboardingShown = useCallback(() => { localStorage.setItem(ONBOARDING_SHOWN_KEY, "true"); }, []);

  return {
    // Core
    toggle, has, count, state,
    updateCardData, setTotalMonthlySpend, clearAll,
    // Enriched data
    myCardObjects, primaryCard, estimatedAnnualValue, feeWaiverStatus,
    // UI state
    bannerDismissed, dismissBanner, onboardingShown, markOnboardingShown,
  };
}
