"use client";

import { Icon, Card, Badge } from "@/components/ui";

export default function MyReportsPage() {
  return (
    <div className="p-6">
      <div className="d-flex align-items-center gap-2 mb-2">
        <Icon name="folder-open" size={22} />
        <h4 className="mb-0" style={{ fontWeight: 600 }}>My Reports</h4>
        <Badge variant="warning">Coming Soon</Badge>
      </div>
      <p className="text-muted mb-4">
        Save and manage your custom report configurations.
      </p>

      <Card>
        <div className="text-center py-5">
          <Icon name="folder-open" size={48} />
          <h5 className="mt-3 mb-2">No saved reports yet</h5>
          <p className="text-muted mb-0">
            When you customize and save reports from the BI section, they will appear here.
          </p>
        </div>
      </Card>
    </div>
  );
}
