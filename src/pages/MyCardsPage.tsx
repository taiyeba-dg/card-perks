import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import MyCards from "./MyCardsNew";

export default function MyCardsPage() {
  return (
    <PageLayout>
      <SEO title="My Wallet" description="Track your credit cards, monitor spending, and maximize rewards." path="/my-cards" />
      <MyCards />
    </PageLayout>
  );
}
