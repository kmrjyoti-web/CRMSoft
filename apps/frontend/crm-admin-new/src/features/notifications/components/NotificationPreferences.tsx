"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Icon, Button, Input, SelectInput, Switch } from "@/components/ui";
import { LoadingSpinner, PageHeader } from "@/components/common";
import {
  useNotificationPreferences,
  useUpdatePreferences,
} from "../hooks/useNotifications";
import type { DigestFrequency, UpdatePreferencesDto } from "../types/notifications.types";

const DIGEST_OPTIONS = [
  { label: "Real-time", value: "REALTIME" },
  { label: "Hourly", value: "HOURLY" },
  { label: "Daily", value: "DAILY" },
  { label: "Weekly", value: "WEEKLY" },
  { label: "None", value: "NONE" },
];

const CHANNEL_LABELS: Record<string, string> = {
  IN_APP: "In-App",
  EMAIL: "Email",
  SMS: "SMS",
  PUSH: "Push Notification",
  WHATSAPP: "WhatsApp",
};

const CATEGORY_LABELS: Record<string, string> = {
  LEAD_ASSIGNED: "Lead Assigned",
  LEAD_UPDATED: "Lead Updated",
  OWNERSHIP_CHANGED: "Ownership Changed",
  DEMO_SCHEDULED: "Demo Scheduled",
  DEMO_COMPLETED: "Demo Completed",
  FOLLOW_UP_DUE: "Follow-up Due",
  FOLLOW_UP_OVERDUE: "Follow-up Overdue",
  QUOTATION_SENT: "Quotation Sent",
  QUOTATION_APPROVED: "Quotation Approved",
  TOUR_PLAN_APPROVED: "Tour Plan Approved",
  ACTIVITY_REMINDER: "Activity Reminder",
  SYSTEM_ALERT: "System Alert",
  WORKFLOW_ACTION: "Workflow Action",
};

export function NotificationPreferences() {
  const router = useRouter();
  const { data: prefRes, isLoading } = useNotificationPreferences();
  const updateMut = useUpdatePreferences();

  const [channels, setChannels] = useState<Record<string, boolean>>({});
  const [categories, setCategories] = useState<Record<string, boolean>>({});
  const [quietStart, setQuietStart] = useState("");
  const [quietEnd, setQuietEnd] = useState("");
  const [digest, setDigest] = useState<DigestFrequency>("REALTIME");

  useEffect(() => {
    if (!prefRes?.data) return;
    const pref = prefRes.data;
    setChannels(pref.channels ?? {});
    setCategories(pref.categories ?? {});
    setQuietStart(pref.quietHoursStart ?? "");
    setQuietEnd(pref.quietHoursEnd ?? "");
    setDigest(pref.digestFrequency ?? "REALTIME");
  }, [prefRes]);

  const handleSave = () => {
    const dto: UpdatePreferencesDto = {
      channels,
      categories,
      quietHoursStart: quietStart || undefined,
      quietHoursEnd: quietEnd || undefined,
      digestFrequency: digest,
    };
    updateMut.mutate(dto, {
      onSuccess: () => toast.success("Preferences saved"),
      onError: () => toast.error("Failed to save preferences"),
    });
  };

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="p-6 max-w-3xl">
      <PageHeader
        title="Notification Preferences"
        subtitle="Manage how and when you receive notifications"
        actions={
          <Button variant="outline" onClick={() => router.push("/notifications")}>
            <Icon name="arrow-left" size={16} />
            Back
          </Button>
        }
      />

      {/* Channels */}
      <section
        style={{
          marginBottom: 32,
          padding: 20,
          border: "1px solid #e5e7eb",
          borderRadius: 10,
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
          Notification Channels
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Object.entries(CHANNEL_LABELS).map(([key, label]) => (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                background: "#f9fafb",
                borderRadius: 8,
              }}
            >
              <span style={{ fontSize: 14 }}>{label}</span>
              <Switch
                checked={channels[key] !== false}
                onChange={(checked: boolean) =>
                  setChannels((prev) => ({ ...prev, [key]: checked }))
                }
              />
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section
        style={{
          marginBottom: 32,
          padding: 20,
          border: "1px solid #e5e7eb",
          borderRadius: 10,
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
          Notification Categories
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "#f9fafb",
                borderRadius: 8,
              }}
            >
              <span style={{ fontSize: 13 }}>{label}</span>
              <Switch
                checked={categories[key] !== false}
                onChange={(checked: boolean) =>
                  setCategories((prev) => ({ ...prev, [key]: checked }))
                }
              />
            </div>
          ))}
        </div>
      </section>

      {/* Quiet Hours & Digest */}
      <section
        style={{
          marginBottom: 32,
          padding: 20,
          border: "1px solid #e5e7eb",
          borderRadius: 10,
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
          Schedule & Digest
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <Input
            label="Quiet Hours Start"
            type="time"
            value={quietStart}
            onChange={(v) => setQuietStart(String(v))}
            leftIcon={<Icon name="clock" size={16} />}
          />
          <Input
            label="Quiet Hours End"
            type="time"
            value={quietEnd}
            onChange={(v) => setQuietEnd(String(v))}
            leftIcon={<Icon name="clock" size={16} />}
          />
        </div>
        <div style={{ maxWidth: 300 }}>
          <SelectInput
            label="Digest Frequency"
            options={DIGEST_OPTIONS}
            value={digest}
            onChange={(v) => setDigest(String(v ?? "REALTIME") as DigestFrequency)}
            leftIcon={<Icon name="repeat" size={16} />}
          />
        </div>
      </section>

      {/* Save */}
      <div style={{ display: "flex", gap: 12 }}>
        <Button
          variant="primary"
          onClick={handleSave}
          loading={updateMut.isPending}
        >
          Save Preferences
        </Button>
        <Button variant="outline" onClick={() => router.push("/notifications")}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
