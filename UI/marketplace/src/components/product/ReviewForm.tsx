'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSchema, type ReviewInput } from '../../lib/validators';
import { useCreateReview } from '../../hooks/useReviews';
import { StarRating } from '../common/StarRating';
import { X } from 'lucide-react';

export function ReviewForm({ listingId, onClose }: { listingId: string; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const mutation = useCreateReview(listingId);
  const { register, handleSubmit, formState: { errors } } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema) as any,
    defaultValues: { rating: 0 },
  });

  const onSubmit = async (data: ReviewInput) => {
    await mutation.mutateAsync({ listingId, ...data, rating });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white rounded-t-3xl w-full max-w-lg mx-auto p-6 pb-10 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-lg">Write a Review</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="flex justify-center py-2">
          <StarRating value={rating} onChange={setRating} size={36} />
        </div>

        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-3">
          <input
            {...register('title')}
            placeholder="Review title"
            className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-orange-400"
          />
          {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}

          <textarea
            {...register('body')}
            placeholder="Share your experience..."
            rows={4}
            className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-orange-400 resize-none"
          />
          {errors.body && <p className="text-red-500 text-xs">{errors.body.message}</p>}

          <button
            type="submit"
            disabled={mutation.isPending || rating === 0}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3.5 rounded-xl disabled:opacity-50"
          >
            {mutation.isPending ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
