import type { ReactNode } from 'react';

// Central portal pages render fullscreen — no BrandConfigProvider, no glass card wrapper.
export default function CentralLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
