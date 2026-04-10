import { Link } from "react-router-dom";
import { Clock, User, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import FavoriteButton from "@/components/FavoriteButton";
import { Badge } from "@/components/ui/badge";
import { guides } from "@/data/guides";

interface GuideData {
  slug: string;
  title: string;
  description?: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  color: string;
  icon: React.ElementType;
  content: string[];
  tags: string[];
  heroImage?: string;
}

interface Props {
  guide: GuideData;
  isFav: boolean;
  onToggleFav: () => void;
}

function processGuideLinks(content: string): string {
  return content.replace(
    /\[link to: guide-(\d+)-([^\]]+)\]/g,
    (_, num, slug) => {
      const targetSlug = `${num.padStart(2, '0')}-${slug}`;
      const targetGuide = guides.find(g => g.slug === targetSlug);
      const linkText = targetGuide ? targetGuide.title : slug.replace(/-/g, ' ');
      return `[${linkText}](/guides/${targetSlug})`;
    }
  );
}

export default function MobileGuideDetailLayout({ guide, isFav, onToggleFav }: Props) {
  const Icon = guide.icon;

  return (
    <article className="px-4 py-6 max-w-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-4">
        <Link to="/" className="hover:text-gold transition-colors">Home</Link>
        <span>›</span>
        <Link to="/guides" className="hover:text-gold transition-colors">Guides</Link>
        <span>›</span>
        <span className="text-foreground truncate max-w-[140px]">{guide.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${guide.color}22` }}>
            <Icon className="w-4 h-4" style={{ color: guide.color }} />
          </div>
          <Badge variant="secondary" className="text-[10px]">{guide.category}</Badge>
          <div className="ml-auto">
            <FavoriteButton isFav={isFav} onToggle={onToggleFav} />
          </div>
        </div>
        <h1 className="text-xl font-bold mb-2 leading-tight">{guide.title}</h1>
        {guide.description && (
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{guide.description}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><User className="w-3 h-3" /> {guide.author}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {guide.date}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {guide.readTime}</span>
        </div>
      </div>

      {guide.heroImage && (
        <div className="mb-4">
          <img src={guide.heroImage} alt={guide.title} className="w-full rounded-lg" loading="eager" />
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">
        {guide.content.map((block, i) => (
          <div key={i} className="max-w-none prose-sm">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => <h2 className="text-lg font-bold text-foreground mt-6 mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-semibold text-foreground mt-4 mb-1.5">{children}</h3>,
                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                p: ({ children }) => <p className="text-sm text-muted-foreground leading-relaxed mb-2">{children}</p>,
                ul: ({ children }) => <ul className="space-y-1 my-2 ml-3">{children}</ul>,
                ol: ({ children }) => <ol className="space-y-1 my-2 ml-3 list-decimal">{children}</ol>,
                li: ({ children }) => <li className="text-sm text-muted-foreground">{children}</li>,
                a: ({ children, href }) => <a href={href} className="text-gold underline underline-offset-2 hover:text-gold/80">{children}</a>,
                table: ({ children }) => (
                  <div className="overflow-x-auto my-3 -mx-4 px-4">
                    <table className="w-full text-xs border-collapse min-w-[400px]">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="border-b border-border/40">{children}</thead>,
                th: ({ children }) => <th className="text-left py-1.5 px-2 text-gold font-medium text-xs">{children}</th>,
                td: ({ children }) => <td className="py-1.5 px-2 border-b border-border/20 text-muted-foreground text-xs">{children}</td>,
              }}
            >
              {processGuideLinks(block)}
            </ReactMarkdown>
          </div>
        ))}
      </div>

      {/* Tags */}
      <div className="mt-6 flex flex-wrap gap-1.5">
        {guide.tags.map((t) => (
          <Link key={t} to={`/guides?tag=${encodeURIComponent(t)}`}>
            <Badge variant="secondary" className="text-[10px] cursor-pointer hover:bg-gold/10 hover:text-gold transition-colors">{t}</Badge>
          </Link>
        ))}
      </div>
    </article>
  );
}
