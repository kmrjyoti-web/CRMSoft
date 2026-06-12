"use client";

import { useState } from "react";
import { Card, Button } from "@/components/ui";
import { Icon } from "@/components/ui";
import { PageHeader } from "@/components/common/PageHeader";
import { ReportScheduleList } from "./ReportScheduleList";
import { ReportScheduleForm } from "./ReportScheduleForm";

export function ScheduledReportsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Scheduled Reports"
        description="Automatically generate and email reports on a recurring schedule."
        actions={
          <Button variant="primary" onClick={() => setShowForm(true)}>
            <Icon name="plus" size={16} className="mr-1" />
            New Schedule
          </Button>
        }
      />

      {showForm && (
        <Card>
          <ReportScheduleForm onClose={() => setShowForm(false)} />
        </Card>
      )}

      <ReportScheduleList />
    </div>
  );
}
