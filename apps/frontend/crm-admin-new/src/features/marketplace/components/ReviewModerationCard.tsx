"use client";
import { useState } from "react";
import { Icon, Badge, Button } from "@/components/ui";
import type { MarketplaceReview } from "../types/marketplace.types";

interface ReviewModerationCardProps {
  review: MarketplaceReview;
  onApprove: (id: string) => void;
  onReject: (id: string, note: string) => void;
  isLoading?: boolean;
}

export function ReviewModerationCard({ review, onApprove, onReject, isLoading }: ReviewModerationCardProps) {
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Stars */}
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Icon
                key={i}
                name="star"
                size={14}
                color={i < review.rating ? '#f59e0b' : '#e5e7eb'}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">{review.rating}/5</span>
          </div>

          {review.title && (
            <h4 className="text-sm font-semibold text-gray-900 mb-1">{review.title}</h4>
          )}
          {review.body && (
            <p className="text-sm text-gray-600">{review.body}</p>
          )}

          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
            {review.isVerifiedPurchase && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <Icon name="shield-check" size={11} />
                Verified Purchase
              </span>
            )}
          </div>
        </div>

        <Badge
          variant={
            review.status === 'APPROVED'
              ? 'success'
              : review.status === 'REJECTED'
              ? 'danger'
              : review.status === 'FLAGGED'
              ? 'warning'
              : 'secondary'
          }
        >
          {review.status}
        </Badge>
      </div>

      {review.status === 'PENDING' && (
        <div className="mt-4 pt-4 border-t border-gray-50">
          {showRejectForm ? (
            <div className="space-y-2">
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Rejection reason..."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-200"
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  disabled={isLoading || !rejectNote}
                  onClick={() => {
                    onReject(review.id, rejectNote);
                    setShowRejectForm(false);
                  }}
                >
                  Confirm Reject
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowRejectForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="primary" size="sm" disabled={isLoading} onClick={() => onApprove(review.id)}>
                <Icon name="check" size={13} /> Approve
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowRejectForm(true)}>
                <Icon name="x" size={13} /> Reject
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
