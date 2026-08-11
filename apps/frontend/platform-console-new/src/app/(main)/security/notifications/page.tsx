'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { api } from '@/lib/api';

type Notification = {
  id: string;
  type: string;
  channel: string;
  recipient: string;
  subject: string;
  status: string;
  sentAt: string;
};

type NotificationStats = {
  total: number;
  delivered: number;
  failed: number;
};

const STATUS_COLORS: Record<string, string> = {
  SENT: 'bg-green-900/50 text-green-400 border-green-800',
  DELIVERED: 'bg-green-900/50 text-green-400 border-green-800',
  FAILED: 'bg-red-900/50 text-red-400 border-red-800',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [nData, sData] = await Promise.all([
        api.security.notifications() as Promise<any>,
        api.security.notificationStats() as Promise<any>,
      ]);
      setNotifications(Array.isArray(nData) ? nData : nData?.items ?? []);
      setStats(sData);
    } catch {
      setNotifications([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-[#c9d1d9]">Notification History</h2>
        <p className="text-xs text-[#8b949e] mt-0.5">Security alerts and notification delivery status</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-xs text-[#8b949e]">Total Sent</p>
          <p className="text-xl font-bold text-[#c9d1d9] mt-1">{stats?.total ?? 0}</p>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-xs text-[#8b949e]">Delivered</p>
          <p className="text-xl font-bold text-green-400 mt-1">{stats?.delivered ?? 0}</p>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-xs text-[#8b949e]">Failed</p>
          <p className="text-xl font-bold text-red-400 mt-1">{stats?.failed ?? 0}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#30363d]">
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Type</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Channel</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Recipient</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Subject</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Status</th>
              <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Sent At</th>
            </tr>
          </thead>
          <tbody>
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <tr key={n.id} className="border-b border-[#30363d]/50 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-[#c9d1d9] text-xs">{n.type}</td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">{n.channel}</td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">{n.recipient}</td>
                  <td className="px-4 py-3 text-[#c9d1d9] text-xs">{n.subject}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${STATUS_COLORS[n.status] ?? 'bg-gray-900/50 text-gray-400 border-gray-800'}`}>
                      {n.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#8b949e] text-xs">
                    {new Date(n.sentAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[#8b949e]">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No notifications found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
