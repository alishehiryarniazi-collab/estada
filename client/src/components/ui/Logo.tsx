/**
 * Estada logo — horizontal lockup (icon + wordmark).
 * The icon is a house silhouette carrying a verification check ("verified
 * property"), flat single-colour so it scales cleanly. `variant` switches
 * between navy (light backgrounds) and white (the dark hero overlay).
 */
import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'navy' | 'white';
  className?: string;
  /** Icon size in px (wordmark scales with it). */
  size?: number;
}

export function LogoMark({ color = '#0F2A47', size = 32 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M32 14 L48 27 V47 a3 3 0 0 1-3 3 H19 a3 3 0 0 1-3-3 V27 Z"
        fill="none"
        stroke={color}
        strokeWidth={3.5}
        strokeLinejoin="round"
      />
      <path
        d="M25 35 l5 5 l9-11"
        fill="none"
        stroke={color}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Logo({ variant = 'navy', className = '', size = 30 }: LogoProps) {
  const color = variant === 'white' ? '#FFFFFF' : '#0F2A47';
  const textColor = variant === 'white' ? 'text-white' : 'text-primary';

  return (
    <Link to="/" className={`inline-flex items-center gap-2 ${className}`} aria-label="Estada home">
      <LogoMark color={color} size={size} />
      <span
        className={`font-heading font-semibold tracking-tight ${textColor}`}
        style={{ fontSize: size * 0.82 }}
      >
        Estada
      </span>
    </Link>
  );
}
