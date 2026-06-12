'use client';

import { forwardRef } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';
