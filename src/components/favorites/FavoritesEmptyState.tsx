import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import "./favorites.css";

type EmptyType = "cards" | "vouchers" | "guides" | "banking";

interface FavoritesEmptyStateProps {
  type: EmptyType;
  onAction?: () => void;
}

const CONFIG: Record<EmptyType, {
  svg: React.ReactNode;
  title: string;
  desc: string;
  cta: string;
  href: string;
}> = {
  cards: {
    svg: (
      <svg viewBox="0 0 64 64" fill="none">
        <rect x="6" y="14" width="52" height="36" rx="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 24h52" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13" y="32" width="18" height="5" rx="2.5" fill="currentColor" opacity="0.15" />
        <rect x="13" y="41" width="12" height="3" rx="1.5" fill="currentColor" opacity="0.1" />
        <circle cx="46" cy="37" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
      </svg>
    ),
    title: "No favorite cards yet",
    desc: "Browse cards and tap \u2665 to save them here",
    cta: "Explore Cards",
    href: "/cards",
  },
  vouchers: {
    svg: (
      <svg viewBox="0 0 64 64" fill="none">
        <rect x="6" y="12" width="52" height="40" rx="7" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="32" cy="32" r="10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 3.5" />
        <path d="M6 22a5 5 0 015-5 5 5 0 010 10 5 5 0 01-5-5z" fill="currentColor" opacity="0.12" />
        <path d="M58 22a5 5 0 00-5 5 5 5 0 000-10 5 5 0 005 5z" fill="currentColor" opacity="0.12" />
        <path d="M29 32l2.5 2.5L35 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" />
      </svg>
    ),
    title: "No favorite vouchers yet",
    desc: "Find the best voucher deals and save your favorites",
    cta: "Browse Vouchers",
    href: "/",
  },
  guides: {
    svg: (
      <svg viewBox="0 0 64 64" fill="none">
        <path d="M12 6h30a4 4 0 014 4v44a4 4 0 01-4 4H12a4 4 0 01-4-4V10a4 4 0 014-4z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 18h22M16 26h16M16 34h20" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
        <path d="M46 14l10-5v40l-10 5V14z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.06" />
        <circle cx="26" cy="46" r="3" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      </svg>
    ),
    title: "No saved guides yet",
    desc: "Save helpful guides for quick access",
    cta: "Read Guides",
    href: "/guides",
  },
  banking: {
    svg: (
      <svg viewBox="0 0 64 64" fill="none">
        <path d="M32 6L6 20h52L32 6z" stroke="currentColor" strokeWidth="1.5" />
        <rect x="12" y="24" width="8" height="22" rx="1.5" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
        <rect x="28" y="24" width="8" height="22" rx="1.5" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
        <rect x="44" y="24" width="8" height="22" rx="1.5" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
        <rect x="6" y="48" width="52" height="8" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="32" cy="14" r="2.5" fill="currentColor" opacity="0.15" />
      </svg>
    ),
    title: "No banking programs saved",
    desc: "Explore wealth and family banking programs",
    cta: "View Banking",
    href: "/banking",
  },
};

export default function FavoritesEmptyState({ type, onAction }: FavoritesEmptyStateProps) {
  const c = CONFIG[type];

  return (
    <div className="fav-es">
      <div className="fav-es__icon">{c.svg}</div>
      <h3 className="fav-es__title">{c.title}</h3>
      <p className="fav-es__desc">{c.desc}</p>
      <Link to={c.href} className="fav-es__cta" onClick={onAction}>
        {c.cta}
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
