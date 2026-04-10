import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface DeepLinkCTAProps {
  to: string;
  emoji?: string;
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  compact?: boolean;
}

export default function DeepLinkCTA({ to, emoji, icon: Icon, title, subtitle, compact }: DeepLinkCTAProps) {
  const isMobile = useIsMobile();
  const isCompact = compact ?? isMobile;

  if (isCompact) {
    return (
      <Link
        to={to}
        className="group flex items-center gap-2 py-2 text-xs text-muted-foreground hover:text-gold transition-colors"
      >
        {emoji && <span className="text-sm">{emoji}</span>}
        {Icon && <Icon className="w-3.5 h-3.5" />}
        <span className="flex-1">{title}</span>
        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className="group block glass-card rounded-xl p-3.5 border-l-2 border-l-gold/40 hover:border-l-gold transition-all hover:shadow-md hover:shadow-gold/5"
    >
      <div className="flex items-center gap-3">
        {emoji && <span className="text-base flex-shrink-0">{emoji}</span>}
        {Icon && <Icon className="w-4 h-4 text-gold flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-gold group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>
    </Link>
  );
}

export function DeepLinkGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`space-y-2 ${className ?? ""}`}>{children}</div>;
}
