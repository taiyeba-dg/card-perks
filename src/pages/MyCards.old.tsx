import { useEffect, useMemo } from "react";
import PageLayout from "@/components/PageLayout";
import BackToTop from "@/components/BackToTop";
import { useMyCards } from "@/hooks/use-my-cards";
import { useFavorites } from "@/hooks/use-favorites";
import { cards } from "@/data/cards";
import { useExpenses, CATEGORIES } from "@/hooks/use-expenses";
import SEO from "@/components/SEO";
import MobileMyCardsLayout from "@/components/my-cards/MobileMyCardsLayout";
import DesktopMyCardsLayout from "@/components/my-cards/DesktopMyCardsLayout";

const categoryColors: Record<string, string> = {
  shopping: "#F8C534", food: "#E23744", travel: "#276EF1", fuel: "#006838",
  electronics: "#00A651", entertainment: "#9333EA", bills: "#64748B",
  groceries: "#F97316", health: "#EC4899", others: "#888",
};

export default function MyCards() {
  const { has: isMyCard, toggle: toggleMyCard } = useMyCards();
  const { isFav, toggle: toggleFav } = useFavorites("card");
  const { expenses, addExpense, deleteExpense, getByCard, totalByCard } = useExpenses();
  const myCards = cards.filter((c) => isMyCard(c.id));

  useEffect(() => {
    document.title = "My Wallet | CardPerks";
  }, []);

  const totalSpend = myCards.reduce((s, c) => s + totalByCard(c.id), 0);
  const totalRewards = Math.round(totalSpend * 0.033);

  const catMap = new Map<string, number>();
  expenses.forEach((e) => {
    if (myCards.some((c) => c.id === e.cardId)) {
      catMap.set(e.category, (catMap.get(e.category) || 0) + e.amount);
    }
  });
  const categoryBreakdown = Array.from(catMap.entries()).map(([name, value]) => ({
    name: CATEGORIES.find((c) => c.value === name)?.label.split(" ").slice(1).join(" ") || name,
    value,
    color: categoryColors[name] || "#888",
  }));
  const totalCatSpend = categoryBreakdown.reduce((s, c) => s + c.value, 0);

  const myExpenses = useMemo(
    () => expenses.filter((e) => myCards.some((c) => c.id === e.cardId)),
    [expenses, myCards]
  );
  const groupedExpenses = useMemo(() => {
    const groups: Record<string, typeof myExpenses> = {};
    myExpenses.forEach((exp) => {
      if (!groups[exp.date]) groups[exp.date] = [];
      groups[exp.date].push(exp);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [myExpenses]);

  const layoutProps = {
    myCards, isMyCard, toggleMyCard, isFav, toggleFav: toggleFav,
    addExpense, deleteExpense, getByCard, totalByCard,
    totalSpend, totalRewards, myExpenses, groupedExpenses,
    categoryBreakdown, totalCatSpend, catMapSize: catMap.size,
  };

  return (
    <PageLayout>
      <SEO title="My Wallet" description="Track your credit cards, monitor spending, and maximize rewards in your personal wallet." path="/my-cards" />
      <section className="py-8 md:py-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,hsl(var(--gold)/0.08),transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-4 relative">
          <MobileMyCardsLayout {...layoutProps} />
          <DesktopMyCardsLayout {...layoutProps} />
        </div>
      </section>
      <BackToTop />
    </PageLayout>
  );
}
