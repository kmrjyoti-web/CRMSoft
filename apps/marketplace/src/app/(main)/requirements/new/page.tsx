'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ChevronLeft } from 'lucide-react';

export default function NewRequirementPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    // TODO: wire up to requirementService.create
    console.log(data);
    router.back();
  };

  return (
    <div className="min-h-full bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-600">
          <ChevronLeft size={20} />
          <span className="text-sm">Cancel</span>
        </button>
        <h1 className="font-bold text-gray-900">Post Requirement</h1>
        <button
          form="req-form"
          type="submit"
          className="bg-orange-500 text-white text-sm font-bold px-4 py-1.5 rounded-xl"
        >
          Post
        </button>
      </div>

      <form id="req-form" onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">What are you looking for? *</label>
          <input
            {...register('title', { required: true })}
            placeholder="e.g., Industrial Grade Screws"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Category</label>
          <select
            {...register('category')}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
          >
            <option value="">Select category</option>
            {['Electronics', 'Clothing', 'Food', 'Machinery', 'Pharma', 'Other'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
          <textarea
            {...register('description')}
            placeholder="Describe specifications, quality requirements, delivery timeline..."
            rows={4}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Quantity needed</label>
            <input
              {...register('quantity', { valueAsNumber: true })}
              type="number"
              placeholder="e.g., 1000"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Budget (₹)</label>
            <input
              {...register('budget', { valueAsNumber: true })}
              type="number"
              placeholder="e.g., 50000"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
