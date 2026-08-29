/** Star rating — display or interactive input. */
import { Star } from 'lucide-react';

export default function StarRating({
  value,
  onChange,
  size = 18,
  readonly = true,
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: number;
  readonly?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(n)}
          className={readonly ? '' : 'cursor-pointer'}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Star
            size={size}
            className={n <= Math.round(value) ? 'fill-cta text-cta' : 'text-hairline'}
          />
        </button>
      ))}
    </div>
  );
}
