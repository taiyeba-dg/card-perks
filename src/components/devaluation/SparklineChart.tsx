import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showDots?: boolean;
  className?: string;
}

function buildSmoothPath(points: [number, number][]): string {
  if (points.length < 2) return "";

  let d = `M ${points[0][0]},${points[0][1]}`;

  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const cpx = (x0 + x1) / 2;
    d += ` C ${cpx},${y0} ${cpx},${y1} ${x1},${y1}`;
  }

  return d;
}

export function SparklineChart({
  data,
  width = 120,
  height = 40,
  color = "hsl(var(--primary))",
  showDots = false,
  className,
}: SparklineChartProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 4;

  const points: [number, number][] = data.map((v, i) => [
    padding + (i / (data.length - 1)) * (width - padding * 2),
    padding + (1 - (v - min) / range) * (height - padding * 2),
  ]);

  const linePath = buildSmoothPath(points);

  const fillPath =
    linePath +
    ` L ${points[points.length - 1][0]},${height} L ${points[0][0]},${height} Z`;

  const pathLength = width * 2;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn("overflow-visible", className)}
    >
      <path d={fillPath} fill={color} fillOpacity={0.1} />
      <motion.path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeDasharray={pathLength}
        initial={{ strokeDashoffset: pathLength }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      {showDots &&
        points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1.5} fill={color} />
        ))}
    </svg>
  );
}
