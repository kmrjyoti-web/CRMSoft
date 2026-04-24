'use client';

import { forwardRef } from 'react';

import { AICRating } from '@coreui/ui-react';

type RatingProps = React.ComponentProps<typeof AICRating>;

export const Rating = forwardRef<HTMLElement, RatingProps>((props, ref) => {
  return <AICRating ref={ref as any} {...props} />;
});
Rating.displayName = 'Rating';
