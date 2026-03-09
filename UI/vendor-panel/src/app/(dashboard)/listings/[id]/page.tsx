'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Eye, MessageSquare, ShoppingCart, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/status-badge';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { useListing, useDeleteListing } from '@/hooks/use-listings';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: res, isLoading } = useListing(params.id);
  const deleteMut = useDeleteListing();
  const listing = res?.data;

  if (isLoading) return <LoadingSpinner />;
  if (!listing) return <div className="text-center py-16 text-gray-500">Listing not found</div>;

  const handleDelete = async () => {
    if (!confirm('Delete this listing?')) return;
    try {
      await deleteMut.mutateAsync(listing.id);
      toast.success('Listing deleted');
      router.push('/listings');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{listing.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge value={listing.status} />
              <Badge variant="outline">{listing.listingType}</Badge>
              {listing.b2bEnabled && <Badge variant="info">B2B Enabled</Badge>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/listings/${listing.id}/edit`)}>
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete} loading={deleteMut.isPending}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Views', value: formatNumber(listing.viewCount), icon: Eye, color: 'text-blue-600' },
          { label: 'Enquiries', value: formatNumber(listing.enquiryCount), icon: MessageSquare, color: 'text-purple-600' },
          { label: 'Orders', value: formatNumber(listing.orderCount), icon: ShoppingCart, color: 'text-green-600' },
          { label: 'Price', value: formatCurrency(listing.b2cPrice), icon: IndianRupee, color: 'text-orange-600' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Category</span><span>{listing.category ?? '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Visibility</span><span>{listing.visibility}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">MOQ</span><span>{listing.moq ?? 1}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Stock</span><span>{listing.stockAvailable ?? 'Unlimited'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Created</span><span>{formatDate(listing.createdAt)}</span></div>
            {listing.tags?.length > 0 && (
              <div>
                <span className="text-gray-500">Tags:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {listing.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Pricing</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Selling Price</span>
              <span className="font-bold text-lg">{formatCurrency(listing.b2cPrice)}</span>
            </div>
            {listing.compareAtPrice && (
              <div className="flex justify-between">
                <span className="text-gray-500">Compare At</span>
                <span className="line-through text-gray-400">{formatCurrency(listing.compareAtPrice)}</span>
              </div>
            )}
            {listing.b2bTiers?.length > 0 && (
              <div className="mt-3">
                <h4 className="font-medium mb-2">B2B Tiers</h4>
                <div className="space-y-2">
                  {listing.b2bTiers.map((tier) => (
                    <div key={tier.id} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>{tier.minQty}{tier.maxQty ? ` - ${tier.maxQty}` : '+'} units</span>
                      <span className="font-medium">{formatCurrency(tier.pricePerUnit)}/unit</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {listing.description && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Description</CardTitle></CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: listing.description }} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
