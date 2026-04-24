"use client";
import type { OfferConditions, OfferType } from "../types/marketplace.types";

interface OfferSchedulePreviewProps {
  offerType: OfferType;
  conditions: OfferConditions;
  maxRedemptions?: number;
  publishAt?: string;
  expiresAt?: string;
}

export function OfferSchedulePreview({
  conditions,
  maxRedemptions,
  publishAt,
  expiresAt,
}: OfferSchedulePreviewProps) {
  const lines: string[] = [];

  if (conditions.timeBased?.type === 'RECURRING') {
    const days = conditions.timeBased.activeDays;
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (days && days.length > 0) {
      lines.push(`Active on: ${days.map((d) => dayNames[d]).join(', ')}`);
    }
    if (conditions.timeBased.resetTime) {
      lines.push(`Counter resets at ${conditions.timeBased.resetTime} IST`);
    }
  } else {
    if (publishAt) lines.push(`Starts: ${new Date(publishAt).toLocaleString()}`);
    if (expiresAt) lines.push(`Expires: ${new Date(expiresAt).toLocaleString()}`);
  }

  if (maxRedemptions) {
    lines.push(`Closes after ${maxRedemptions} redemptions`);
  }

  if (conditions.geographic?.cities?.length) {
    lines.push(`Geographic: ${conditions.geographic.cities.join(', ')}`);
  }

  if (conditions.customerGroup?.verifiedOnly) {
    lines.push('Only for verified customers');
  }

  if (conditions.orderBased?.firstN) {
    lines.push(`First ${conditions.orderBased.firstN} orders only`);
  }

  if (lines.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-400 italic">
        Configure conditions above to see the preview
      </div>
    );
  }

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
      <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">Schedule Preview</p>
      <ul className="space-y-1.5">
        {lines.map((line, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-indigo-800">
            <span className="text-indigo-400 mt-0.5">•</span>
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
