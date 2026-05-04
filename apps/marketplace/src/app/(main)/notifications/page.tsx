'use client';

import { Bell } from 'lucide-react';
import { EmptyState } from '../../../components/common/EmptyState';

export default function NotificationsPage() {
  // Placeholder — notifications API to be wired
  const notifications: any[] = [];

  return (
    <div className="min-h-full">
      <div className="px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        <h1 className="font-bold text-gray-900">Notifications</h1>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="You'll see activity like enquiry replies and offer alerts here"
        />
      ) : (
        <div className="divide-y divide-gray-50">
          {notifications.map((n: any) => (
            <div key={n.id} className="flex items-start gap-3 px-4 py-3 bg-white">
              <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                <Bell size={16} className="text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-gray-900">{n.message}</p>
                <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
