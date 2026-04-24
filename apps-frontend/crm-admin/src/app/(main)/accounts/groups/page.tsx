"use client";

import dynamic from "next/dynamic";

const AccountGroupList = dynamic(
  () =>
    import("@/features/accounts/components/AccountGroupList").then(
      (m) => m.AccountGroupList
    ),
  { ssr: false }
);

export default function AccountGroupsPage() {
  return <AccountGroupList />;
}
