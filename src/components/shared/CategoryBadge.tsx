import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const variantClasses = {
  default: "bg-secondary text-secondary-foreground",
  gold: "bg-primary/15 text-primary border border-primary/20",
  muted: "bg-muted text-muted-foreground",
} as const;

interface CategoryBadgeProps {
  icon: LucideIcon;
  label: string;
  variant?: keyof typeof variantClasses;
  className?: string;
}

export function CategoryBadge({
  icon: Icon,
  label,
  variant = "default",
  className,
}: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}
