import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import FavoriteButton from "@/components/FavoriteButton";
import type { Guide } from "@/data/guides";

interface Props {
  guides: Guide[];
  isFav: (id: string) => boolean;
  toggleFav: (id: string) => void;
}

export default function MobileGuidesLayout({ guides, isFav, toggleFav }: Props) {
  return (
    <div className="sm:hidden space-y-2">
      {guides.map((guide, i) => {
        const Icon = guide.icon;
        return (
          <ScrollReveal key={guide.slug} delay={i * 0.04}>
            <Link to={`/guides/${guide.slug}`} className="block group">
              <div className="glass-card rounded-xl active:scale-[0.98] transition-transform">
                <div className="flex items-center gap-3 px-3.5 py-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${guide.color}22` }}>
                    <Icon className="w-4 h-4" style={{ color: guide.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm group-hover:text-gold transition-colors line-clamp-1">{guide.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gold font-medium">{guide.readTime}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                      <span className="text-[10px] text-muted-foreground">{guide.category}</span>
                    </div>
                  </div>
                  <FavoriteButton isFav={isFav(guide.slug)} onToggle={() => toggleFav(guide.slug)} />
                  <ArrowRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                </div>
              </div>
            </Link>
          </ScrollReveal>
        );
      })}
    </div>
  );
}
