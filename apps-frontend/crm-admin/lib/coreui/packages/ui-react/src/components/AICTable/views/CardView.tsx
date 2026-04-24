import React from 'react';
import { MoreHorizontal } from 'lucide-react';

export function CardView({ data }: { data: any[] }) {
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full overflow-auto bg-gray-50">
      {data.map((row) => (
        <div key={row.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 flex items-center justify-center font-bold text-xl">
              {String(row.contactName || row.name || '?').charAt(0)}
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal size={18} />
            </button>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{row.contactName || row.name || '-'}</h3>
          <p className="text-sm text-gray-500 mb-4">{row.accountName || 'Independent'}</p>
          <div className="mt-auto space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <span className="w-16 text-xs text-gray-400 uppercase tracking-wider">Email</span>
              <span className="truncate">{row.email || '-'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="w-16 text-xs text-gray-400 uppercase tracking-wider">Phone</span>
              <span>{row.phone || '-'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="w-16 text-xs text-gray-400 uppercase tracking-wider">Owner</span>
              <span className="truncate">{row.contactOwner || '-'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
