"use client";

import { useState, useCallback } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import { Button, Icon, Badge, Modal, TextareaInput } from "@/components/ui";

import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/format-date";

import {
  useActivityDetail,
  useCompleteActivity,
} from "../hooks/useActivities";

import type { ActivityType } from "../types/activities.types";

// -- Constants ---------------------------------------------------------------

const ACTIVITY_TYPE_ICON: Record<ActivityType, string> = {
  CALL: "phone",
  EMAIL: "mail",
  MEETING: "calendar",
  NOTE: "edit",
  WHATSAPP: "phone",
  SMS: "send",
  VISIT: "map-pin",
};

// -- Props -------------------------------------------------------------------

interface ActivityDetailProps {
  activityId: string;
}

// -- Component ---------------------------------------------------------------

export function ActivityDetail({ activityId }: ActivityDetailProps) {
  const router = useRouter();
  const { data, isLoading } = useActivityDetail(activityId);
  const completeMutation = useCompleteActivity();

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [outcome, setOutcome] = useState("");

  const activity = data?.data;
  const completing = completeMutation.isPending;

  const handleComplete = useCallback(async () => {
    try {
      await completeMutation.mutateAsync({
        id: activityId,
        data: { outcome: outcome || undefined },
      });
      toast.success("Activity marked as complete");
      setShowCompleteModal(false);
      setOutcome("");
    } catch {
      toast.error("Failed to complete activity");
    }
  }, [completeMutation, activityId, outcome]);

  // -- Loading / Not found ---------------------------------------------------

  if (isLoading) return <LoadingSpinner fullPage />;

  if (!activity) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Icon name="activity" size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900">Activity not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The activity you are looking for does not exist.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/activities")}
          >
            Back to Activities
          </Button>
        </div>
      </div>
    );
  }

  // -- Render ----------------------------------------------------------------

  return (
    <div className="p-6">
      <PageHeader
        title={activity.subject}
        subtitle={activity.type}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/activities")}>
              <Icon name="arrow-left" size={16} /> Back
            </Button>
            <Link href={`/activities/${activityId}/edit`}>
              <Button variant="outline">
                <Icon name="edit" size={16} /> Edit
              </Button>
            </Link>
          </div>
        }
      />

      {/* Status section */}
      <div className="mt-4 mb-6">
        {activity.completedAt ? (
          <div className="flex items-center gap-3">
            <Badge variant="success">Completed</Badge>
            <span className="text-sm text-gray-500">
              {formatDate(activity.completedAt)}
            </span>
          </div>
        ) : (
          <Button
            variant="primary"
            onClick={() => setShowCompleteModal(true)}
          >
            <Icon name="check" size={16} /> Mark Complete
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activity Details card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Activity Details
            </h3>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-gray-500">Type</dt>
                <dd className="mt-1 flex items-center gap-2">
                  <Icon
                    name={ACTIVITY_TYPE_ICON[activity.type]}
                    size={14}
                    className="text-gray-400"
                  />
                  <Badge variant="primary">{activity.type}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Subject</dt>
                <dd className="mt-1 font-medium">{activity.subject}</dd>
              </div>
              {activity.description && (
                <div className="sm:col-span-2">
                  <dt className="text-gray-500">Description</dt>
                  <dd className="mt-1 whitespace-pre-wrap">{activity.description}</dd>
                </div>
              )}
              {activity.outcome && (
                <div className="sm:col-span-2">
                  <dt className="text-gray-500">Outcome</dt>
                  <dd className="mt-1 whitespace-pre-wrap">{activity.outcome}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Schedule card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Schedule
            </h3>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-sm">
              <div>
                <dt className="text-gray-500">Scheduled At</dt>
                <dd className="mt-1 font-medium">
                  {activity.scheduledAt
                    ? formatDate(activity.scheduledAt)
                    : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">End Time</dt>
                <dd className="mt-1 font-medium">
                  {activity.endTime ? formatDate(activity.endTime) : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Duration</dt>
                <dd className="mt-1 font-medium">
                  {activity.duration != null
                    ? `${activity.duration} mins`
                    : "-"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Location card */}
          {activity.locationName && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Location
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <Icon name="map-pin" size={14} className="text-gray-400" />
                <span>{activity.locationName}</span>
              </div>
            </div>
          )}

          {/* Association card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Association
            </h3>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-gray-500">Lead</dt>
                <dd className="mt-1">
                  {activity.lead ? (
                    <Link
                      href={`/leads/${activity.lead.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {activity.lead.leadNumber}
                    </Link>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Contact</dt>
                <dd className="mt-1">
                  {activity.contact ? (
                    <Link
                      href={`/contacts/${activity.contact.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {activity.contact.firstName} {activity.contact.lastName}
                    </Link>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metadata card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Metadata
            </h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Created At</dt>
                <dd className="mt-1 font-medium">
                  {formatDate(activity.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Updated At</dt>
                <dd className="mt-1 font-medium">
                  {formatDate(activity.updatedAt)}
                </dd>
              </div>
              {activity.createdBy && (
                <div>
                  <dt className="text-gray-500">Created By</dt>
                  <dd className="mt-1 font-medium">
                    {activity.createdBy.firstName} {activity.createdBy.lastName}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Complete Modal */}
      <Modal
        open={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Complete Activity"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCompleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleComplete}
              loading={completing}
            >
              Complete
            </Button>
          </div>
        }
      >
        <TextareaInput
          label="Outcome"
          rows={4}
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
        />
      </Modal>
    </div>
  );
}
