import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary text-secondary-foreground',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-amber-100 text-amber-700',
        danger: 'bg-red-100 text-red-700',
        outline: 'border border-current',
        muted: 'bg-gray-100 text-gray-600',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export function statusBadgeVariant(status: string): BadgeProps['variant'] {
  const s = status.toLowerCase();
  if (['paid', 'active', 'resolved', 'completed', 'delivered'].includes(s)) return 'success';
  if (['pending', 'draft', 'open', 'processing'].includes(s)) return 'warning';
  if (['overdue', 'cancelled', 'rejected', 'failed'].includes(s)) return 'danger';
  return 'muted';
}
