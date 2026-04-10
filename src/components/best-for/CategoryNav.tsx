import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Category {
  slug: string;
  label: string;
  emoji: string;
}

interface CategoryNavProps {
  categories: Category[];
  activeSlug?: string;
  onSelect?: (slug: string) => void;
  sticky?: boolean;
  className?: string;
}

export function CategoryNav({
  categories,
  activeSlug,
  onSelect,
  sticky = false,
  className,
}: CategoryNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollWidth > el.clientWidth);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [categories]);

  return (
    <div
      className={cn(
        "relative",
        sticky && "sticky top-16 z-30 bg-background/80 backdrop-blur-md border-b border-border/50 py-2",
        className,
      )}
    >
      <div
        ref={scrollRef}
        className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-1 py-1"
      >
        {categories.map((cat) => {
          const isActive = cat.slug === activeSlug;
          return (
            <button
              key={cat.slug}
              onClick={() => onSelect?.(cat.slug)}
              className={cn(
                "snap-start shrink-0 inline-flex items-center gap-1.5 rounded-full text-xs px-3 py-1.5 min-h-[36px] transition-colors whitespace-nowrap",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50",
              )}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
      {/* Edge fades when content overflows */}
      {overflows && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />
        </>
      )}
    </div>
  );
}
