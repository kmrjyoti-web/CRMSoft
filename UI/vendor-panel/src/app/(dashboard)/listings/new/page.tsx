'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PriceTierEditor } from '@/components/listings/price-tier-editor';
import { useCreateListing } from '@/hooks/use-listings';
import { LISTING_TYPES, VISIBILITY_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { CreateListingDto } from '@/types/listing';

const STEPS = ['Basic Info', 'Pricing & B2B', 'Inventory & Shipping', 'Review'];

export default function NewListingPage() {
  const router = useRouter();
  const createMut = useCreateListing();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CreateListingDto>({
    listingType: 'PRODUCT',
    title: '',
    shortDescription: '',
    description: '',
    category: '',
    tags: [],
    mediaUrls: [],
    b2cPrice: 0,
    b2bEnabled: false,
    b2bTiers: [],
    visibility: 'VIS_PUBLIC',
    moq: 1,
    stockAvailable: undefined,
  });

  const set = (field: keyof CreateListingDto, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    try {
      await createMut.mutateAsync(form);
      toast.success('Listing created!');
      router.push('/listings');
    } catch {
      toast.error('Failed to create listing');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Listing</h1>
          <p className="text-sm text-gray-500">Step {step + 1} of {STEPS.length}</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium', i <= step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500')}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn('text-sm hidden sm:block', i <= step ? 'text-primary font-medium' : 'text-gray-400')}>{s}</span>
            {i < STEPS.length - 1 && <div className={cn('w-8 h-0.5', i < step ? 'bg-primary' : 'bg-gray-200')} />}
          </div>
        ))}
      </div>

      {/* Step 1: Basic */}
      {step === 0 && (
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Listing Type"
              options={LISTING_TYPES.map((t) => ({ value: t.value, label: t.label }))}
              value={form.listingType}
              onChange={(e) => set('listingType', e.target.value)}
            />
            <Input label="Title" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Industrial Ball Bearings" required />
            <Input label="Short Description" value={form.shortDescription ?? ''} onChange={(e) => set('shortDescription', e.target.value)} placeholder="Brief summary (max 200 chars)" />
            <Textarea label="Full Description" value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} rows={5} placeholder="Detailed description..." />
            <Input label="Category" value={form.category ?? ''} onChange={(e) => set('category', e.target.value)} placeholder="e.g. Industrial Parts" />
            <Input label="Tags (comma-separated)" value={form.tags?.join(', ') ?? ''} onChange={(e) => set('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))} placeholder="bearings, industrial, parts" />
            <Select
              label="Visibility"
              options={VISIBILITY_TYPES.map((v) => ({ value: v.value, label: v.label }))}
              value={form.visibility ?? 'VIS_PUBLIC'}
              onChange={(e) => set('visibility', e.target.value)}
            />
          </CardContent>
        </Card>
      )}

      {/* Step 2: Pricing */}
      {step === 1 && (
        <Card>
          <CardHeader><CardTitle>Pricing & B2B</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Selling Price (INR)" type="number" value={form.b2cPrice} onChange={(e) => set('b2cPrice', Number(e.target.value))} />
              <Input label="Compare At Price (INR)" type="number" value={form.compareAtPrice ?? ''} onChange={(e) => set('compareAtPrice', e.target.value ? Number(e.target.value) : undefined)} placeholder="MRP / original price" />
            </div>
            <Input label="Minimum Order Qty" type="number" value={form.moq ?? 1} onChange={(e) => set('moq', Number(e.target.value))} />
            <div className="flex items-center gap-3">
              <input type="checkbox" id="b2b" checked={form.b2bEnabled ?? false} onChange={(e) => set('b2bEnabled', e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
              <label htmlFor="b2b" className="text-sm font-medium text-gray-700">Enable B2B Tiered Pricing</label>
            </div>
            {form.b2bEnabled && (
              <PriceTierEditor tiers={form.b2bTiers ?? []} onChange={(tiers) => set('b2bTiers', tiers)} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Inventory */}
      {step === 2 && (
        <Card>
          <CardHeader><CardTitle>Inventory & Shipping</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Stock Available" type="number" value={form.stockAvailable ?? ''} onChange={(e) => set('stockAvailable', e.target.value ? Number(e.target.value) : undefined)} placeholder="Leave empty for unlimited" />
            <Input label="HSN / SAC Code" value={form.attributes?.hsnCode as string ?? ''} onChange={(e) => set('attributes', { ...form.attributes, hsnCode: e.target.value })} placeholder="e.g. 8482" />
            <Input label="Meta Title (SEO)" value={form.metaTitle ?? ''} onChange={(e) => set('metaTitle', e.target.value)} />
            <Input label="Meta Description (SEO)" value={form.metaDescription ?? ''} onChange={(e) => set('metaDescription', e.target.value)} />
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review */}
      {step === 3 && (
        <Card>
          <CardHeader><CardTitle>Review & Submit</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Type:</span> <strong>{form.listingType}</strong></div>
              <div><span className="text-gray-500">Title:</span> <strong>{form.title}</strong></div>
              <div><span className="text-gray-500">Price:</span> <strong>INR {form.b2cPrice}</strong></div>
              <div><span className="text-gray-500">B2B:</span> <strong>{form.b2bEnabled ? `Yes (${form.b2bTiers?.length ?? 0} tiers)` : 'No'}</strong></div>
              <div><span className="text-gray-500">Visibility:</span> <strong>{form.visibility}</strong></div>
              <div><span className="text-gray-500">Stock:</span> <strong>{form.stockAvailable ?? 'Unlimited'}</strong></div>
            </div>
            {form.shortDescription && <p className="text-sm text-gray-600">{form.shortDescription}</p>}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)}>
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={createMut.isPending}>
            <Save className="h-4 w-4" />
            Create Listing
          </Button>
        )}
      </div>
    </div>
  );
}
