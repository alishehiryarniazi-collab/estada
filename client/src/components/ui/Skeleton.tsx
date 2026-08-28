/**
 * Skeleton loader block. Used instead of blank screens while data loads
 * (Section 8: skeleton loaders for grids/detail pages).
 */
interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded-md bg-hairline/70 ${className}`} />;
}

/** A card-shaped skeleton matching PropertyCard's layout. */
export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-hairline bg-surface">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  );
}
