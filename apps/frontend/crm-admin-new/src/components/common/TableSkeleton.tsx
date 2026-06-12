"use client";

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
  title?: string;
}

export function TableSkeleton({
  columns = 6,
  rows = 12,
  title,
}: TableSkeletonProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          {title ? (
            <span className="text-sm font-semibold text-gray-700">{title}</span>
          ) : (
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
          <div className="h-8 w-8 bg-gray-100 rounded animate-pulse" />
          <div className="h-8 w-8 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="flex-1 overflow-hidden">
        <table className="w-full">
          {/* Header */}
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <div
                    className="h-3 bg-gray-200 rounded animate-pulse"
                    style={{ width: `${55 + (i % 3) * 15}%` }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          {/* Body rows */}
          <tbody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-gray-100"
                style={{
                  animationDelay: `${rowIdx * 40}ms`,
                }}
              >
                {Array.from({ length: columns }).map((_, colIdx) => (
                  <td key={colIdx} className="px-4 py-2.5">
                    <div
                      className="h-3.5 bg-gray-100 rounded animate-pulse"
                      style={{
                        width: `${40 + ((rowIdx + colIdx) % 4) * 15}%`,
                        animationDelay: `${(rowIdx * columns + colIdx) * 20}ms`,
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-white">
        <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-7 w-7 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
