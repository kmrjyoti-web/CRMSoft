import { PageHeader } from "@/components/common/PageHeader";

import { AuditLogList } from "@/features/audit-logs/components/AuditLogList";

export default function AuditLogsPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-6">
        <PageHeader title="Audit Logs" />
      </div>
      <div className="flex-1 min-h-0">
        <AuditLogList />
      </div>
    </div>
  );
}
