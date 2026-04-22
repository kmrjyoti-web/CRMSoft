"use client";
import { PageHeader } from "@/components/common/PageHeader";
import { TallyImport } from "@/features/accounts/components/TallyImport";

export default function BulkLedgerImportPage() {
  return (
    <div style={{ padding: "0 0 40px" }}>
      <PageHeader
        title="Tally Ledger Import"
        subtitle="Import ledgers from Tally Prime / ERP 9 XML export — groups, opening balances & GSTIN auto-mapped"
      />
      <TallyImport />
    </div>
  );
}
