import { useMediaQuery } from "@/hooks/useMediaQuery";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import FavoritesDesktop from "./FavoritesDesktop";
import FavoritesMobile from "./FavoritesMobile";

export default function FavoritesRouter() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  return (
    <PageLayout>
      <SEO title="Favorites" description="Your saved credit cards, vouchers, and guides — all in one place." path="/favorites" />
      {isDesktop ? <FavoritesDesktop /> : <FavoritesMobile />}
    </PageLayout>
  );
}
