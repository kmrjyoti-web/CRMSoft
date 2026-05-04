"use client";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
export default function OpeningBalancePage() {
  return (
    <div>
      <PageHeader title="Opening Balance Entry" subtitle="Enter opening balances for ledger accounts" />
      <EmptyState icon="scale" title="Opening Balance" description="Set opening balances for all ledgers. Feature coming soon." />
    </div>
  );
}
