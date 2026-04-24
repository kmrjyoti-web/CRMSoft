"use client";

import dynamic from "next/dynamic";

const ShortcutAdminPage = dynamic(
  () => import("@/features/shortcuts/components/ShortcutAdminPage").then((m) => m.ShortcutAdminPage),
  { ssr: false },
);

export default function ShortcutsSettingsPage() {
  return <ShortcutAdminPage />;
}
