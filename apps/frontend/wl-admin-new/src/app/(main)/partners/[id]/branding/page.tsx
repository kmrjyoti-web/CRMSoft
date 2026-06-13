'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { brandingService } from '@/services/branding.service';
import toast from 'react-hot-toast';

export default function BrandingPage() {
  const { id } = useParams() as { id: string };
  const qc = useQueryClient();
  const { data: branding } = useQuery({
    queryKey: ['branding', id],
    queryFn: () => brandingService.get(id),
    retry: false,
  });
  const [form, setForm] = useState({
    brandName: '',
    tagline: '',
    primaryColor: '#1E40AF',
    secondaryColor: '#3B82F6',
    accentColor: '#F59E0B',
    fontFamily: 'Inter',
    supportEmail: '',
    customCss: '',
  });

  useEffect(() => {
    if (branding) {
      setForm({
        brandName: branding.brandName || '',
        tagline: branding.tagline || '',
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
        accentColor: branding.accentColor,
        fontFamily: branding.fontFamily,
        supportEmail: branding.supportEmail || '',
        customCss: branding.customCss || '',
      });
    }
  }, [branding]);

  const mutation = useMutation({
    mutationFn: () =>
      branding ? brandingService.update(id, form) : brandingService.create({ ...form, partnerId: id }),
    onSuccess: () => { toast.success('Branding saved'); qc.invalidateQueries({ queryKey: ['branding', id] }); },
    onError: () => toast.error('Failed to save'),
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-6">Branding Editor</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Brand Identity</h2>
          {[['brandName', 'Brand Name'], ['tagline', 'Tagline'], ['supportEmail', 'Support Email']].map(([k, label]) => (
            <div key={k}>
              <label className="block text-sm text-gray-400 mb-1">{label}</label>
              <input value={(form as any)[k]} onChange={(e) => update(k, e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Font Family</label>
            <select value={form.fontFamily} onChange={(e) => update('fontFamily', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none">
              {['Inter', 'Roboto', 'Poppins', 'Open Sans', 'Nunito'].map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Theme Colors</h2>
          {[['primaryColor', 'Primary'], ['secondaryColor', 'Secondary'], ['accentColor', 'Accent']].map(([k, label]) => (
            <div key={k}>
              <label className="block text-sm text-gray-400 mb-1">{label}</label>
              <div className="flex gap-3 items-center">
                <input type="color" value={(form as any)[k]} onChange={(e) => update(k, e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer bg-transparent" />
                <div className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white">{(form as any)[k]}</div>
              </div>
            </div>
          ))}
          <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: form.primaryColor }}>
            <div className="text-white font-medium text-sm">{form.brandName || 'Brand Preview'}</div>
            <div className="text-white/70 text-xs mt-1">{form.tagline || 'Your tagline here'}</div>
          </div>
        </div>
        <div className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <label className="block text-sm text-gray-400 mb-1">Custom CSS</label>
          <textarea value={form.customCss} onChange={(e) => update('customCss', e.target.value)} rows={6}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none font-mono text-sm"
            placeholder=":root { --primary: #1E40AF; }" />
        </div>
      </div>
      <div className="mt-6">
        <button onClick={() => mutation.mutate()} disabled={mutation.isPending}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50">
          {mutation.isPending ? 'Saving...' : 'Save Branding'}
        </button>
      </div>
    </div>
  );
}
