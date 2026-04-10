import { useState, useMemo, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useMinLoading } from "@/hooks/use-min-loading";
import { SkeletonGrid, GuideSkeleton } from "@/components/PageSkeletons";
import { Link, useSearchParams } from "react-router-dom";
import { BookOpen, Search, Clock } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import ScrollReveal from "@/components/ScrollReveal";
import FavoriteButton from "@/components/FavoriteButton";
import { useFavorites } from "@/hooks/use-favorites";
import { guides, guideCategories } from "@/data/guides";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import MobileGuidesLayout from "@/components/guides/MobileGuidesLayout";
import { playSound } from "@/lib/sounds";
import DesktopGuidesLayout from "@/components/guides/DesktopGuidesLayout";

export default function GuidesHub() {
  const [searchParams] = useSearchParams();
  const tagFromUrl = searchParams.get("tag");
  const [search, setSearch] = useState(tagFromUrl || "");
  const [category, setCategory] = useState("All");
  const { toggle, isFav } = useFavorites("guide");
  const loading = useMinLoading(0);

  useEffect(() => {
    if (tagFromUrl) setSearch(tagFromUrl);
  }, [tagFromUrl]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return guides.filter((g) => {
      const matchSearch = !q || g.title.toLowerCase().includes(q) || g.tags.some((t) => t.toLowerCase().includes(q));
      const matchCat = category === "All" || g.category === category;
      return matchSearch && matchCat;
    });
  }, [search, category]);

  const hero = filtered.length > 0 ? filtered[0] : null;
  const rest = filtered.slice(1);

  return (
    <PageLayout>
      <SEO fullTitle="Credit Card Guides & Strategies | CardPerks" description="Expert guides to maximize your credit card rewards. Learn about lounge access, reward stacking, fee waivers, and more." path="/guides" />
      <section className="container mx-auto px-4 py-12">
        <ScrollReveal>
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-gold/30 text-gold"><BookOpen className="w-3 h-3 mr-1" /> Learn & Earn</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Guides <span className="gold-gradient">Hub</span></h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">Expert guides to help you maximize your credit card rewards and perks.</p>
          </div>
        </ScrollReveal>

        {/* Search + category bar */}
        <div className="sticky top-[4.5rem] z-20 sm:relative sm:top-auto sm:z-auto bg-background/95 sm:bg-transparent backdrop-blur-xl sm:backdrop-blur-0 -mx-4 px-4 sm:mx-0 sm:px-0 pb-3 sm:pb-0 pt-2 sm:pt-0 border-b border-border/30 sm:border-b-0 mb-5 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-3 mb-3 sm:mb-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search guides..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-secondary/80 border-border" />
            </div>
          </div>
          <div className="scroll-fade-container flex gap-2 overflow-x-auto pb-1 sm:pb-2 mt-3 scrollbar-hide">
            {guideCategories.map((cat) => (
              <button key={cat} onClick={() => { playSound("switch"); setCategory(cat); }} className={`px-4 py-1.5 sm:py-2 text-sm rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${category === cat ? "bg-gold text-background font-medium" : "bg-secondary/50 text-muted-foreground hover:text-foreground"}`}>{cat}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <SkeletonGrid count={6} columns="md:grid-cols-2 lg:grid-cols-3">
            <GuideSkeleton />
          </SkeletonGrid>
        ) : (<>
        {/* Hero featured guide */}
        {hero && (
          <ScrollReveal>
            <Link to={`/guides/${hero.slug}`} className="block group mb-6 sm:mb-8">
              <div className="glass-card rounded-xl overflow-hidden tilt-card hover:border-gold/30 transition-all relative">
                <div className="p-5 sm:p-8 sm:flex sm:items-center sm:gap-8">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0 mb-4 sm:mb-0" style={{ background: `${hero.color}22` }}>
                    <hero.icon className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: hero.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-gold/10 text-gold border-gold/20">Featured</Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" /> {hero.readTime}</span>
                    </div>
                    <h3 className="text-lg sm:text-2xl font-semibold group-hover:text-gold transition-colors mb-2">{hero.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{hero.description}</p>
                  </div>
                  <ArrowRight className="hidden sm:block w-5 h-5 text-muted-foreground/40 group-hover:text-gold transition-colors flex-shrink-0" />
                </div>
                <div className="absolute top-4 right-4">
                  <FavoriteButton isFav={isFav(hero.slug)} onToggle={() => toggle(hero.slug)} />
                </div>
              </div>
            </Link>
          </ScrollReveal>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-24 flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-secondary/40 flex items-center justify-center mb-5">
              <BookOpen className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <p className="text-lg font-semibold mb-1">No guides found</p>
            <p className="text-sm text-muted-foreground mb-5">No results for "{search || category}". Try a different term.</p>
            <button onClick={() => { setSearch(""); setCategory("All"); }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gold-outline-btn text-sm">Clear filters</button>
          </div>
        )}

        <MobileGuidesLayout guides={rest} isFav={isFav} toggleFav={toggle} />
        <DesktopGuidesLayout guides={rest} isFav={isFav} toggleFav={toggle} />
        </>)}
      </section>
    </PageLayout>
  );
}
