'use client';

import { useBrandContext } from '@/hooks/auth/useBrandContext';
import DefaultLogin from './DefaultLogin';

type Props = {
  onSuccess?: () => void;
};

// Legacy resolver — superseded by static brand registry in WAR#20.
// Brand pages now resolve via getBrandConfig() in (auth)/login/page.tsx.
// Kept for reference; not mounted anywhere.
export default function BrandLoginResolver({ onSuccess }: Props) {
  const { config } = useBrandContext();

  if (!config) {
    return <DefaultLogin onSuccess={onSuccess} />;
  }

  const BrandComponent = config.loginComponent;
  return <BrandComponent onSuccess={onSuccess} />;
}
