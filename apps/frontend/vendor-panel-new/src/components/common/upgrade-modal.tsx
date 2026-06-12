'use client';

import { useRouter } from 'next/navigation';
import { Lock, Sparkles, Check, ArrowRight } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  moduleKey?: string;
}

const MODULE_FEATURES: Record<string, string[]> = {
  offers: [
    'Create discount offers & coupons',
    'Run promotional campaigns',
    'Track offer performance',
    'Set usage limits & expiry',
  ],
  analytics: [
    'Detailed sales analytics',
    'Product performance metrics',
    'Customer insights',
    'Export reports',
  ],
  'api-access': [
    'API key management',
    'Webhook integrations',
    'Third-party connections',
    'Developer tools',
  ],
};

export function UpgradeModal({ isOpen, onClose, featureName, moduleKey }: UpgradeModalProps) {
  const router = useRouter();
  const features = moduleKey ? MODULE_FEATURES[moduleKey] || [] : [];

  const handleUpgrade = () => {
    onClose();
    router.push('/subscription/plans');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Unlock {featureName}
          </h3>
          <p className="text-gray-600">
            This feature is available on Premium and Enterprise plans.
          </p>
        </div>

        {/* Features */}
        {features.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-indigo-700 font-medium mb-3">
              <Sparkles className="h-4 w-4" />
              <span>What you&apos;ll get:</span>
            </div>
            <ul className="space-y-2">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Maybe Later
          </Button>
          <Button onClick={handleUpgrade} className="flex-1 gap-2">
            View Plans
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
