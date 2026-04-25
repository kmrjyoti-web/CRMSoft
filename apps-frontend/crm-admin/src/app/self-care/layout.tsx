import type { ReactNode } from "react";

// Self-care panel — standalone layout (no sidebar, no header from (main))
export default function SelfCareLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
