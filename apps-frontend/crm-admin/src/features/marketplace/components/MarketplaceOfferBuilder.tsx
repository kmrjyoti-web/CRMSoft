"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Icon } from "@/components/ui";
import { OfferConditionBuilder } from "./OfferConditionBuilder";
import { OfferSchedulePreview } from "./OfferSchedulePreview";
import { useCreateOffer } from "../hooks/useMarketplace";
import type { CreateOfferDto, OfferType, DiscountType, OfferConditions } from "../types/marketplace.types";

const OFFER_TYPES: OfferType[] = ['ONE_TIME', 'DAILY_RECURRING', 'WEEKLY_RECURRING', 'FIRST_N_ORDERS', 'LAUNCH', 'CUSTOM'];
const DISCOUNT_TYPES: DiscountType[] = ['PERCENTAGE', 'FLAT_AMOUNT', 'FREE_SHIPPING', 'BUY_X_GET_Y', 'BUNDLE_PRICE'];

const EMPTY_CONDITIONS: OfferConditions = {};

export function MarketplaceOfferBuilderPage() {
  const router = useRouter();
  const { mutateAsync: createOffer, isPending } = useCreateOffer();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [offerType, setOfferType] = useState<OfferType>('ONE_TIME');
  const [discountType, setDiscountType] = useState<DiscountType>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [linkedListingIds, setLinkedListingIds] = useState('');
  const [conditions, setConditions] = useState<OfferConditions>(EMPTY_CONDITIONS);
  const [maxRedemptions, setMaxRedemptions] = useState('');
  const [publishAt, setPublishAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState('');

  const buildDto = (): CreateOfferDto => ({
    title,
    description: description || undefined,
    offerType,
    discountType,
    discountValue: Number(discountValue),
    linkedListingIds: linkedListingIds
      ? linkedListingIds.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined,
    conditions,
    maxRedemptions: maxRedemptions ? Number(maxRedemptions) : undefined,
    publishAt: publishAt || undefined,
    expiresAt: expiresAt || undefined,
  });

  const handleSaveDraft = async () => {
    setError('');
    if (!title || !discountValue) {
      setError('Title and discount value are required');
      return;
    }
    try {
      await createOffer(buildDto());
      router.push('/marketplace/offers');
    } catch {
      setError('Failed to save offer. Please try again.');
    }
  };

  const handlePublish = async () => {
    setError('');
    if (!title || !discountValue) {
      setError('Title and discount value are required');
      return;
    }
    try {
      await createOffer({ ...buildDto(), publishAt: publishAt || new Date().toISOString() });
      router.push('/marketplace/offers');
    } catch {
      setError('Failed to publish offer. Please try again.');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/marketplace/offers')} className="text-gray-500 hover:text-gray-700">
            <Icon name="arrow-left" size={18} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">New Offer</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isPending}>
            Save Draft
          </Button>
          <Button variant="primary" size="sm" onClick={handlePublish} disabled={isPending}>
            Publish
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left column: form */}
          <div className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
            )}

            {/* Basic info */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-800">Basic Information</h2>

              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1.5">Offer Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Summer Sale 20% Off"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Optional description..."
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-1.5">Offer Type</label>
                  <select
                    value={offerType}
                    onChange={(e) => setOfferType(e.target.value as OfferType)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    {OFFER_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-1.5">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    {DISCOUNT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1.5">
                  Discount Value *{' '}
                  {discountType === 'PERCENTAGE'
                    ? '(%)'
                    : discountType === 'FLAT_AMOUNT'
                    ? '(paisa)'
                    : ''}
                </label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === 'PERCENTAGE' ? '20' : '5000'}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            {/* Linked listings */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-800">Linked Listings</h2>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1.5">
                  Listing IDs (comma separated)
                </label>
                <input
                  type="text"
                  value={linkedListingIds}
                  onChange={(e) => setLinkedListingIds(e.target.value)}
                  placeholder="id1, id2, id3"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-800">Schedule</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-1.5">Publish At</label>
                  <input
                    type="datetime-local"
                    value={publishAt}
                    onChange={(e) => setPublishAt(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-1.5">Expires At</label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1.5">Max Redemptions</label>
                <input
                  type="number"
                  value={maxRedemptions}
                  onChange={(e) => setMaxRedemptions(e.target.value)}
                  placeholder="Leave empty for unlimited"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>
          </div>

          {/* Right column: conditions + preview */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Offer Conditions</h2>
              <OfferConditionBuilder value={conditions} onChange={setConditions} />
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Preview</h2>
              <OfferSchedulePreview
                offerType={offerType}
                conditions={conditions}
                maxRedemptions={maxRedemptions ? Number(maxRedemptions) : undefined}
                publishAt={publishAt || undefined}
                expiresAt={expiresAt || undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
