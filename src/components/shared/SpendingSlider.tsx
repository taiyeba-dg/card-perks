import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function formatRupee(value: number): string {
  if (value >= 100000) {
    const v = value / 100000;
    return `\u20B9${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}L`;
  }
  if (value >= 1000) {
    const v = value / 1000;
    return `\u20B9${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}K`;
  }
  return `\u20B9${value.toLocaleString("en-IN")}`;
}

interface SpendingSliderProps {
  icon: LucideIcon;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function SpendingSlider({
  icon: Icon,
  label,
  value,
  onChange,
  min = 0,
  max = 50000,
  step = 500,
  className,
}: SpendingSliderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-medium text-foreground truncate">
            {label}
          </span>
        </div>
        <span
          className="text-base font-bold text-primary shrink-0 ml-3"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {formatRupee(value)}
        </span>
      </div>
      <SliderPrimitive.Root
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="relative flex w-full touch-none select-none items-center h-5"
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range
            className="absolute h-full rounded-full transition-[width] duration-200"
            style={{
              background:
                "linear-gradient(90deg, hsl(var(--gold-dark)), hsl(var(--gold)), hsl(var(--gold-light)))",
            }}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background shadow-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing" />
      </SliderPrimitive.Root>
    </div>
  );
}
