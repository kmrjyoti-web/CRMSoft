import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import apiClient from '@/services/api-client';
import type { CalendarHighlight } from './types';

export function useCalendarHighlights(
  from: Date,
  to: Date,
  types?: string[],
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ['calendar-highlights', format(from, 'yyyy-MM'), format(to, 'yyyy-MM'), types],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: CalendarHighlight[] }>(
        '/api/v1/calendar/highlights',
        {
          params: {
            from: format(from, 'yyyy-MM-dd'),
            to: format(to, 'yyyy-MM-dd'),
            types: types?.join(','),
          },
        },
      );
      return res.data?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}
