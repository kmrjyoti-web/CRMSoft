'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Package, Eye, MessageSquare, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { StatusBadge } from '@/components/common/status-badge';
import { useListings } from '@/hooks/use-listings';
import { useDebounce } from '@/hooks/use-debounce';
import { formatCurrency, formatNumber, timeAgo, extractList, extractMeta } from '@/lib/utils';
import { LISTING_TYPES, LISTING_STATUS } from '@/lib/constants';
import type { ListingFilters, Listing } from '@/types/listing';

export default function ListingsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const filters: ListingFilters = {
    search: debouncedSearch || undefined,
    type: typeFilter ? (typeFilter as ListingFilters['type']) : undefined,
    status: statusFilter ? (statusFilter as ListingFilters['status']) : undefined,
    page,
    limit: 12,
  };

  const { data: res, isLoading } = useListings(filters);

  const listings: Listing[] = extractList(res);
  const meta = extractMeta(res);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Listings</h1>
          <p className="text-sm text-gray-500">Manage your products, services and offers</p>
        </div>
        <Button onClick={() => router.push('/listings/new')}>
          <Plus className="h-4 w-4" />
          New Listing
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Search listings..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select
          options={[{ value: '', label: 'All Types' }, ...LISTING_TYPES.map((t) => ({ value: t.value, label: t.label }))]}
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="w-40"
        />
        <Select
          options={[{ value: '', label: 'All Status' }, ...LISTING_STATUS.map((s) => ({ value: s.value, label: s.label }))]}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="w-40"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-48 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No listings yet"
          description="Create your first listing to start selling"
          actionLabel="Create Listing"
          onAction={() => router.push('/listings/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <Card
              key={listing.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/listings/${listing.id}`)}
            >
              <CardContent className="p-4">
                {/* Image */}
                <div className="relative h-40 rounded-lg bg-gray-100 mb-3 overflow-hidden">
                  {listing.mediaUrls?.[0] ? (
                    <img src={listing.mediaUrls[0]} alt={listing.title} className="h-full w-full object-cover" /> // eslint-disable-line @next/next/no-img-element
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package className="h-10 w-10 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <StatusBadge value={listing.status} />
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
                <p className="text-sm text-gray-500 truncate mt-1">{listing.shortDescription}</p>

                <div className="flex items-center justify-between mt-3">
                  <div>
                    <span className="text-lg font-bold text-primary">{formatCurrency(listing.b2cPrice)}</span>
                    {listing.compareAtPrice && listing.compareAtPrice > listing.b2cPrice && (
                      <span className="text-sm text-gray-400 line-through ml-2">{formatCurrency(listing.compareAtPrice)}</span>
                    )}
                  </div>
                  {listing.b2bEnabled && <Badge variant="info">B2B</Badge>}
                </div>

                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatNumber(listing.viewCount)}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{formatNumber(listing.enquiryCount)}</span>
                  <span className="flex items-center gap-1"><ShoppingCart className="h-3 w-3" />{formatNumber(listing.orderCount)}</span>
                  <span className="ml-auto">{timeAgo(listing.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta?.totalPages && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            Previous
          </Button>
          <span className="text-sm text-gray-500">Page {page} of {meta.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= meta.totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
