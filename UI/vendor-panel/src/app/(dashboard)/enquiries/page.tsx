'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { StatusBadge } from '@/components/common/status-badge';
import { enquiriesApi } from '@/lib/api/enquiries';
import { useDebounce } from '@/hooks/use-debounce';
import { ENQUIRY_STATUS } from '@/lib/constants';
import { timeAgo, formatCurrency, truncate, extractList } from '@/lib/utils';
import type { Enquiry, EnquiryFilters } from '@/types/enquiry';

export default function EnquiriesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const filters: EnquiryFilters = {
    search: debouncedSearch || undefined,
    status: statusFilter ? (statusFilter as EnquiryFilters['status']) : undefined,
    page,
    limit: 20,
  };

  const { data: res, isLoading } = useQuery({
    queryKey: ['enquiries', filters],
    queryFn: () => enquiriesApi.list(filters),
  });

  const enquiries: Enquiry[] = extractList(res);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enquiries</h1>
        <p className="text-sm text-gray-500">Respond to buyer inquiries</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input leftIcon={<Search className="h-4 w-4" />} placeholder="Search enquiries..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select
          options={[{ value: '', label: 'All Status' }, ...ENQUIRY_STATUS.map((s) => ({ value: s.value, label: s.label }))]}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="w-44"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : enquiries.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No enquiries" description="Enquiries from buyers will appear here" />
      ) : (
        <div className="space-y-3">
          {enquiries.map((enq) => (
            <Card key={enq.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/enquiries/${enq.id}`)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {enq.buyer?.firstName} {enq.buyer?.lastName}
                        {enq.buyer?.companyName && <span className="text-gray-500 font-normal"> ({enq.buyer.companyName})</span>}
                      </p>
                      <StatusBadge value={enq.status} />
                    </div>
                    {enq.listing && <p className="text-xs text-primary mb-1">Re: {enq.listing.title}</p>}
                    <p className="text-sm text-gray-600 line-clamp-2">{truncate(enq.message, 150)}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      {enq.quantity && <span>Qty: {enq.quantity}</span>}
                      {enq.budget && <span>Budget: {formatCurrency(enq.budget)}</span>}
                      <span>{timeAgo(enq.createdAt)}</span>
                      <span>{enq.thread?.length ?? 0} replies</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Previous</Button>
        <span className="text-sm text-gray-500">Page {page}</span>
        <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={enquiries.length < 20}>Next</Button>
      </div>
    </div>
  );
}
