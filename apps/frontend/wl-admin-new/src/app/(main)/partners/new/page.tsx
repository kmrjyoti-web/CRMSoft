'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { partnersService } from '@/services/partners.service';
import toast from 'react-hot-toast';

const steps = ['Partner Info', 'Branding', 'Domain', 'Pricing'];

export default function NewPartnerPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const [form, setForm] = useState({
    companyName: '', contactName: '', email: '', phone: '', plan: 'STARTER', password: 'Partner@123',
    brandName: '', primaryColor: '#1E40AF', domain: '',
  });

  const { mutate, isPending } = useMutation({
    mutationFn: () => partnersService.create({
      companyName: form.companyName,
      contactName: form.contactName,
      email: form.email,
      phone: form.phone,
      plan: form.plan as any,
      password: form.password,
    }),
    onSuccess: (partner) => { toast.success('Partner onboarded!'); router.push(`/partners/${partner.id}`); },
    onError: () => toast.error('Failed to create partner'),
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Onboard New Partner</h1>
      <div className="flex gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${i <= step ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-500'}`}>{i + 1}</div>
            <span className={`text-sm ${i === step ? 'text-white' : 'text-gray-500'}`}>{s}</span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-gray-700 mx-2" />}
          </div>
        ))}
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Partner Information</h2>
            {[['companyName', 'Company Name'], ['contactName', 'Contact Name'], ['email', 'Email'], ['phone', 'Phone']].map(([k, label]) => (
              <div key={k}>
                <label className="block text-sm text-gray-400 mb-1">{label}</label>
                <input value={(form as any)[k]} onChange={(e) => update(k, e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Plan</label>
              <select value={form.plan} onChange={(e) => update('plan', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none">
                {['STARTER', 'PROFESSIONAL', 'ENTERPRISE'].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Brand Setup</h2>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Brand Name</label>
              <input value={form.brandName} onChange={(e) => update('brandName', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Primary Color</label>
              <div className="flex gap-3 items-center">
                <input type="color" value={form.primaryColor} onChange={(e) => update('primaryColor', e.target.value)} className="w-12 h-10 rounded cursor-pointer" />
                <input value={form.primaryColor} onChange={(e) => update('primaryColor', e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none" />
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Domain Setup</h2>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Primary Domain (e.g. app.partner.in)</label>
              <input value={form.domain} onChange={(e) => update('domain', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none" />
            </div>
            <p className="text-xs text-gray-500">Domain can be configured after partner creation. Skip for now.</p>
          </div>
        )}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Pricing</h2>
            <p className="text-sm text-gray-400">Service pricing will be configured after partner creation. Default pricing from service tiers will apply.</p>
          </div>
        )}
        <div className="flex justify-between mt-6 pt-6 border-t border-gray-800">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-30 transition">Back</button>
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(step + 1)} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition">Next</button>
          ) : (
            <button onClick={() => mutate()} disabled={isPending}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition disabled:opacity-50">
              {isPending ? 'Creating...' : 'Create Partner'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
