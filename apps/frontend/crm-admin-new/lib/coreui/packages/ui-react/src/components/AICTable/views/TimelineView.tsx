import React from 'react';

export function TimelineView({ data }: { data: any[] }) {
  const sortedData = [...data].sort((a, b) => new Date(b.date || b.crDate || 0).getTime() - new Date(a.date || a.crDate || 0).getTime());

  return (
    <div className="p-6 h-full overflow-auto bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="relative border-l-2 border-gray-200 ml-3 md:ml-6 space-y-8">
          {sortedData.map((row) => (
            <div key={row.id} className="relative pl-6 md:pl-8">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm" />
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">Contact Created: {row.contactName || row.name || '-'}</h3>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{row.date || row.crDate || '-'}</span>
                </div>
                <p className="text-sm text-gray-600">
                  Assigned to <span className="font-medium text-gray-900">{row.contactOwner || '-'}</span>.
                  {row.accountName && ` Associated with account ${row.accountName}.`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
