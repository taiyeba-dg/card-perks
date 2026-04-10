import { Link } from "react-router-dom";
import { Heart, CreditCard, Gift, BookOpen, Star, ArrowRight } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import ScrollReveal from "@/components/ScrollReveal";
import FavoriteButton from "@/components/FavoriteButton";
import CardImage from "@/components/CardImage";
import { useFavorites } from "@/hooks/use-favorites";
import { cards } from "@/data/cards";
import { vouchers, iconMap } from "@/data/vouchers";
import { guides } from "@/data/guides";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SEO from "@/components/SEO";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Favorites() {
  const cardFavs = useFavorites("card");
  const voucherFavs = useFavorites("voucher");
  const guideFavs = useFavorites("guide");
  const isMobile = useIsMobile();

  const favCards = cards.filter((c) => cardFavs.isFav(c.id));
  const favVouchers = vouchers.filter((v) => voucherFavs.isFav(v.id));
  const favGuides = guides.filter((g) => guideFavs.isFav(g.slug));
  const total = favCards.length + favVouchers.length + favGuides.length;

  return (
    <PageLayout>
      <SEO title="Favorites" description="Your saved credit cards, vouchers, and guides — all in one place." path="/favorites" />
      <section className="container mx-auto px-4 py-12">
        <ScrollReveal>
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-gold/30 text-gold">
              <Heart className="w-3 h-3 mr-1" /> Saved Items
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Your <span className="gold-gradient">Favorites</span>
            </h1>
            <p className="text-muted-foreground">{total} items saved</p>
          </div>
        </ScrollReveal>

        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="cards">Cards ({favCards.length})</TabsTrigger>
            <TabsTrigger value="vouchers">Vouchers ({favVouchers.length})</TabsTrigger>
            <TabsTrigger value="guides">Guides ({favGuides.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="min-h-[300px]">
            {favCards.length > 0 ? (
              isMobile ? (
                <div className="space-y-2">
                  {favCards.map((card) => (
                    <div key={card.id} className="glass-card rounded-xl flex items-center gap-3 px-3 py-3 relative">
                      <Link to={`/cards/${card.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-8 rounded-lg overflow-hidden flex-shrink-0">
                          {card.image ? (
                            <CardImage src={card.image} alt={card.name} fallbackColor={card.color} />
                          ) : (
                            <div className="w-full h-full rounded-lg" style={{ background: card.color }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{card.name}</p>
                          <p className="text-xs text-muted-foreground">{card.issuer} · {card.fee} · <Star className="w-3 h-3 inline text-gold fill-gold" />{card.rating}</p>
                        </div>
                      </Link>
                      <FavoriteButton isFav={cardFavs.isFav(card.id)} onToggle={() => cardFavs.toggle(card.id)} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                  {favCards.map((card) => (
                    <div key={card.id} className="relative group">
                      <Link to={`/cards/${card.id}`} className="block">
                        <div className="glass-card rounded-xl overflow-hidden tilt-card hover:border-gold/30">
                          <div className="h-24 sm:h-40 flex items-center justify-center p-3" style={{ background: `linear-gradient(135deg, ${card.color}22, ${card.color}08)` }}>
                            {card.image ? <img src={card.image} alt={`${card.name} credit card`} className="h-16 sm:h-28 w-auto object-contain" /> : <CreditCard className="w-10 sm:w-20 h-10 sm:h-20 text-muted-foreground/30" />}
                          </div>
                          <div className="p-2.5 sm:p-4">
                            <h3 className="font-semibold text-xs sm:text-sm group-hover:text-gold transition-colors line-clamp-1">{card.name}</h3>
                            <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">{card.issuer} · {card.fee}</p>
                          </div>
                        </div>
                      </Link>
                      <div className="absolute top-2 right-2">
                        <FavoriteButton isFav={cardFavs.isFav(card.id)} onToggle={() => cardFavs.toggle(card.id)} />
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : <EmptyState icon={CreditCard} text="No favorite cards yet" description="Browse cards and tap ❤️ to save your favorites." ctaLabel="Browse Cards" ctaHref="/cards" />}
          </TabsContent>

          <TabsContent value="vouchers" className="min-h-[300px]">
            {favVouchers.length > 0 ? (
              isMobile ? (
                <div className="space-y-2">
                  {favVouchers.map((v) => {
                    const Icon = iconMap[v.category] || Gift;
                    return (
                      <div key={v.id} className="glass-card rounded-xl flex items-center gap-3 px-3 py-3 relative">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${v.color}15` }}>
                          <Icon className="w-4 h-4" style={{ color: v.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{v.name}</p>
                          <p className="text-xs text-muted-foreground">{v.category} · {v.discount}</p>
                        </div>
                        <FavoriteButton isFav={voucherFavs.isFav(v.id)} onToggle={() => voucherFavs.toggle(v.id)} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                  {favVouchers.map((v) => {
                    const Icon = iconMap[v.category] || Gift;
                    return (
                      <div key={v.id} className="relative group">
                        <Link to={`/vouchers/${v.id}`} className="block">
                          <div className="glass-card rounded-xl p-3 sm:p-6 tilt-card hover:border-gold/30">
                            <Icon className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3" style={{ color: v.color }} />
                            <h3 className="font-semibold text-xs sm:text-sm group-hover:text-gold transition-colors line-clamp-1">{v.name}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-1">{v.discount}</p>
                          </div>
                        </Link>
                        <div className="absolute top-2 right-2">
                          <FavoriteButton isFav={voucherFavs.isFav(v.id)} onToggle={() => voucherFavs.toggle(v.id)} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : <EmptyState icon={Gift} text="No saved vouchers yet" description="Browse voucher rates and tap ❤️ to save your favorites." ctaLabel="Browse Vouchers" ctaHref="/vouchers" />}
          </TabsContent>

          <TabsContent value="guides" className="min-h-[300px]">
            {favGuides.length > 0 ? (
              isMobile ? (
                <div className="space-y-2">
                  {favGuides.map((g) => {
                    const Icon = g.icon;
                    return (
                      <div key={g.slug} className="glass-card rounded-xl flex items-center gap-3 px-3 py-3 relative">
                        <Link to={`/guides/${g.slug}`} className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${g.color}15` }}>
                            <Icon className="w-4 h-4" style={{ color: g.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold line-clamp-1">{g.title}</p>
                            <p className="text-xs text-muted-foreground">{g.readTime} · {g.category}</p>
                          </div>
                        </Link>
                        <FavoriteButton isFav={guideFavs.isFav(g.slug)} onToggle={() => guideFavs.toggle(g.slug)} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                  {favGuides.map((g) => {
                    const Icon = g.icon;
                    return (
                      <div key={g.slug} className="relative group">
                        <Link to={`/guides/${g.slug}`} className="block">
                          <div className="glass-card rounded-xl p-3 sm:p-6 tilt-card hover:border-gold/30">
                            <Icon className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3" style={{ color: g.color }} />
                            <h3 className="font-semibold text-xs sm:text-sm group-hover:text-gold transition-colors line-clamp-2">{g.title}</h3>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">{g.readTime} · {g.category}</p>
                          </div>
                        </Link>
                        <div className="absolute top-2 right-2">
                          <FavoriteButton isFav={guideFavs.isFav(g.slug)} onToggle={() => guideFavs.toggle(g.slug)} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : <EmptyState icon={BookOpen} text="No favorite guides yet" description="Read our guides and tap ❤️ to save them for later." ctaLabel="Read Guides" ctaHref="/guides" />}
          </TabsContent>
        </Tabs>
      </section>
    </PageLayout>
  );
}

function EmptyState({ icon: Icon, text, description, ctaLabel, ctaHref }: { icon: any; text: string; description?: string; ctaLabel?: string; ctaHref?: string }) {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-5 relative">
        <Icon className="w-10 h-10 text-gold/40" />
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-secondary flex items-center justify-center border-2 border-background">
          <Heart className="w-3.5 h-3.5 text-muted-foreground/40" />
        </div>
      </div>
      <p className="text-lg font-semibold mb-1">{text}</p>
      <p className="text-sm text-muted-foreground mb-5">{description || "Save items you love for quick access later"}</p>
      {ctaLabel && ctaHref && (
        <Link to={ctaHref} className="gold-btn px-6 py-2.5 rounded-xl text-sm inline-flex items-center gap-2">
          {ctaLabel} <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
