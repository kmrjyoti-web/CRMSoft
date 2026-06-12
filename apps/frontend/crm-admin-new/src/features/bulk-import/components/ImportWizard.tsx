"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Icon, Button } from "@/components/ui";
import { PageHeader } from "@/components/common";
import { useUploadFile, useImportJob, useCommitImport, useCancelImport } from "../hooks/useBulkImport";
import { ImportStepUpload } from "./ImportStepUpload";
import { ImportStepMapping } from "./ImportStepMapping";
import { ImportStepValidation } from "./ImportStepValidation";
import { ImportStepProgress } from "./ImportStepProgress";
import type { ImportTargetEntity } from "../types/bulk-import.types";

type WizardStep = "upload" | "mapping" | "validation" | "progress";

const STEPS: { key: WizardStep; label: string; icon: Parameters<typeof Icon>[0]["name"] }[] = [
  { key: "upload", label: "Upload", icon: "upload-cloud" },
  { key: "mapping", label: "Map Fields", icon: "columns" },
  { key: "validation", label: "Validate", icon: "check-square" },
  { key: "progress", label: "Import", icon: "check-circle" },
];

export function ImportWizard() {
  const [step, setStep] = useState<WizardStep>("upload");
  const [jobId, setJobId] = useState<string>("");

  const uploadMut = useUploadFile();
  const { data: jobRes } = useImportJob(jobId);
  const commitMut = useCommitImport();
  const cancelMut = useCancelImport();

  const job = jobRes?.data;

  const handleUpload = (file: File, targetEntity: ImportTargetEntity) => {
    uploadMut.mutate(
      { file, targetEntity },
      {
        onSuccess: (res) => {
          const newJob = res?.data;
          if (newJob?.id) {
            setJobId(newJob.id);
            setStep("mapping");
            toast.success(`File parsed: ${newJob.totalRows} rows found`);
          }
        },
        onError: () => toast.error("Upload failed"),
      },
    );
  };

  const handleMapped = () => {
    setStep("validation");
  };

  const handleCommit = () => {
    if (!jobId) return;
    commitMut.mutate(jobId, {
      onSuccess: () => {
        setStep("progress");
        toast.success("Import started");
      },
      onError: () => toast.error("Failed to start import"),
    });
  };

  const handleCancel = () => {
    if (!jobId) return;
    cancelMut.mutate(jobId, {
      onSuccess: () => {
        toast.success("Import cancelled");
        setStep("upload");
        setJobId("");
      },
    });
  };

  const handleDone = () => {
    setStep("upload");
    setJobId("");
  };

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="p-6">
      <PageHeader
        title="Bulk Import"
        subtitle="Import contacts, organizations, leads, or products from CSV/XLSX"
        actions={
          step !== "upload" && step !== "progress" ? (
            <Button variant="outline" onClick={handleCancel} loading={cancelMut.isPending}>
              <Icon name="x" size={16} />
              Cancel Import
            </Button>
          ) : undefined
        }
      />

      {/* Step Indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
          marginBottom: 32,
        }}
      >
        {STEPS.map((s, i) => {
          const isActive = i === currentStepIndex;
          const isCompleted = i < currentStepIndex;
          return (
            <div key={s.key} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: isActive ? "#eff6ff" : isCompleted ? "#f0fdf4" : "#f9fafb",
                  border: `1px solid ${isActive ? "#3b82f6" : isCompleted ? "#86efac" : "#e5e7eb"}`,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isActive ? "#3b82f6" : isCompleted ? "#16a34a" : "#e5e7eb",
                    color: isActive || isCompleted ? "#fff" : "#9ca3af",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {isCompleted ? (
                    <Icon name="check" size={14} color="#fff" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#1d4ed8" : isCompleted ? "#16a34a" : "#6b7280",
                  }}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    width: 32,
                    height: 2,
                    background: i < currentStepIndex ? "#86efac" : "#e5e7eb",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      {step === "upload" && (
        <ImportStepUpload onUpload={handleUpload} isUploading={uploadMut.isPending} />
      )}

      {step === "mapping" && job && (
        <ImportStepMapping job={job} onMapped={handleMapped} />
      )}

      {step === "validation" && job && (
        <ImportStepValidation job={job} onCommit={handleCommit} />
      )}

      {step === "progress" && job && (
        <ImportStepProgress job={job} onDone={handleDone} />
      )}
    </div>
  );
}
