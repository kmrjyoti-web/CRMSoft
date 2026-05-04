import { create } from "zustand";
import type { Notification } from "@/features/notifications/types/notifications.types";

export interface NotificationState {
  unreadCount: number;
  recentNotifications: Notification[];
  isDropdownOpen: boolean;

  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  decrementUnread: (by?: number) => void;
  addNotification: (notification: Notification) => void;
  setRecentNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: string) => void;
  toggleDropdown: (open?: boolean) => void;
  reset: () => void;
}

const INITIAL_STATE = {
  unreadCount: 0,
  recentNotifications: [],
  isDropdownOpen: false,
};

export const useNotificationStore = create<NotificationState>()((set) => ({
  ...INITIAL_STATE,

  setUnreadCount: (count) => set({ unreadCount: count }),

  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),

  decrementUnread: (by = 1) =>
    set((s) => ({ unreadCount: Math.max(0, s.unreadCount - by) })),

  addNotification: (notification) =>
    set((s) => ({
      recentNotifications: [notification, ...s.recentNotifications].slice(0, 20),
      unreadCount: s.unreadCount + 1,
    })),

  setRecentNotifications: (notifications) =>
    set({ recentNotifications: notifications }),

  markAsRead: (id) =>
    set((s) => ({
      recentNotifications: s.recentNotifications.map((n) =>
        n.id === id ? { ...n, status: "READ" as const, readAt: new Date().toISOString() } : n,
      ),
    })),

  toggleDropdown: (open) =>
    set((s) => ({ isDropdownOpen: open !== undefined ? open : !s.isDropdownOpen })),

  reset: () => set({ ...INITIAL_STATE }),
}));
