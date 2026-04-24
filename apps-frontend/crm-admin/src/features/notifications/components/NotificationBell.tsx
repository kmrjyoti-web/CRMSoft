"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import { useNotificationStore } from "@/stores/notification.store";
import {
  useUnreadCount,
  useNotificationsList,
  useMarkRead,
  useMarkAllRead,
  useDismissNotification,
} from "../hooks/useNotifications";
import { useNotificationSSE } from "../hooks/useNotificationSSE";
import { NotificationItem } from "./NotificationItem";
import type { Notification } from "../types/notifications.types";

export function NotificationBell() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isOpen = useNotificationStore((s) => s.isDropdownOpen);
  const toggleDropdown = useNotificationStore((s) => s.toggleDropdown);
  const storeUnreadCount = useNotificationStore((s) => s.unreadCount);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const setRecentNotifications = useNotificationStore((s) => s.setRecentNotifications);

  // SSE real-time connection
  useNotificationSSE();

  // Fetch unread count
  const { data: countRes } = useUnreadCount();
  useEffect(() => {
    const count = countRes?.data?.count ?? countRes?.data;
    if (typeof count === "number") {
      setUnreadCount(count);
    }
  }, [countRes, setUnreadCount]);

  // Fetch recent notifications when dropdown opens
  const { data: listRes } = useNotificationsList(
    isOpen ? { page: 1, limit: 8 } : undefined,
  );
  useEffect(() => {
    if (!isOpen) return;
    const items = Array.isArray(listRes?.data) ? listRes.data : [];
    setRecentNotifications(items);
  }, [listRes, isOpen, setRecentNotifications]);

  const recentNotifications = useNotificationStore((s) => s.recentNotifications);

  // Mutations
  const markReadMut = useMarkRead();
  const markAllReadMut = useMarkAllRead();
  const dismissMut = useDismissNotification();

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        toggleDropdown(false);
      }
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleDropdown(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, [isOpen, toggleDropdown]);

  const handleClick = (notif: Notification) => {
    if (notif.status === "UNREAD") {
      markReadMut.mutate(notif.id);
    }
    toggleDropdown(false);
    if (notif.actionUrl) {
      router.push(notif.actionUrl);
    }
  };

  const displayCount = storeUnreadCount > 99 ? "99+" : storeUnreadCount;

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        type="button"
        className="travelos-action"
        title="Notifications"
        onClick={() => toggleDropdown()}
      >
        <span className="travelos-action__icon" style={{ position: "relative" }}>
          <Icon name="bell" size={17} />
          {storeUnreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -6,
                right: -8,
                background: "#ef4444",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                lineHeight: 1,
                padding: "2px 5px",
                borderRadius: 10,
                minWidth: 16,
                textAlign: "center",
              }}
            >
              {displayCount}
            </span>
          )}
        </span>
        <span className="travelos-action__label">Notification</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 380,
            maxHeight: 480,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 8px 30px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.06)",
            border: "1px solid #e5e7eb",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>
              Notifications
              {storeUnreadCount > 0 && (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#3b82f6",
                    marginLeft: 8,
                  }}
                >
                  {storeUnreadCount} new
                </span>
              )}
            </span>
            {storeUnreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllReadMut.mutate(undefined)}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "#3b82f6",
                  fontWeight: 500,
                  padding: "4px 8px",
                  borderRadius: 6,
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {recentNotifications.length === 0 ? (
              <div
                style={{
                  padding: "40px 16px",
                  textAlign: "center",
                  color: "#9ca3af",
                }}
              >
                <Icon name="bell" size={32} className="mx-auto mb-2" />
                <p style={{ fontSize: 13, margin: "8px 0 0" }}>No notifications yet</p>
              </div>
            ) : (
              recentNotifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  compact
                  onClick={handleClick}
                  onMarkRead={(id) => markReadMut.mutate(id)}
                  onDismiss={(id) => dismissMut.mutate(id)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "10px 16px",
              borderTop: "1px solid #f0f0f0",
              textAlign: "center",
            }}
          >
            <button
              type="button"
              onClick={() => {
                toggleDropdown(false);
                router.push("/notifications");
              }}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                fontSize: 13,
                color: "#3b82f6",
                fontWeight: 500,
              }}
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
