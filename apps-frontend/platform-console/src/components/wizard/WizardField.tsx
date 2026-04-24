'use client';

import { clsx } from 'clsx';

interface WizardFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function WizardField({ label, required, hint, error, children, className }: WizardFieldProps) {
  return (
    <div className={clsx('space-y-1', className)}>
      <label className="block text-xs font-medium text-console-text">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-console-muted">{hint}</p>}
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

const inputBase =
  'w-full bg-console-card border border-console-border rounded-md px-3 py-2 text-sm text-console-text placeholder:text-console-muted/50 focus:outline-none focus:border-[#58a6ff] transition-colors';

export function WizardInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(inputBase, props.className)} />;
}

export function WizardTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={clsx(inputBase, 'resize-none', props.className)} />;
}

export function WizardSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={clsx(inputBase, 'bg-console-card cursor-pointer', props.className)}
    />
  );
}

interface WizardToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}

export function WizardToggle({ checked, onChange, label, description }: WizardToggleProps) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer">
      <div>
        <p className="text-xs font-medium text-console-text">{label}</p>
        {description && <p className="text-[11px] text-console-muted">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative w-9 h-5 rounded-full transition-colors flex-shrink-0',
          checked ? 'bg-[#238636]' : 'bg-console-card border border-console-border',
        )}
      >
        <span
          className={clsx(
            'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0.5',
          )}
        />
      </button>
    </label>
  );
}
