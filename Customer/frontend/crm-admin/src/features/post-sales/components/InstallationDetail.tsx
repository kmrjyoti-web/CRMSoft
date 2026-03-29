"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import { Button } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/format-date";

import {
  useInstallationDetail,
  useStartInstallation,
  useCompleteInstallation,
  useCancelInstallation,
} from "../hooks/usePostSales";

import type {
  InstallationDetail as InstallationDetailType,
  InstallationStatus,
} from "../types/post-sales.types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const statusColorMap: Record<InstallationStatus, string> = {
  SCHEDULED: "secondary",
  IN_PROGRESS: "primary",
  COMPLETED: "success",
  CANCELLED: "danger",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface InstallationDetailProps {
  installationId: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InstallationDetail({
  installationId,
}: InstallationDetailProps) {
  const router = useRouter();

  const { data, isLoading } = useInstallationDetail(installationId);
  const startInstallation = useStartInstallation();
  const completeInstallation = useCompleteInstallation();
  const cancelInstallation = useCancelInstallation();

  const installation = data?.data as InstallationDetailType | undefined;

  // -- Handlers --

  const handleStart = useCallback(async () => {
    try {
      await startInstallation.mutateAsync(installationId);
      toast.success("Installation started successfully");
    } catch {
      toast.error("Failed to start installation");
    }
  }, [installationId, startInstallation]);

  const handleComplete = useCallback(async () => {
    try {
      await completeInstallation.mutateAsync(installationId);
      toast.success("Installation completed successfully");
    } catch {
      toast.error("Failed to complete installation");
    }
  }, [installationId, completeInstallation]);

  const handleCancel = useCallback(async () => {
    try {
      await cancelInstallation.mutateAsync(installationId);
      toast.success("Installation cancelled successfully");
    } catch {
      toast.error("Failed to cancel installation");
    }
  }, [installationId, cancelInstallation]);

  // -- Loading / Not found --

  if (isLoading) return <LoadingSpinner fullPage />;

  if (!installation) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">Installation not found</p>
          <Button
            variant="outline"
            onClick={() => router.push("/post-sales/installations")}
            className="mt-4"
          >
            Back to Installations
          </Button>
        </div>
      </div>
    );
  }

  // -- Derived values --

  const hasNotes = installation.notes || installation.internalNotes;

  // -- Render --

  return (
    <div className="p-6">
      {/* Page Header */}
      <PageHeader
        title={`Installation ${installation.installationNo}`}
        subtitle={installation.title}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          </div>
        }
      />

      {/* Status bar */}
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <span className="text-sm text-gray-500">Status:</span>
        <StatusBadge
          status={installation.status}
          colorMap={statusColorMap}
        />

        {installation.status === "SCHEDULED" && (
          <>
            <Button
              size="sm"
              variant="primary"
              onClick={handleStart}
              loading={startInstallation.isPending}
            >
              Start
            </Button>
            <Link
              href={`/post-sales/installations/${installationId}/edit`}
            >
              <Button size="sm" variant="outline">
                Edit
              </Button>
            </Link>
            <Button
              size="sm"
              variant="danger"
              onClick={handleCancel}
              loading={cancelInstallation.isPending}
            >
              Cancel
            </Button>
          </>
        )}

        {installation.status === "IN_PROGRESS" && (
          <>
            <Button
              size="sm"
              variant="primary"
              onClick={handleComplete}
              loading={completeInstallation.isPending}
            >
              Complete
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={handleCancel}
              loading={cancelInstallation.isPending}
            >
              Cancel
            </Button>
          </>
        )}
      </div>

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Installation Details card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Installation Details
            </h3>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-400">Installation No</dt>
                <dd className="text-sm font-medium">
                  {installation.installationNo}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Title</dt>
                <dd className="text-sm font-medium">{installation.title}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-gray-400">Description</dt>
                <dd className="text-sm">
                  {installation.description || "\u2014"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Contact</dt>
                <dd className="text-sm">
                  {installation.contact
                    ? `${installation.contact.firstName} ${installation.contact.lastName}`
                    : "\u2014"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Organization</dt>
                <dd className="text-sm">
                  {installation.organization?.name ?? "\u2014"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Lead</dt>
                <dd className="text-sm">
                  {installation.lead?.title ?? "\u2014"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Quotation ID</dt>
                <dd className="text-sm">
                  {installation.quotationId || "\u2014"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Invoice ID</dt>
                <dd className="text-sm">
                  {installation.invoiceId || "\u2014"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Location card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Location
            </h3>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-xs text-gray-400">Address</dt>
                <dd className="text-sm">{installation.address || "\u2014"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">City</dt>
                <dd className="text-sm">{installation.city || "\u2014"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">State</dt>
                <dd className="text-sm">{installation.state || "\u2014"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Pincode</dt>
                <dd className="text-sm">{installation.pincode || "\u2014"}</dd>
              </div>
            </dl>
          </div>

          {/* Notes card */}
          {hasNotes && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Notes
              </h3>
              <dl className="space-y-3">
                {installation.notes && (
                  <div>
                    <dt className="text-xs text-gray-400">Notes</dt>
                    <dd>
                      <pre className="whitespace-pre-wrap text-sm">
                        {installation.notes}
                      </pre>
                    </dd>
                  </div>
                )}
                {installation.internalNotes && (
                  <div>
                    <dt className="text-xs text-gray-400">Internal Notes</dt>
                    <dd>
                      <pre className="whitespace-pre-wrap text-sm">
                        {installation.internalNotes}
                      </pre>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Status
            </h3>
            <StatusBadge
              status={installation.status}
              colorMap={statusColorMap}
            />
          </div>

          {/* Schedule card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Schedule
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-gray-400">Scheduled Date</dt>
                <dd>{formatDate(installation.scheduledDate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Started Date</dt>
                <dd>
                  {installation.startedDate
                    ? formatDate(installation.startedDate)
                    : "\u2014"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Completed Date</dt>
                <dd>
                  {installation.completedDate
                    ? formatDate(installation.completedDate)
                    : "\u2014"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Assignment card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Assignment
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-gray-400">Assigned To</dt>
                <dd>
                  {installation.assignedTo
                    ? `${installation.assignedTo.firstName} ${installation.assignedTo.lastName}`
                    : "Unassigned"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Metadata card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Metadata
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-gray-400">Created At</dt>
                <dd>{formatDate(installation.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Updated At</dt>
                <dd>{formatDate(installation.updatedAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Created By</dt>
                <dd>{installation.createdById}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
