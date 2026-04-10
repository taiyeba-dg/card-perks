import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import FavoriteButton from "@/components/FavoriteButton";
import { Badge } from "@/components/ui/badge";
import type { Guide } from "@/data/guides";

interface Props {
  guides: Guide[];
  isFav: (id: string) => boolean;
  toggleFav: (id: string) => void;
}

export default function DesktopGuidesLayout({ guides, isFav, toggleFav }: Props) {
  return (
    <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {guides.map((guide, i) => {
        const Icon = guide.icon;
        return (
          <ScrollReveal key={guide.slug} delay={i * 0.05}>
            <Link to={`/guides/${guide.slug}`} className="block group">
              <div className="glass-card rounded-xl p-6 h-full tilt-card hover:border-gold/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${guide.color}22` }}>
                    <Icon className="w-5 h-5" style={{ color: guide.color }} />
                  </div>
                  <FavoriteButton isFav={isFav(guide.slug)} onToggle={() => toggleFav(guide.slug)} />
                </div>
                <h3 className="font-semibold group-hover:text-gold transition-colors mb-2">{guide.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{guide.description}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/10 text-gold font-medium"><Clock className="w-3 h-3" /> {guide.readTime}</span>
                  <Badge variant="secondary" className="text-xs">{guide.category}</Badge>
                </div>
              </div>
            </Link>
          </ScrollReveal>
        );
      })}
    </div>
  );
}
