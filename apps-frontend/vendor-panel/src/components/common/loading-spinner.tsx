import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  label?: string;
}

export function LoadingSpinner({ className, label = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn('flex items-center justify-center p-8', className)}
    >
      <div aria-hidden="true" className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
