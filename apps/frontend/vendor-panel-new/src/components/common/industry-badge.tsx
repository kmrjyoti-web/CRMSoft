interface IndustryBadgeProps {
  industryCode: string | null | undefined;
  className?: string;
}

export function IndustryBadge({ industryCode, className = '' }: IndustryBadgeProps) {
  if (!industryCode) {
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 ${className}`}>
        All Industries
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 ${className}`}>
      {industryCode}
    </span>
  );
}
