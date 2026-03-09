'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PriceTierEditor } from '@/components/listings/price-tier-editor';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { useListing, useUpdateListing } from '@/hooks/use-listings';
import { LISTING_TYPES, VISIBILITY_TYPES } from '@/lib/constants';
import type { CreateListingDto } from '@/types/listing';

export default function EditListingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: res, isLoading } = useListing(params.id);
  const updateMut = useUpdateListing();
  const [form, setForm] = useState<Partial<CreateListingDto>>({});

  const listing = res?.data;

  useEffect(() => {
    if (listing) {
      setForm({
        listingType: listing.listingType,
        title: listing.title,
        shortDescription: listing.shortDescription ?? '',
        description: listing.description ?? '',
        category: listing.category ?? '',
        tags: listing.tags ?? [],
        b2cPrice: listing.b2cPrice,
        compareAtPrice: listing.compareAtPrice,
        b2bEnabled: listing.b2bEnabled,
        b2bTiers: listing.b2bTiers?.map((t) => ({ minQty: t.minQty, maxQty: t.maxQty, pricePerUnit: t.pricePerUnit, customerGrade: t.customerGrade })) ?? [],
        visibility: listing.visibility,
        moq: listing.moq,
        stockAvailable: listing.stockAvailable,
        metaTitle: listing.metaTitle,
        metaDescription: listing.metaDescription,
      });
    }
  }, [listing]);

  if (isLoading) return <LoadingSpinner />;
  if (!listing) return <div className="text-center py-16 text-gray-500">Listing not found</div>;

  const set = (field: string, value: unknown) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    try {
      await updateMut.mutateAsync({ id: params.id, data: form });
      toast.success('Listing updated!');
      router.push(`/listings/${params.id}`);
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Edit Listing</h1>
        </div>
        <Button onClick={handleSave} loading={updateMut.isPending}>
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select label="Type" options={LISTING_TYPES.map((t) => ({ value: t.value, label: t.label }))} value={form.listingType ?? ''} onChange={(e) => set('listingType', e.target.value)} />
          <Input label="Title" value={form.title ?? ''} onChange={(e) => set('title', e.target.value)} />
          <Input label="Short Description" value={form.shortDescription ?? ''} onChange={(e) => set('shortDescription', e.target.value)} />
          <Textarea label="Full Description" value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} rows={5} />
          <Input label="Category" value={form.category ?? ''} onChange={(e) => set('category', e.target.value)} />
          <Select label="Visibility" options={VISIBILITY_TYPES.map((v) => ({ value: v.value, label: v.label }))} value={form.visibility ?? ''} onChange={(e) => set('visibility', e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Selling Price (INR)" type="number" value={form.b2cPrice ?? 0} onChange={(e) => set('b2cPrice', Number(e.target.value))} />
            <Input label="Compare At (INR)" type="number" value={form.compareAtPrice ?? ''} onChange={(e) => set('compareAtPrice', e.target.value ? Number(e.target.value) : undefined)} />
          </div>
          <Input label="MOQ" type="number" value={form.moq ?? 1} onChange={(e) => set('moq', Number(e.target.value))} />
          <Input label="Stock" type="number" value={form.stockAvailable ?? ''} onChange={(e) => set('stockAvailable', e.target.value ? Number(e.target.value) : undefined)} />
          <div className="flex items-center gap-3">
            <input type="checkbox" id="b2b" checked={form.b2bEnabled ?? false} onChange={(e) => set('b2bEnabled', e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
            <label htmlFor="b2b" className="text-sm font-medium text-gray-700">Enable B2B Pricing</label>
          </div>
          {form.b2bEnabled && (
            <PriceTierEditor tiers={form.b2bTiers ?? []} onChange={(tiers) => set('b2bTiers', tiers)} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
