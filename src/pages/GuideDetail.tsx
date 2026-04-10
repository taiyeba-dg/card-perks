import { useParams, Link } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { BookOpen, Clock, User, Calendar, List, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PageLayout from "@/components/PageLayout";
import ScrollReveal from "@/components/ScrollReveal";
import FavoriteButton from "@/components/FavoriteButton";
import SEO from "@/components/SEO";
import { useFavorites } from "@/hooks/use-favorites";
import { getGuideBySlug, guides } from "@/data/guides";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileGuideDetailLayout from "@/components/guide-detail/MobileGuideDetailLayout";

function textFromChildren(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textFromChildren).join("");
  if (node && typeof node === "object" && "props" in node) return textFromChildren((node as any).props.children);
  return "";
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function extractHeadings(content: string[]): { id: string; text: string }[] {
  const headings: { id: string; text: string }[] = [];
  for (const block of content) {
    const matches = block.matchAll(/^## (.+)$/gm);
    for (const m of matches) {
      const text = m[1].replace(/[*_`]/g, "").trim();
      headings.push({ id: slugify(text), text });
    }
  }
  return headings;
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

export default function GuideDetail() {
  const { slug } = useParams();
  const guide = getGuideBySlug(slug || "");
  const { toggle, isFav } = useFavorites("guide");
  const isMobile = useIsMobile();
  const [activeId, setActiveId] = useState("");

  const headings = useMemo(() => (guide ? extractHeadings(guide.content) : []), [guide]);

  useEffect(() => {
    if (!headings.length) return;
    const visibleIds = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visibleIds.add(entry.target.id);
          else visibleIds.delete(entry.target.id);
        }
        // Pick the first heading (in document order) that's currently visible
        for (const h of headings) {
          if (visibleIds.has(h.id)) { setActiveId(h.id); return; }
        }
        // If none visible, find the last heading above the viewport
        let lastAbove = "";
        for (const h of headings) {
          const el = document.getElementById(h.id);
          if (el && el.getBoundingClientRect().top < 120) lastAbove = h.id;
        }
        if (lastAbove) setActiveId(lastAbove);
      },
      { rootMargin: "-80px 0px -40% 0px", threshold: 0 }
    );
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);

  if (!guide) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Guide Not Found</h1>
          <Link to="/guides" className="text-gold hover:underline">&larr; Back to guides</Link>
        </div>
      </PageLayout>
    );
  }

  const Icon = guide.icon;

  if (isMobile) {
    return (
      <PageLayout>
        <SEO
          fullTitle={`${guide.title} | CardPerks`}
          description={guide.description ?? `Read our in-depth guide: ${guide.title}. Expert tips to maximize your credit card rewards.`}
          path={`/guides/${guide.slug}`}
        />
        <MobileGuideDetailLayout
          guide={guide}
          isFav={isFav(guide.slug)}
          onToggleFav={() => toggle(guide.slug)}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SEO
        fullTitle={`${guide.title} | CardPerks`}
        description={guide.description ?? `Read our in-depth guide: ${guide.title}. Expert tips to maximize your credit card rewards.`}
        path={`/guides/${guide.slug}`}
      />
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-gold transition-colors">Home</Link>
          <span>&rsaquo;</span>
          <Link to="/guides" className="hover:text-gold transition-colors">Guides</Link>
          <span>&rsaquo;</span>
          <span className="text-foreground truncate max-w-[280px]">{guide.title}</span>
        </nav>

        <div className="flex gap-10">
          {/* Sidebar TOC */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                <List className="w-4 h-4 text-gold" />
                In This Guide
              </div>
              <nav className="space-y-0.5 max-h-[calc(100vh-10rem)] overflow-y-auto pr-2">
                {headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={`block text-[13px] py-1.5 px-3 rounded-md transition-colors leading-snug ${
                      activeId === h.id
                        ? "text-gold bg-gold/10 font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors"
              >
                <ChevronUp className="w-3 h-3" /> Back to top
              </button>
            </div>
          </aside>

          {/* Main content */}
          <article className="flex-1 min-w-0">
            <ScrollReveal>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${guide.color}22` }}>
                    <Icon className="w-5 h-5" style={{ color: guide.color }} />
                  </div>
                  <Badge variant="secondary">{guide.category}</Badge>
                  <FavoriteButton isFav={isFav(guide.slug)} onToggle={() => toggle(guide.slug)} />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{guide.title}</h1>
                <p className="text-lg text-muted-foreground mb-4 max-w-3xl">{guide.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {guide.author}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {guide.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {guide.readTime}</span>
                </div>
              </div>
            </ScrollReveal>

            {guide.heroImage && (
              <ScrollReveal>
                <div className="mb-8 max-w-4xl">
                  <img src={guide.heroImage} alt={guide.title} className="w-full rounded-xl border border-border/20" loading="eager" />
                </div>
              </ScrollReveal>
            )}

            <div className="space-y-6 max-w-4xl">
              {guide.content.map((block, i) => (
                <ScrollReveal key={i} delay={i * 0.03}>
                  <div className="max-w-none prose-sm">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h2: ({ children }) => {
                          const id = slugify(textFromChildren(children));
                          return <h2 id={id} className="text-xl font-bold text-foreground mt-10 mb-3 scroll-mt-24">{children}</h2>;
                        },
                        h3: ({ children }) => <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">{children}</h3>,
                        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                        p: ({ children }) => <p className="text-[15px] text-muted-foreground leading-relaxed mb-3">{children}</p>,
                        ul: ({ children }) => <ul className="space-y-1.5 my-3 ml-4">{children}</ul>,
                        ol: ({ children }) => <ol className="space-y-1.5 my-3 ml-4 list-decimal">{children}</ol>,
                        li: ({ children }) => <li className="text-[15px] text-muted-foreground leading-relaxed">{children}</li>,
                        a: ({ children, href }) => <a href={href} className="text-gold underline underline-offset-2 hover:text-gold/80">{children}</a>,
                        table: ({ children }) => <div className="overflow-x-auto my-4 rounded-lg border border-border/30"><table className="w-full text-sm border-collapse">{children}</table></div>,
                        thead: ({ children }) => <thead className="bg-muted/30 border-b border-border/40">{children}</thead>,
                        th: ({ children }) => <th className="text-left py-2 px-3 text-gold font-medium">{children}</th>,
                        td: ({ children }) => <td className="py-2 px-3 border-b border-border/20 text-muted-foreground">{children}</td>,
                        img: ({ src, alt }) => (
                          <figure className="my-6">
                            <img src={src} alt={alt || ""} className="w-full rounded-lg border border-border/20" loading="lazy" />
                            {alt && <figcaption className="text-xs text-muted-foreground mt-2 text-center">{alt}</figcaption>}
                          </figure>
                        ),
                      }}
                    >
                      {processGuideLinks(block)}
                    </ReactMarkdown>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-border/30 flex flex-wrap gap-2 max-w-4xl">
              {guide.tags.map((t) => (
                <Link
                  key={t}
                  to={`/guides?tag=${encodeURIComponent(t)}`}
                  className="inline-block"
                >
                  <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-gold/10 hover:text-gold transition-colors">{t}</Badge>
                </Link>
              ))}
            </div>
          </article>
        </div>
      </div>
    </PageLayout>
  );
}
