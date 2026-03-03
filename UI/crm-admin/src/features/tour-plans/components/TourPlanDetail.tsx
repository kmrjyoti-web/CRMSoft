"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import { Button, Icon, Badge, Modal } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/format-date";

import {
  useTourPlanDetail,
  useSubmitTourPlan,
  useApproveTourPlan,
  useRejectTourPlan,
  useCancelTourPlan,
} from "../hooks/useTourPlans";

// -- Props ----------------------------------------------------------------

interface TourPlanDetailProps {
  tourPlanId: string;
}

// -- Component ------------------------------------------------------------

export function TourPlanDetail({ tourPlanId }: TourPlanDetailProps) {
  const router = useRouter();

  const { data, isLoading } = useTourPlanDetail(tourPlanId);
  const submitMutation = useSubmitTourPlan();
  const approveMutation = useApproveTourPlan();
  const rejectMutation = useRejectTourPlan();
  const cancelMutation = useCancelTourPlan();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const tourPlan = data?.data;

  // -- Action handlers ----------------------------------------------------

  const handleSubmitForApproval = useCallback(async () => {
    if (!tourPlan) return;
    try {
      await submitMutation.mutateAsync(tourPlanId);
      toast.success("Tour plan submitted for approval");
    } catch {
      toast.error("Failed to submit tour plan");
    }
  }, [tourPlan, submitMutation, tourPlanId]);

  const handleApprove = useCallback(async () => {
    if (!tourPlan) return;
    try {
      await approveMutation.mutateAsync(tourPlanId);
      toast.success("Tour plan approved");
    } catch {
      toast.error("Failed to approve tour plan");
    }
  }, [tourPlan, approveMutation, tourPlanId]);

  const handleReject = useCallback(async () => {
    if (!tourPlan || !rejectReason.trim()) return;
    try {
      await rejectMutation.mutateAsync({
        id: tourPlanId,
        data: { rejectedReason: rejectReason.trim() },
      });
      toast.success("Tour plan rejected");
      setShowRejectModal(false);
      setRejectReason("");
    } catch {
      toast.error("Failed to reject tour plan");
    }
  }, [tourPlan, rejectMutation, tourPlanId, rejectReason]);

  const handleCancel = useCallback(async () => {
    if (!tourPlan) return;
    try {
      await cancelMutation.mutateAsync(tourPlanId);
      toast.success("Tour plan cancelled");
    } catch {
      toast.error("Failed to cancel tour plan");
    }
  }, [tourPlan, cancelMutation, tourPlanId]);

  // -- Loading state ------------------------------------------------------

  if (isLoading) return <LoadingSpinner fullPage />;

  if (!tourPlan) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Tour plan not found.</div>
      </div>
    );
  }

  // -- Derived data -------------------------------------------------------

  const visits = tourPlan.visits ?? [];
  const totalVisits = tourPlan._count?.visits ?? visits.length;
  const completedVisits = visits.filter((v) => v.isCompleted).length;

  // -- Render -------------------------------------------------------------

  return (
    <div className="p-6">
      <PageHeader
        title={tourPlan.title}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <Icon name="arrow-left" size={16} /> Back
            </Button>
            {tourPlan.status === "DRAFT" && (
              <Link href={`/tour-plans/${tourPlanId}/edit`}>
                <Button variant="outline">
                  <Icon name="edit" size={16} /> Edit
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {/* Status bar */}
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <span className="text-sm text-gray-500">Status:</span>
        <StatusBadge status={tourPlan.status.toLowerCase().replace(/_/g, "-")} />

        {tourPlan.status === "DRAFT" && (
          <Button
            size="sm"
            variant="primary"
            onClick={handleSubmitForApproval}
            loading={submitMutation.isPending}
          >
            Submit for Approval
          </Button>
        )}

        {tourPlan.status === "PENDING_APPROVAL" && (
          <div className="ml-4 flex gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={handleApprove}
              loading={approveMutation.isPending}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => setShowRejectModal(true)}
            >
              Reject
            </Button>
          </div>
        )}

        {tourPlan.status === "REJECTED" && tourPlan.rejectedReason && (
          <div className="ml-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">Reason:</span>
            <span className="text-sm text-red-600">{tourPlan.rejectedReason}</span>
          </div>
        )}

        {(tourPlan.status === "APPROVED" || tourPlan.status === "IN_PROGRESS") && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            loading={cancelMutation.isPending}
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Main content grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main info (2/3 width) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Tour Plan Details */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Tour Plan Details
            </h3>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-400">Title</dt>
                <dd className="text-sm">{tourPlan.title}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Description</dt>
                <dd className="text-sm">{tourPlan.description ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Plan Date</dt>
                <dd className="text-sm">{formatDate(tourPlan.planDate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Status</dt>
                <dd>
                  <StatusBadge status={tourPlan.status.toLowerCase().replace(/_/g, "-")} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Start Location</dt>
                <dd className="text-sm">{tourPlan.startLocation ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">End Location</dt>
                <dd className="text-sm">{tourPlan.endLocation ?? "—"}</dd>
              </div>
            </dl>
          </div>

          {/* Visits */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Visits
            </h3>
            {visits.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Lead</th>
                      <th className="px-4 py-3">Scheduled Time</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {visits.map((visit) => (
                      <tr key={visit.id}>
                        <td className="px-4 py-3 text-gray-600">
                          {visit.sortOrder}
                        </td>
                        <td className="px-4 py-3">
                          {visit.lead ? (
                            <div>
                              <span className="font-medium">
                                {visit.lead.leadNumber}
                              </span>
                              {visit.lead.contact && (
                                <span className="ml-2 text-gray-500">
                                  {visit.lead.contact.firstName}{" "}
                                  {visit.lead.contact.lastName}
                                </span>
                              )}
                            </div>
                          ) : visit.contact ? (
                            <span>
                              {visit.contact.firstName} {visit.contact.lastName}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {visit.scheduledTime
                            ? formatDate(visit.scheduledTime)
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {visit.isCompleted ? (
                            <Badge variant="success">Completed</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {visit.notes ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No visits planned.</p>
            )}
          </div>
        </div>

        {/* Sidebar (1/3 width) */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Total Visits</span>
                <span className="font-medium">{totalVisits}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Completed Visits</span>
                <span className="font-medium">{completedVisits}</span>
              </div>
              {tourPlan.lead && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Lead</span>
                  <span className="font-medium">{tourPlan.lead.leadNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Approval info */}
          {tourPlan.approvedBy && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Approval
              </h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-xs text-gray-400">Approved By</dt>
                  <dd>
                    {tourPlan.approvedBy.firstName} {tourPlan.approvedBy.lastName}
                  </dd>
                </div>
                {tourPlan.approvedAt && (
                  <div>
                    <dt className="text-xs text-gray-400">Approved At</dt>
                    <dd>{formatDate(tourPlan.approvedAt)}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Metadata */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Details
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-gray-400">Created</dt>
                <dd>{formatDate(tourPlan.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Updated</dt>
                <dd>{formatDate(tourPlan.updatedAt)}</dd>
              </div>
              {tourPlan.salesPerson && (
                <div>
                  <dt className="text-xs text-gray-400">Sales Person</dt>
                  <dd>
                    {tourPlan.salesPerson.firstName}{" "}
                    {tourPlan.salesPerson.lastName}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Tour Plan"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              loading={rejectMutation.isPending}
              disabled={!rejectReason.trim()}
            >
              Reject
            </Button>
          </div>
        }
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            placeholder="Reason for rejection..."
          />
        </div>
      </Modal>
    </div>
  );
}
