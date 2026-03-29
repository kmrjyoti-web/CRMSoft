"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { PageSkeleton } from "@/components/common";
import { notificationsService } from "@/features/notifications/services/notifications.service";
import type {
  NotificationConfig,
  NotificationChannel,
} from "@/features/notifications/types/notifications.types";

const CHANNEL_LABELS: Record<string, { label: string; icon: IconName }> = {
  IN_APP: { label: "In-App", icon: "bell" },
  EMAIL: { label: "Email", icon: "mail" },
  SMS: { label: "SMS", icon: "phone" },
  PUSH: { label: "Push", icon: "send" },
  WHATSAPP: { label: "WhatsApp", icon: "message-circle" },
  CALL: { label: "Call", icon: "phone" },
};

const ALL_CHANNELS: NotificationChannel[] = [
  "IN_APP",
  "EMAIL",
  "SMS",
  "PUSH",
  "WHATSAPP",
  "CALL",
];

function formatEventType(eventType: string): string {
  return eventType
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function NotificationConfigPage() {
  const queryClient = useQueryClient();
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [editChannels, setEditChannels] = useState<string[]>([]);

  const { data: configsRes, isLoading } = useQuery({
    queryKey: ["notification-configs"],
    queryFn: () => notificationsService.getConfigs(),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      eventType,
      channels,
    }: {
      eventType: string;
      channels: string[];
    }) => notificationsService.updateConfig(eventType, { channels }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-configs"] });
      setEditingEvent(null);
    },
  });

  const configs: NotificationConfig[] = configsRes?.data ?? [];

  const startEdit = useCallback((config: NotificationConfig) => {
    setEditingEvent(config.eventType);
    setEditChannels([...config.channels]);
  }, []);

  const toggleChannel = useCallback((channel: string) => {
    setEditChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel],
    );
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingEvent) return;
    updateMutation.mutate({ eventType: editingEvent, channels: editChannels });
  }, [editingEvent, editChannels, updateMutation]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Notification Configuration
        </h1>
        <p className="text-sm text-gray-500">
          Configure which channels are active for each notification event type
        </p>
      </div>

      {isLoading ? (
        <PageSkeleton />
      ) : configs.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <Icon
              name="bell"
              size={40}
              className="mx-auto mb-3 text-gray-300"
            />
            <p className="text-gray-500">
              No notification configs found. They will be created when
              notification events are triggered.
            </p>
          </div>
        </Card>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Event Type
                </th>
                {ALL_CHANNELS.map((ch) => (
                  <th
                    key={ch}
                    className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-3"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Icon
                        name={CHANNEL_LABELS[ch]?.icon}
                        size={14}
                        className="text-gray-400"
                      />
                      <span>{CHANNEL_LABELS[ch]?.label ?? ch}</span>
                    </div>
                  </th>
                ))}
                <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-3">
                  Status
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {configs.map((config) => {
                const isEditing = editingEvent === config.eventType;
                return (
                  <tr
                    key={config.id}
                    className={isEditing ? "bg-blue-50/50" : "hover:bg-gray-50"}
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">
                        {formatEventType(config.eventType)}
                      </span>
                      <span className="block text-xs text-gray-400 font-mono">
                        {config.eventType}
                      </span>
                    </td>
                    {ALL_CHANNELS.map((ch) => {
                      const active = isEditing
                        ? editChannels.includes(ch)
                        : config.channels.includes(ch);
                      return (
                        <td key={ch} className="px-3 py-3 text-center">
                          {isEditing ? (
                            <button
                              type="button"
                              onClick={() => toggleChannel(ch)}
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                                active
                                  ? "bg-green-100 text-green-600"
                                  : "bg-gray-100 text-gray-300 hover:bg-gray-200"
                              }`}
                            >
                              <Icon
                                name={active ? "check" : "x"}
                                size={14}
                              />
                            </button>
                          ) : active ? (
                            <Icon
                              name="check-circle"
                              size={16}
                              className="mx-auto text-green-500"
                            />
                          ) : (
                            <Icon
                              name="minus"
                              size={16}
                              className="mx-auto text-gray-200"
                            />
                          )}
                        </td>
                      );
                    })}
                    <td className="px-3 py-3 text-center">
                      <Badge
                        variant={config.isEnabled ? "success" : "secondary"}
                      >
                        {config.isEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingEvent(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={saveEdit}
                            disabled={updateMutation.isPending}
                          >
                            {updateMutation.isPending ? (
                              <Icon
                                name="loader"
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <Icon name="save" size={14} />
                            )}
                            Save
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(config)}
                        >
                          <Icon name="edit" size={14} />
                          Edit
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
