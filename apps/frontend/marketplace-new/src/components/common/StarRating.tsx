'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  max?: number;
  size?: number;
  onChange?: (value: number) => void;
  className?: string;
}

export function StarRating({ value, max = 5, size = 16, onChange, className = '' }: StarRatingProps) {
  return (
    <div className={`flex gap-0.5 ${className}`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(value);
        const half = !filled && i < value;
        return (
          <button
            key={i}
            type="button"
            onClick={onChange ? () => onChange(i + 1) : undefined}
            className={onChange ? 'cursor-pointer' : 'cursor-default'}
          >
            <Star
              size={size}
              className={filled || half ? 'text-amber-400' : 'text-gray-200'}
              fill={filled ? '#fbbf24' : half ? 'url(#half)' : 'none'}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
}
