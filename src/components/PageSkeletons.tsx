import { motion } from "framer-motion";

/** Single shimmer bone — uses branded gold shimmer */
function Bone({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-lg skeleton-gold ${className || ""}`} style={style} />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden p-5 space-y-4">
      <Bone className="w-full h-32 rounded-xl" />
      <Bone className="w-3/4 h-4" />
      <Bone className="w-1/2 h-3" />
      <div className="flex gap-2">
        <Bone className="w-16 h-6 rounded-full" />
        <Bone className="w-16 h-6 rounded-full" />
        <Bone className="w-16 h-6 rounded-full" />
      </div>
    </div>
  );
}

/** Mobile card row skeleton for /cards page */
export function MobileCardRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 glass-card rounded-2xl">
      <Bone className="w-12 h-8 rounded flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Bone className="w-48 h-4 rounded" />
        <Bone className="w-32 h-3 rounded" />
        <Bone className="w-20 h-3 rounded" />
      </div>
    </div>
  );
}

/** Mobile card rows skeleton list */
export function MobileCardsPageSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
          <MobileCardRowSkeleton />
        </motion.div>
      ))}
    </div>
  );
}

/** Mobile voucher grid skeleton */
export function MobileVouchersPageSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
          <Bone className="aspect-[4/3] rounded-xl w-full" />
        </motion.div>
      ))}
    </div>
  );
}

/** Card detail hero skeleton */
export function CardDetailSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Bone className="w-full aspect-[16/10] rounded-xl" />
      <Bone className="w-3/4 h-6 rounded" />
      <Bone className="w-1/2 h-4 rounded" />
      <div className="flex gap-2">
        <Bone className="w-20 h-8 rounded-full" />
        <Bone className="w-20 h-8 rounded-full" />
        <Bone className="w-20 h-8 rounded-full" />
      </div>
      <Bone className="w-full h-4 rounded mt-4" />
      <Bone className="w-full h-4 rounded" />
      <Bone className="w-2/3 h-4 rounded" />
    </div>
  );
}

/** Home page section skeletons */
export function HomeSectionSkeleton() {
  return (
    <div className="space-y-3 py-6 px-4">
      <Bone className="w-32 h-4 rounded" />
      <Bone className="w-48 h-6 rounded" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <Bone key={i} className="w-[72vw] aspect-[16/10] rounded-xl flex-shrink-0" />
        ))}
      </div>
    </div>
  );
}

export function VoucherSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Bone className="w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Bone className="w-2/3 h-4" />
          <Bone className="w-1/3 h-3" />
        </div>
      </div>
      <Bone className="w-full h-3" />
      <div className="flex gap-2">
        <Bone className="w-20 h-6 rounded-full" />
        <Bone className="w-20 h-6 rounded-full" />
      </div>
    </div>
  );
}

export function GuideSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-3">
      <Bone className="w-20 h-5 rounded-full" />
      <Bone className="w-4/5 h-5" />
      <Bone className="w-full h-3" />
      <Bone className="w-2/3 h-3" />
      <div className="flex gap-2 pt-2">
        <Bone className="w-14 h-5 rounded-full" />
        <Bone className="w-14 h-5 rounded-full" />
      </div>
    </div>
  );
}

export function BankTierSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Bone className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Bone className="w-1/2 h-5" />
          <Bone className="w-1/3 h-3" />
        </div>
      </div>
      <Bone className="w-full h-3" />
      <Bone className="w-full h-3" />
      <div className="grid grid-cols-3 gap-3 pt-2">
        <Bone className="h-16 rounded-xl" />
        <Bone className="h-16 rounded-xl" />
        <Bone className="h-16 rounded-xl" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Bone className="w-8 h-8 rounded-lg" />
              <Bone className="w-16 h-3 rounded-full" />
            </div>
            <Bone className="w-1/2 h-7" />
            <Bone className="w-3/4 h-3" />
          </div>
        ))}
      </div>
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Bone className="w-9 h-9 rounded-xl" />
          <Bone className="w-40 h-5" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/20">
            <Bone className="w-16 h-10 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Bone className="w-2/3 h-4" />
              <Bone className="w-1/3 h-3" />
            </div>
            <Bone className="w-14 h-7 rounded-xl flex-shrink-0" />
          </div>
        ))}
      </div>
      <div className="glass-card rounded-2xl p-6 space-y-3">
        <Bone className="w-32 h-5 mb-4" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Bone className="w-8 h-8 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Bone className="w-3/4 h-3" />
              <Bone className="w-1/4 h-2.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PerkAISkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      <div className="flex items-start gap-3 max-w-[85%]">
        <Bone className="w-8 h-8 rounded-full flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <Bone className="h-4 w-4/5" />
          <Bone className="h-4 w-3/5" />
          <Bone className="h-4 w-2/3" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {[120, 100, 140, 110, 130, 90].map((w, i) => (
          <Bone key={i} className="h-8 rounded-full" style={{ width: w }} />
        ))}
      </div>
      <div className="flex justify-end mt-4">
        <Bone className="h-10 w-48 rounded-2xl" />
      </div>
      <div className="flex items-start gap-3 max-w-[85%]">
        <Bone className="w-8 h-8 rounded-full flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-5/6" />
          <Bone className="h-4 w-3/4" />
          <Bone className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}

interface SkeletonGridProps {
  count?: number;
  columns?: string;
  children: React.ReactNode;
}

export function SkeletonGrid({ count = 6, columns = "md:grid-cols-2 xl:grid-cols-3", children }: SkeletonGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`grid ${columns} gap-5`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
        >
          {children}
        </motion.div>
      ))}
    </motion.div>
  );
}
