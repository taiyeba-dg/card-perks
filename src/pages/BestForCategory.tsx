import { lazy, Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import { useIsMobile } from "@/hooks/use-mobile";
import { getCategoryBySlug, buildLeaderboard } from "@/data/category-leaderboards";

const DesktopBestForCategory = lazy(() => import("@/components/best-for/DesktopBestForCategory"));
const MobileBestForCategory = lazy(() => import("@/components/best-for/MobileBestForCategory"));

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-16 space-y-6 animate-pulse">
      <div className="h-12 w-12 bg-secondary/30 rounded-full mx-auto" />
      <div className="h-8 w-48 bg-secondary/30 rounded mx-auto" />
      <div className="h-4 w-64 bg-secondary/20 rounded mx-auto" />
      <div className="space-y-3 mt-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-secondary/20 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function BestForCategory() {
  const { category } = useParams<{ category: string }>();
  const isMobile = useIsMobile();

  const catDef = getCategoryBySlug(category || "");
  const entries = buildLeaderboard(category || "");

  if (!catDef || entries.length === 0) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Category not found.</p>
          <Link to="/best-for" className="text-primary mt-2 inline-block text-sm">
            ← Back to all categories
          </Link>
        </div>
      </PageLayout>
    );
  }

  const winner = entries[0];

  return (
    <PageLayout>
      <SEO
        fullTitle={`Best Credit Cards for ${catDef.label} in India (2026) — CardPerks`}
        description={`Compare ${entries.length} credit cards ranked by ${catDef.label.toLowerCase()} earning rate. ${winner.card.name} leads at ${winner.effectiveRate.toFixed(1)}%.`}
        path={`/best-for/${catDef.slug}`}
      />
      <Suspense fallback={<LoadingSkeleton />}>
        {isMobile ? (
          <MobileBestForCategory category={category!} />
        ) : (
          <DesktopBestForCategory category={category!} />
        )}
      </Suspense>
    </PageLayout>
  );
}
