"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";
import type { Notification } from "../types/notifications.types";

const SSE_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1"}/notifications/sse/stream`;

export function useNotificationSSE() {
  const eventSourceRef = useRef<EventSource | null>(null);
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    if (!user?.id || !token) return;

    const url = `${SSE_URL}?userId=${user.id}`;

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === "heartbeat") return;

        const notification = parsed as Notification;
        addNotification(notification);
        qc.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      // EventSource auto-reconnects on error
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [user?.id, token, addNotification, qc]);
}
