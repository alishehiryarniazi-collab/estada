/** Labelled text input with optional error message. */
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id || props.name;
  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink outline-none
                    transition-colors placeholder:text-ink-muted focus:border-primary
                    focus:ring-2 focus:ring-primary/20 ${error ? 'border-cta' : 'border-hairline'}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-cta">{error}</p>}
    </div>
  );
}
