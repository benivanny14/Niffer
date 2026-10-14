import { StarIcon } from "@/components/ui/icons";

type RatingStarsProps = {
  rating: number;
  reviewCount?: number;
  /** text-ink-300 kwa nyota zisizojaa */
  size?: "sm" | "md" | "lg";
};

export function RatingStars({
  rating,
  reviewCount,
  size = "sm",
}: RatingStarsProps) {
  const starClass =
    size === "sm" ? "h-3.5 w-3.5" : size === "md" ? "h-4.5 w-4.5" : "h-6 w-6";
  const filled = Math.round(rating);

  return (
    <div className="flex items-center gap-1.5">
      <div
        className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
      >
        {Array.from({ length: 5 }, (_, i) => (
          <StarIcon
            key={i}
            className={`${starClass} ${
              i < filled ? "text-gold-500" : "text-ink-300"
            }`}
          />
        ))}
      </div>
      {typeof reviewCount === "number" ? (
        <span className="text-xs text-ink-400">({reviewCount})</span>
      ) : null}
    </div>
  );
}
