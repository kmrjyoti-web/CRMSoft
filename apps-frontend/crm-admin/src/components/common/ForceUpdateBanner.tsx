'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';

interface ForceUpdateInfo {
  pending: boolean;
  message: string;
  deadline?: string;
}

export function ForceUpdateBanner() {
  const [updateInfo, setUpdateInfo] = useState<ForceUpdateInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) return;

    // Check for force updates
    const checkForUpdates = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/tenant/force-update-check`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.data?.pending) {
            setUpdateInfo(data.data);
          }
        }
      } catch {
        // Silently ignore — banner is non-critical
      }
    };

    checkForUpdates();
    const interval = setInterval(checkForUpdates, 5 * 60 * 1000); // Check every 5 min
    return () => clearInterval(interval);
  }, [token]);

  if (!updateInfo?.pending || dismissed) return null;

  const deadline = updateInfo.deadline ? new Date(updateInfo.deadline) : null;
  const isUrgent = deadline && deadline.getTime() - Date.now() < 24 * 60 * 60 * 1000;

  return (
    <div
      className={`px-4 py-3 flex items-center justify-between text-sm ${
        isUrgent
          ? 'bg-red-600 text-white'
          : 'bg-yellow-50 border-b border-yellow-200 text-yellow-800'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="font-medium">
          {isUrgent ? '⚠ Urgent Update Required' : 'System Update Available'}
        </span>
        <span>{updateInfo.message}</span>
        {deadline && (
          <span className={`text-xs ${isUrgent ? 'text-red-200' : 'text-yellow-600'}`}>
            Deadline: {deadline.toLocaleDateString()}
          </span>
        )}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className={`text-xs px-2 py-1 rounded ${
          isUrgent
            ? 'bg-red-700 text-red-200 hover:bg-red-800'
            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
        }`}
      >
        Dismiss
      </button>
    </div>
  );
}
