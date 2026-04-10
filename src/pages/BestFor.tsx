import { lazy, Suspense } from "react";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import { useIsMobile } from "@/hooks/use-mobile";

const DesktopBestForLanding = lazy(() => import("@/components/best-for/DesktopBestForLanding"));
const MobileBestForLanding = lazy(() => import("@/components/best-for/MobileBestForLanding"));

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-16 space-y-6 animate-pulse">
      <div className="h-6 w-48 bg-secondary/30 rounded mx-auto" />
      <div className="h-10 w-72 bg-secondary/30 rounded mx-auto" />
      <div className="h-4 w-56 bg-secondary/20 rounded mx-auto" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-32 bg-secondary/20 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function BestFor() {
  const isMobile = useIsMobile();

  return (
    <PageLayout>
      <SEO
        fullTitle="Best Credit Cards by Category (2026) — CardPerks"
        description="Find the top credit card for every type of spending. Data-powered rankings across Indian credit cards."
        path="/best-for"
      />
      <Suspense fallback={<LoadingSkeleton />}>
        {isMobile ? <MobileBestForLanding /> : <DesktopBestForLanding />}
      </Suspense>
    </PageLayout>
  );
}
