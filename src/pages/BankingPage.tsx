import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import BankingGuides from "./BankingGuidesNew";

export default function BankingPage() {
  return (
    <PageLayout>
      <SEO fullTitle="Banking Guides | CardPerks" description="Compare wealth banking tiers and family banking programs across Indian banks." path="/banking" />
      <BankingGuides />
    </PageLayout>
  );
}
