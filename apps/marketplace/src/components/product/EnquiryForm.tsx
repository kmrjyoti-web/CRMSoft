'use client';

import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { enquirySchema, type EnquiryInput } from '../../lib/validators';
import { useCreateEnquiry } from '../../hooks/useEnquiries';
import { X } from 'lucide-react';

interface EnquiryFormProps {
  listingId: string;
  listingTitle: string;
  onClose: () => void;
}

export function EnquiryForm({ listingId, listingTitle, onClose }: EnquiryFormProps) {
  const mutation = useCreateEnquiry();
  const { register, handleSubmit, formState: { errors } } = useForm<EnquiryInput>({
    resolver: zodResolver(enquirySchema) as Resolver<EnquiryInput>,
  });

  const onSubmit = async (data: EnquiryInput) => {
    await mutation.mutateAsync({ listingId, ...data });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white rounded-t-3xl w-full max-w-lg mx-auto p-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-lg">Send Enquiry</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <p className="text-sm text-gray-500 mb-4">{listingTitle}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <textarea
              {...register('message')}
              placeholder="What would you like to know? (e.g., delivery timeline, bulk discount...)"
              rows={4}
              className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-orange-400 resize-none"
            />
            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="number"
                {...register('quantity', { valueAsNumber: true })}
                placeholder="Qty needed"
                className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
            <div className="flex-1">
              <input
                type="number"
                {...register('targetPrice', { valueAsNumber: true })}
                placeholder="Target price (₹)"
                className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3.5 rounded-xl disabled:opacity-60"
          >
            {mutation.isPending ? 'Sending...' : 'Send Enquiry'}
          </button>
        </form>
      </div>
    </div>
  );
}
