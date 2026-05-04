import React from 'react';
import { MoreHorizontal } from 'lucide-react';

export function ListView({ data }: { data: any[] }) {
  return (
    <div className="p-4 space-y-3 h-full overflow-auto bg-gray-50">
      {data.map((row) => (
        <div key={row.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
              {String(row.contactName || row.name || '?').charAt(0)}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{row.contactName || row.name || '-'}</h3>
              <p className="text-xs text-gray-500">{row.email || 'No email'} &bull; {row.phone || 'No phone'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-gray-900">{row.accountName || 'No Account'}</p>
            <p className="text-xs text-gray-500">Owner: {row.contactOwner || '-'}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
