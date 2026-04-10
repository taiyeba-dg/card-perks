import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import MyWalletDashboard from "./MyWalletDashboard";

export default function MyCardsRouter() {
  return (
    <PageLayout>
      <SEO title="My Wallet" description="Track your credit cards, monitor spending, and maximize rewards." path="/my-cards" />
      <MyWalletDashboard />
    </PageLayout>
  );
}
