'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { partnerService } from '@/services/partner.service';
import toast from 'react-hot-toast';

export default function BrandingPage() {
  const qc = useQueryClient();
  const { data: branding } = useQuery({
    queryKey: ['partner-branding'],
    queryFn: () => partnerService.getBranding(),
    retry: false,
  });

  const [form, setForm] = useState({
    brandName: '',
    tagline: '',
    logoUrl: '',
    primaryColor: '#1E40AF',
    secondaryColor: '#3B82F6',
    accentColor: '#F59E0B',
    fontFamily: 'Inter',
    supportEmail: '',
  });

  useEffect(() => {
    if (branding) {
      setForm({
        brandName: branding.brandName || '',
        tagline: branding.tagline || '',
        logoUrl: branding.logoUrl || '',
        primaryColor: branding.primaryColor || '#1E40AF',
        secondaryColor: branding.secondaryColor || '#3B82F6',
        accentColor: branding.accentColor || '#F59E0B',
        fontFamily: branding.fontFamily || 'Inter',
        supportEmail: branding.supportEmail || '',
      });
    }
  }, [branding]);

  const mutation = useMutation({
    mutationFn: () => partnerService.updateBranding(form),
    onSuccess: () => { toast.success('Branding saved'); qc.invalidateQueries({ queryKey: ['partner-branding'] }); },
    onError: () => toast.error('Failed to save branding'),
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Branding</h1>
          <p className="text-sm text-gray-400 mt-1">Changes apply within your plan limits.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Brand Identity</h2>
          {[
            ['brandName', 'Brand Name', 'text'],
            ['tagline', 'Tagline', 'text'],
            ['logoUrl', 'Logo URL', 'url'],
            ['supportEmail', 'Support Email', 'email'],
          ].map(([k, label, type]) => (
            <div key={k}>
              <label className="block text-sm text-gray-400 mb-1">{label}</label>
              <input type={type} value={(form as any)[k]} onChange={(e) => update(k, e.target.value)}
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
          {[
            ['primaryColor', 'Primary Color'],
            ['secondaryColor', 'Secondary Color'],
            ['accentColor', 'Accent Color'],
          ].map(([k, label]) => (
            <div key={k}>
              <label className="block text-sm text-gray-400 mb-1">{label}</label>
              <div className="flex gap-3 items-center">
                <input type="color" value={(form as any)[k]} onChange={(e) => update(k, e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer bg-transparent border-0" />
                <div className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white">{(form as any)[k]}</div>
              </div>
            </div>
          ))}
          <div className="mt-4 p-4 rounded-xl border border-gray-700" style={{ backgroundColor: form.primaryColor }}>
            <div className="flex items-center gap-3 mb-2">
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="logo" className="w-8 h-8 rounded object-contain bg-white/10" />
              ) : (
                <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                  {form.brandName?.charAt(0) || 'B'}
                </div>
              )}
              <div className="text-white font-semibold text-sm">{form.brandName || 'Brand Preview'}</div>
            </div>
            <div className="text-white/70 text-xs">{form.tagline || 'Your tagline here'}</div>
          </div>
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
