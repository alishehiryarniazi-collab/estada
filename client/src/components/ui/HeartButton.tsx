/**
 * Shortlist heart toggle. Uses the saved store for instant (optimistic) state.
 * If the user isn't logged in, it opens the auth modal instead of saving.
 */
import { Heart } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { useSavedStore } from '../../store/savedStore';

export default function HeartButton({
  propertyId,
  className = '',
}: {
  propertyId: string;
  className?: string;
}) {
  const user = useAuthStore((s) => s.user);
  const openAuth = useUiStore((s) => s.openAuth);
  const saved = useSavedStore((s) => s.ids.has(propertyId));
  const toggle = useSavedStore((s) => s.toggle);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault(); // don't follow the card's link
    e.stopPropagation();
    if (!user) return openAuth('login');
    toggle(propertyId);
  };

  return (
    <button
      onClick={onClick}
      aria-label={saved ? 'Remove from shortlist' : 'Save to shortlist'}
      className={`grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-colors hover:bg-white ${className}`}
    >
      <Heart
        size={17}
        className={saved ? 'fill-cta text-cta' : 'text-ink'}
        strokeWidth={2}
      />
    </button>
  );
}
