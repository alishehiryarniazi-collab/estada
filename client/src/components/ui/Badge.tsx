/**
 * Badge — small pill labels. Colour-coded per the design system:
 *  - verified: green (trust/verification ONLY)
 *  - rent:     navy ("For Rent")
 *  - featured: coral ("Featured")
 *  - sale:     neutral ("For Sale")
 */
import type { ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';

type BadgeTone = 'verified' | 'rent' | 'featured' | 'sale';

const tones: Record<BadgeTone, string> = {
  verified: 'bg-verify text-white',
  rent: 'bg-primary text-white',
  featured: 'bg-cta text-white',
  sale: 'bg-white/90 text-ink border border-hairline',
};

interface BadgeProps {
  tone: BadgeTone;
  children: ReactNode;
  withIcon?: boolean;
  className?: string;
}

export default function Badge({ tone, children, withIcon = false, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-none ${tones[tone]} ${className}`}
    >
      {withIcon && <ShieldCheck size={12} />}
      {children}
    </span>
  );
}
