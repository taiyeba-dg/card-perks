import { useState } from "react";
import { cn } from "@/lib/utils";

interface CardImageProps {
  src: string;
  alt: string;
  color?: string;
  className?: string;
  /** Used for the gradient fallback when no image src */
  fallbackColor?: string;
  /** Image fit mode — "contain" (default, no crop) or "cover" (fill, may crop edges) */
  fit?: "contain" | "cover";
}

/**
 * Lazy-loaded credit card image with:
 * - native loading="lazy" + decoding="async"
 * - shimmer skeleton while loading
 * - smooth fade-in on load
 * - graceful color fallback on error
 */
export default function CardImage({ src, alt, className, fallbackColor, fit = "contain" }: CardImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        className={cn("w-full h-full", className)}
        style={{ background: fallbackColor ? `linear-gradient(135deg, ${fallbackColor}, ${fallbackColor}88)` : "hsl(var(--secondary))" }}
      />
    );
  }

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      {/* Shimmer skeleton shown while image loads */}
      {!loaded && (
        <div className="absolute inset-0 bg-secondary/50 animate-pulse">
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
            style={{ animation: "shimmer-slide 1.4s infinite" }}
          />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={cn(
          "w-full h-full transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
        style={{ objectFit: fit }}
      />
    </div>
  );
}
