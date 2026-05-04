'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ChevronLeft, Image as ImageIcon, Tag } from 'lucide-react';

type PostType = 'POST' | 'PRODUCT' | 'OFFER' | 'REQUIREMENT';

const POST_TYPES: { type: PostType; label: string; emoji: string }[] = [
  { type: 'POST', label: 'Post', emoji: '📝' },
  { type: 'PRODUCT', label: 'Product', emoji: '📦' },
  { type: 'OFFER', label: 'Offer', emoji: '🏷️' },
  { type: 'REQUIREMENT', label: 'Requirement', emoji: '🔍' },
];

export default function NewPostPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<PostType>('POST');
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    // TODO: wire up to API mutation
    console.log({ type: selectedType, ...data });
    router.back();
  };

  return (
    <div className="min-h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-600">
          <ChevronLeft size={20} />
          <span className="text-sm">Cancel</span>
        </button>
        <h1 className="font-bold text-gray-900">Create</h1>
        <button
          form="post-form"
          type="submit"
          className="bg-orange-500 text-white text-sm font-bold px-4 py-1.5 rounded-xl"
        >
          Post
        </button>
      </div>

      {/* Type selector */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none border-b border-gray-100">
        {POST_TYPES.map(({ type, label, emoji }) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
              selectedType === type
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            <span>{emoji}</span>
            {label}
          </button>
        ))}
      </div>

      <form id="post-form" onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
        {selectedType === 'POST' && (
          <>
            <textarea
              {...register('text')}
              placeholder="What's on your mind?"
              rows={5}
              className="w-full text-sm text-gray-900 resize-none focus:outline-none placeholder:text-gray-400"
            />
            <div className="flex items-center gap-3 border-t border-gray-100 pt-3">
              <button type="button" className="flex items-center gap-1.5 text-xs text-gray-500">
                <ImageIcon size={16} /> Add Photo
              </button>
              <button type="button" className="flex items-center gap-1.5 text-xs text-gray-500">
                <Tag size={16} /> Add Tags
              </button>
            </div>
          </>
        )}

        {selectedType === 'PRODUCT' && (
          <>
            <input
              {...register('title')}
              placeholder="Product title"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
            />
            <input
              {...register('price')}
              type="number"
              placeholder="Price (₹)"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
            />
            <input
              {...register('mrp')}
              type="number"
              placeholder="MRP (₹) — optional"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
            />
            <textarea
              {...register('description')}
              placeholder="Product description"
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400 resize-none"
            />
            <button type="button" className="flex items-center gap-1.5 text-sm text-gray-500">
              <ImageIcon size={16} /> Add Images
            </button>
          </>
        )}

        {selectedType === 'OFFER' && (
          <>
            <input
              {...register('title')}
              placeholder="Offer title"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
            />
            <input
              {...register('code')}
              placeholder="Promo code (e.g. SAVE20)"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm uppercase font-mono focus:outline-none focus:border-orange-400"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                {...register('discountValue')}
                type="number"
                placeholder="Discount value"
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
              />
              <select
                {...register('discountType')}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
              >
                <option value="PERCENTAGE">%</option>
                <option value="FLAT">₹ Flat</option>
              </select>
            </div>
            <input
              {...register('expiresAt')}
              type="datetime-local"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
            />
          </>
        )}

        {selectedType === 'REQUIREMENT' && (
          <>
            <input
              {...register('title')}
              placeholder="What are you looking for?"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
            />
            <textarea
              {...register('description')}
              placeholder="Describe your requirement..."
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400 resize-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                {...register('quantity')}
                type="number"
                placeholder="Quantity needed"
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
              />
              <input
                {...register('budget')}
                type="number"
                placeholder="Budget (₹)"
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
          </>
        )}
      </form>
    </div>
  );
}
