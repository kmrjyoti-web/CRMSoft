'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api-client';

interface PlanCard {
  packageCode: string;
  packageName: string;
  tagline: string | null;
  priceMonthlyInr: number;
  priceYearlyInr: number;
  trialDays: number;
  isPopular: boolean;
  badgeText: string | null;
  color: string | null;
  featureFlags: Record<string, unknown>;
  limits: Record<string, unknown>;
  hasDedicatedDb: boolean;
  tier: number;
}

type BillingCycle = 'MONTHLY' | 'YEARLY';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) { resolve(true); return; }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const GOLD = '#c9a25f';
const ACCENT_DEFAULT = '#6366f1';

export default function UpgradePage() {
  const [plans, setPlans] = useState<PlanCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState<BillingCycle>('MONTHLY');
  const [paying, setPaying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get('/api/v1/tenant/billing/plans'),
      api.get('/api/v1/tenant/billing/upgrade/status'),
    ])
      .then(([plansRes, statusRes]) => {
        setPlans((plansRes.data?.data as PlanCard[]) ?? []);
        setCurrentPlan((statusRes.data?.data as { planCode: string | null })?.planCode ?? null);
      })
      .catch(() => setError('Failed to load plans. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpgrade(plan: PlanCard) {
    if (paying) return;
    setPaying(plan.packageCode);
    setError(null);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error('Failed to load payment gateway. Please check your connection.');

      const res = await api.post('/api/v1/tenant/billing/upgrade', {
        packageCode: plan.packageCode,
        billingCycle: cycle,
      });
      const order = res.data?.data as {
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
        packageName: string;
      };

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'CRMSoft',
          description: `${order.packageName} — ${cycle === 'YEARLY' ? 'Annual' : 'Monthly'} Plan`,
          order_id: order.orderId,
          theme: { color: GOLD },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              await api.post('/api/v1/tenant/billing/upgrade/confirm', {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                packageCode: plan.packageCode,
                billingCycle: cycle,
              });
              setCurrentPlan(plan.packageCode);
              setSuccess(`Successfully upgraded to ${plan.packageName}!`);
              resolve();
            } catch {
              reject(new Error('Payment verified but plan activation failed. Contact support.'));
            }
          },
          modal: {
            ondismiss: () => reject(new Error('__dismissed__')),
          },
        });
        rzp.open();
      });
    } catch (err) {
      const msg = (err as Error).message;
      if (msg !== '__dismissed__') setError(msg || 'Payment failed. Please try again.');
    } finally {
      setPaying(null);
    }
  }

  const yearlyDiscount = 20;

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px', color: '#0f172a' }}>
          Upgrade your plan
        </h1>
        <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>
          Choose the plan that fits your growth. Upgrade anytime — changes take effect immediately.
        </p>
      </div>

      {/* Billing cycle toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
        <button
          onClick={() => setCycle('MONTHLY')}
          style={{
            padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            border: '1.5px solid',
            borderColor: cycle === 'MONTHLY' ? GOLD : 'rgba(0,0,0,0.12)',
            background: cycle === 'MONTHLY' ? `${GOLD}18` : 'transparent',
            color: cycle === 'MONTHLY' ? GOLD : '#64748b',
            transition: 'all 0.15s',
          }}
        >
          Monthly
        </button>
        <button
          onClick={() => setCycle('YEARLY')}
          style={{
            padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            border: '1.5px solid',
            borderColor: cycle === 'YEARLY' ? GOLD : 'rgba(0,0,0,0.12)',
            background: cycle === 'YEARLY' ? `${GOLD}18` : 'transparent',
            color: cycle === 'YEARLY' ? GOLD : '#64748b',
            transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          Yearly
          <span style={{
            background: '#16a34a', color: '#fff', fontSize: 10, fontWeight: 700,
            padding: '2px 6px', borderRadius: 4, letterSpacing: 0.5,
          }}>
            SAVE {yearlyDiscount}%
          </span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
          padding: '12px 16px', marginBottom: 24, fontSize: 14, color: '#dc2626',
        }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10,
          padding: '12px 16px', marginBottom: 24, fontSize: 14, color: '#15803d', fontWeight: 600,
        }}>
          {success}
        </div>
      )}

      {/* Plans grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '3px solid #e2e8f0', borderTopColor: GOLD,
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 20,
        }}>
          {plans.map((plan) => {
            const accent = plan.color ?? ACCENT_DEFAULT;
            const price = cycle === 'YEARLY' ? plan.priceYearlyInr : plan.priceMonthlyInr;
            const isCurrent = currentPlan === plan.packageCode;
            const isPaying = paying === plan.packageCode;
            const features = Object.entries(plan.featureFlags).filter(([, v]) => v === true);

            return (
              <div
                key={plan.packageCode}
                style={{
                  background: '#fff',
                  border: `2px solid ${plan.isPopular ? accent : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: 16,
                  padding: '28px 24px',
                  position: 'relative',
                  boxShadow: plan.isPopular ? `0 8px 32px ${accent}22` : '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
              >
                {/* Badge */}
                {(plan.isPopular || plan.badgeText) && (
                  <div style={{
                    position: 'absolute', top: -12, left: 24,
                    background: accent, color: '#fff',
                    fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                    padding: '4px 10px', borderRadius: 6,
                    textTransform: 'uppercase',
                  }}>
                    {plan.badgeText ?? 'Most Popular'}
                  </div>
                )}

                {/* Plan name */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: accent, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                    {plan.packageCode}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
                    {plan.packageName}
                  </div>
                  {plan.tagline && (
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                      {plan.tagline}
                    </div>
                  )}
                </div>

                {/* Price */}
                <div style={{ margin: '20px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>₹</span>
                    <span style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>
                      {price === 0 ? 'Free' : price.toLocaleString('en-IN')}
                    </span>
                    {price > 0 && (
                      <span style={{ fontSize: 13, color: '#94a3b8' }}>
                        /{cycle === 'YEARLY' ? 'yr' : 'mo'}
                      </span>
                    )}
                  </div>
                  {cycle === 'YEARLY' && plan.priceMonthlyInr > 0 && (
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                      ₹{Math.round(plan.priceYearlyInr / 12).toLocaleString('en-IN')}/mo billed annually
                    </div>
                  )}
                  {plan.trialDays > 0 && (
                    <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginTop: 6 }}>
                      {plan.trialDays}-day free trial
                    </div>
                  )}
                </div>

                {/* Features */}
                {features.length > 0 && (
                  <ul style={{ margin: '0 0 20px', padding: 0, listStyle: 'none', fontSize: 13, color: '#475569' }}>
                    {features.slice(0, 6).map(([key]) => (
                      <li key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ color: accent, fontWeight: 700, fontSize: 14 }}>✓</span>
                        <span style={{ textTransform: 'capitalize' }}>
                          {key.replace(/_/g, ' ').toLowerCase()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {plan.hasDedicatedDb && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: 12, color: '#7c3aed', fontWeight: 600,
                    marginBottom: 16,
                  }}>
                    <span>⚡</span> Dedicated Database
                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={isCurrent || paying !== null || price === 0}
                  style={{
                    width: '100%', padding: '11px 0', borderRadius: 10, border: 'none',
                    fontSize: 14, fontWeight: 600, cursor: isCurrent || paying !== null || price === 0 ? 'default' : 'pointer',
                    background: isCurrent
                      ? 'rgba(0,0,0,0.06)'
                      : isPaying
                        ? 'rgba(0,0,0,0.06)'
                        : price === 0
                          ? 'rgba(0,0,0,0.06)'
                          : `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`,
                    color: isCurrent || price === 0 ? '#94a3b8' : isPaying ? '#94a3b8' : '#fff',
                    boxShadow: isCurrent || isPaying || price === 0 ? 'none' : `0 4px 16px ${accent}44`,
                    transition: 'all 0.2s',
                    opacity: paying !== null && !isPaying ? 0.5 : 1,
                  }}
                >
                  {isCurrent
                    ? '✓ Current plan'
                    : isPaying
                      ? 'Opening payment…'
                      : price === 0
                        ? 'Free plan'
                        : 'Upgrade now →'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer note */}
      <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 40 }}>
        All plans include GST. Payments processed securely by Razorpay. No hidden fees.
      </p>
    </div>
  );
}
