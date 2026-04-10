import { lazy, Suspense, useState, useMemo, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import BackToTop from "@/components/BackToTop";
import SEO from "@/components/SEO";
import { valueChanges, getBankSummaries } from "@/data/devaluation-data";
import { useMyCards } from "@/hooks/use-my-cards";
import { useIsMobile } from "@/hooks/use-mobile";

const DesktopDevaluationLayout = lazy(() => import("@/components/devaluation/DesktopDevaluationLayout"));
const MobileDevaluationLayout = lazy(() => import("@/components/devaluation/MobileDevaluationLayout"));

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-16 space-y-6 animate-pulse">
      <div className="h-8 w-56 bg-secondary/30 rounded mx-auto" />
      <div className="h-4 w-72 bg-secondary/20 rounded mx-auto" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-secondary/20 rounded-xl" />
        ))}
      </div>
      <div className="space-y-3 mt-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-secondary/20 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function DevaluationTracker() {
  const isMobile = useIsMobile();
  const { has: isMyCard } = useMyCards();
  const [myCardsOnly, setMyCardsOnly] = useState(false);
  const [filters, setFilters] = useState({
    type: "all",
    bank: "all",
    category: "all",
    impact: "all",
    time: "all",
  });

  useEffect(() => {
    document.title = "Devaluation Tracker | CardPerks";
  }, []);

  const setFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const myCardIds = useMemo(() => {
    return valueChanges
      .flatMap((c) => c.affectedCards)
      .filter((id, i, arr) => arr.indexOf(id) === i && isMyCard(id));
  }, [isMyCard]);

  const hasMyCards = myCardIds.length > 0;

  const filtered = useMemo(() => {
    let result = [...valueChanges];

    if (myCardsOnly) {
      result = result.filter((c) => c.affectedCards.some((id) => isMyCard(id)));
    }
    if (filters.type !== "all") result = result.filter((c) => c.changeType === filters.type);
    if (filters.bank !== "all") result = result.filter((c) => c.bankId === filters.bank);
    if (filters.category !== "all") result = result.filter((c) => c.category === filters.category);
    if (filters.impact !== "all") result = result.filter((c) => c.impactLevel === filters.impact);

    if (filters.time !== "all") {
      const now = new Date();
      const cutoff = new Date();
      if (filters.time === "30d") cutoff.setDate(now.getDate() - 30);
      else if (filters.time === "3m") cutoff.setMonth(now.getMonth() - 3);
      else if (filters.time === "6m") cutoff.setMonth(now.getMonth() - 6);
      result = result.filter((c) => new Date(c.effectiveDate) >= cutoff);
    }

    return result.sort(
      (a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime(),
    );
  }, [filters, myCardsOnly, isMyCard]);

  const bankSummaries = useMemo(() => getBankSummaries(valueChanges), []);

  const myCardChangesCount = useMemo(() => {
    return valueChanges.filter((c) => c.affectedCards.some((id) => isMyCard(id))).length;
  }, [isMyCard]);

  const layoutProps = {
    changes: filtered,
    bankSummaries,
    filters,
    setFilter,
    myCardsOnly,
    setMyCardsOnly,
    hasMyCards,
    myCardChangesCount,
  };

  return (
    <PageLayout>
      <SEO
        title="Devaluation Tracker"
        description="Track credit card point value changes, devaluations, and benefit modifications across Indian banks."
        path="/devaluation-tracker"
      />
      <section className="py-8 md:py-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,hsl(var(--gold)/0.08),transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-4 relative">
          <Suspense fallback={<LoadingSkeleton />}>
            {isMobile ? (
              <MobileDevaluationLayout {...layoutProps} />
            ) : (
              <DesktopDevaluationLayout {...layoutProps} />
            )}
          </Suspense>
        </div>
      </section>
      <BackToTop />
    </PageLayout>
  );
}
