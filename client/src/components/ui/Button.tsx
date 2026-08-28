/**
 * Button — three variants matching the design system:
 *  - primary: solid navy (structural actions)
 *  - cta:     coral (the ONE key action per screen — use sparingly)
 *  - ghost:   outline (secondary actions)
 * Renders as a <button> or, with `as="a"`, an <a> for links.
 */
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'cta' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 ' +
  'disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-light focus-visible:ring-primary',
  cta: 'bg-cta text-white hover:bg-cta-hover focus-visible:ring-cta shadow-sm',
  ghost: 'border border-hairline bg-white text-ink hover:bg-canvas focus-visible:ring-primary',
};

const sizes: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-4 py-2.5',
  lg: 'text-base px-6 py-3',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
