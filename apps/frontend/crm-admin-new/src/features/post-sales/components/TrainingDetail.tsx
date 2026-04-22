"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import { Button, Badge } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/format-date";

import {
  useTrainingDetail,
  useStartTraining,
  useCompleteTraining,
  useCancelTraining,
} from "../hooks/usePostSales";

import type {
  TrainingDetail as TrainingDetailType,
  TrainingStatus,
  TrainingMode,
} from "../types/post-sales.types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const statusColorMap: Record<TrainingStatus, string> = {
  SCHEDULED: "secondary",
  IN_PROGRESS: "primary",
  COMPLETED: "success",
  CANCELLED: "danger",
};

const modeVariantMap: Record<TrainingMode, "primary" | "secondary" | "outline"> = {
  ONSITE: "primary",
  REMOTE: "secondary",
  HYBRID: "outline",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TrainingDetailProps {
  trainingId: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TrainingDetail({ trainingId }: TrainingDetailProps) {
  const router = useRouter();

  const { data, isLoading } = useTrainingDetail(trainingId);
  const startTraining = useStartTraining();
  const completeTraining = useCompleteTraining();
  const cancelTraining = useCancelTraining();

  const training = data?.data as TrainingDetailType | undefined;

  // -- Handlers --

  const handleStart = useCallback(async () => {
    try {
      await startTraining.mutateAsync(trainingId);
      toast.success("Training started successfully");
    } catch {
      toast.error("Failed to start training");
    }
  }, [trainingId, startTraining]);

  const handleComplete = useCallback(async () => {
    try {
      await completeTraining.mutateAsync(trainingId);
      toast.success("Training completed successfully");
    } catch {
      toast.error("Failed to complete training");
    }
  }, [trainingId, completeTraining]);

  const handleCancel = useCallback(async () => {
    try {
      await cancelTraining.mutateAsync(trainingId);
      toast.success("Training cancelled successfully");
    } catch {
      toast.error("Failed to cancel training");
    }
  }, [trainingId, cancelTraining]);

  // -- Loading / Not found --

  if (isLoading) return <LoadingSpinner fullPage />;

  if (!training) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">Training not found</p>
          <Button
            variant="outline"
            onClick={() => router.push("/post-sales/trainings")}
            className="mt-4"
          >
            Back to Trainings
          </Button>
        </div>
      </div>
    );
  }

  // -- Derived values --

  const hasNotes = training.notes || training.internalNotes;
  const hasFeedback =
    training.status === "COMPLETED" && (training.feedback || training.rating);

  // -- Render --

  return (
    <div className="p-6">
      {/* Page Header */}
      <PageHeader
        title={`Training ${training.trainingNo}`}
        subtitle={training.title}
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
          status={training.status}
          colorMap={statusColorMap}
        />

        {training.status === "SCHEDULED" && (
          <>
            <Button
              size="sm"
              variant="primary"
              onClick={handleStart}
              loading={startTraining.isPending}
            >
              Start
            </Button>
            <Link href={`/post-sales/trainings/${trainingId}/edit`}>
              <Button size="sm" variant="outline">
                Edit
              </Button>
            </Link>
            <Button
              size="sm"
              variant="danger"
              onClick={handleCancel}
              loading={cancelTraining.isPending}
            >
              Cancel
            </Button>
          </>
        )}

        {training.status === "IN_PROGRESS" && (
          <>
            <Button
              size="sm"
              variant="primary"
              onClick={handleComplete}
              loading={completeTraining.isPending}
            >
              Complete
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={handleCancel}
              loading={cancelTraining.isPending}
            >
              Cancel
            </Button>
          </>
        )}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Training Details card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Training Details
            </h3>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-400">Training No</dt>
                <dd className="text-sm font-medium">
                  {training.trainingNo}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Title</dt>
                <dd className="text-sm font-medium">{training.title}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-gray-400">Description</dt>
                <dd className="text-sm">
                  {training.description || "\u2014"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-gray-400">Topics</dt>
                <dd className="text-sm">
                  {training.topics || "\u2014"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Mode</dt>
                <dd className="mt-1">
                  <Badge variant={modeVariantMap[training.mode]}>
                    {training.mode}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Contact</dt>
                <dd className="text-sm">
                  {training.contact
                    ? `${training.contact.firstName} ${training.contact.lastName}`
                    : "\u2014"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Organization</dt>
                <dd className="text-sm">
                  {training.organization?.name ?? "\u2014"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Lead</dt>
                <dd className="text-sm">
                  {training.lead?.title ?? "\u2014"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Trainer & Venue card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Trainer &amp; Venue
            </h3>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-400">Trainer Name</dt>
                <dd className="text-sm">
                  {training.trainerName || "\u2014"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Trainer Contact</dt>
                <dd className="text-sm">
                  {training.trainerContact || "\u2014"}
                </dd>
              </div>
              {training.location && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-gray-400">Location</dt>
                  <dd className="text-sm">{training.location}</dd>
                </div>
              )}
              {training.meetingLink && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-gray-400">Meeting Link</dt>
                  <dd className="text-sm">
                    <a
                      href={training.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {training.meetingLink}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-gray-400">Max Attendees</dt>
                <dd className="text-sm">
                  {training.maxAttendees != null
                    ? training.maxAttendees
                    : "\u2014"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Actual Attendees</dt>
                <dd className="text-sm">
                  {training.actualAttendees != null
                    ? training.actualAttendees
                    : "\u2014"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Feedback card */}
          {hasFeedback && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Feedback
              </h3>
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {training.feedback && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-gray-400">Feedback</dt>
                    <dd>
                      <pre className="whitespace-pre-wrap text-sm">
                        {training.feedback}
                      </pre>
                    </dd>
                  </div>
                )}
                {training.rating != null && (
                  <div>
                    <dt className="text-xs text-gray-400">Rating</dt>
                    <dd className="text-sm font-medium">{training.rating}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Notes card */}
          {hasNotes && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
                Notes
              </h3>
              <dl className="space-y-3">
                {training.notes && (
                  <div>
                    <dt className="text-xs text-gray-400">Notes</dt>
                    <dd>
                      <pre className="whitespace-pre-wrap text-sm">
                        {training.notes}
                      </pre>
                    </dd>
                  </div>
                )}
                {training.internalNotes && (
                  <div>
                    <dt className="text-xs text-gray-400">Internal Notes</dt>
                    <dd>
                      <pre className="whitespace-pre-wrap text-sm">
                        {training.internalNotes}
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
          {/* Status & Mode card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Status &amp; Mode
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge
                status={training.status}
                colorMap={statusColorMap}
              />
              <Badge variant={modeVariantMap[training.mode]}>
                {training.mode}
              </Badge>
            </div>
          </div>

          {/* Schedule card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Schedule
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-gray-400">Scheduled Date</dt>
                <dd>{formatDate(training.scheduledDate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Start Time</dt>
                <dd>{training.startTime || "\u2014"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">End Time</dt>
                <dd>{training.endTime || "\u2014"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Duration</dt>
                <dd>{training.duration || "\u2014"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Completed Date</dt>
                <dd>
                  {training.completedDate
                    ? formatDate(training.completedDate)
                    : "\u2014"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Attendance card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
              Attendance
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-gray-400">Max Attendees</dt>
                <dd>
                  {training.maxAttendees != null
                    ? training.maxAttendees
                    : "\u2014"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Actual Attendees</dt>
                <dd>
                  {training.actualAttendees != null
                    ? training.actualAttendees
                    : "\u2014"}
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
                <dd>{formatDate(training.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Updated At</dt>
                <dd>{formatDate(training.updatedAt)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
