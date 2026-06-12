"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { Icon, Button } from "@/components/ui";
import { useSidePanelStore } from "@/stores/side-panel.store";
import { useUploadFile, useImportJob, useCommitImport, useCancelImport } from "@/features/bulk-import/hooks/useBulkImport";
import { ImportStepMapping } from "@/features/bulk-import/components/ImportStepMapping";
import { ImportStepValidation } from "@/features/bulk-import/components/ImportStepValidation";
import { ImportStepProgress } from "@/features/bulk-import/components/ImportStepProgress";
import type { ImportTargetEntity } from "@/features/bulk-import/types/bulk-import.types";

// ── Props ────────────────────────────────────────────────

export interface DataImportProps {
  entityType: ImportTargetEntity;
  entityLabel?: string;
  onComplete?: () => void;
  onClose: () => void;
}

const ENTITY_LABELS: Record<string, string> = {
  CONTACT: "Contacts",
  ORGANIZATION: "Organizations",
  LEAD: "Leads",
  PRODUCT: "Products",
  ROW_CONTACT: "Raw Contacts",
  LEDGER: "Ledger Accounts",
};

/**
 * DataImport — opens the import wizard inside the shared SidePanel.
 */
export function DataImport({ entityType, entityLabel, onComplete, onClose }: DataImportProps) {
  const label = entityLabel || ENTITY_LABELS[entityType] || entityType;
  const panelId = `import-${entityType}`;
  const openPanel = useSidePanelStore((s) => s.openPanel);

  const opened = useRef(false);
  if (!opened.current) {
    opened.current = true;
    openPanel({
      id: panelId,
      title: `Import ${label}`,
      icon: "upload",
      width: 720,
      content: (
        <ImportWizardContent
          entityType={entityType}
          panelId={panelId}
          onComplete={() => {
            onComplete?.();
            useSidePanelStore.getState().closePanel(panelId);
            onClose();
          }}
          onClose={() => {
            useSidePanelStore.getState().closePanel(panelId);
            onClose();
          }}
        />
      ),
      onClose: () => onClose(),
    });
  }

  return null;
}

// ── Inner wizard content ─────────────────────────────────

const ACCEPTED_TYPES = [
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

type Step = "upload" | "mapping" | "validation" | "progress";

const STEPS: { key: Step; label: string }[] = [
  { key: "upload", label: "Upload" },
  { key: "mapping", label: "Map Fields" },
  { key: "validation", label: "Validate" },
  { key: "progress", label: "Import" },
];

function ImportWizardContent({
  entityType,
  panelId,
  onComplete,
  onClose,
}: {
  entityType: ImportTargetEntity;
  panelId: string;
  onComplete: () => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>("upload");
  const [jobId, setJobId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);

  const uploadMut = useUploadFile();
  const { data: jobRes } = useImportJob(jobId);
  const commitMut = useCommitImport();
  const cancelMut = useCancelImport();
  const job = jobRes?.data;

  const currentIdx = STEPS.findIndex((s) => s.key === step);

  const handleFile = useCallback((f: File) => {
    if (!ACCEPTED_TYPES.includes(f.type) && !f.name.endsWith(".csv") && !f.name.endsWith(".xlsx") && !f.name.endsWith(".xls")) {
      toast.error("Only CSV, XLS, and XLSX files are supported");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      toast.error("File size must be under 10 MB");
      return;
    }
    setFile(f);
  }, []);

  // Store refs for footer button callbacks
  const uploadRef = useRef<() => void>(() => {});
  const commitRef = useRef<() => void>(() => {});
  const completeRef = useRef<() => void>(() => {});

  uploadRef.current = () => {
    if (!file) return;
    uploadMut.mutate(
      { file, targetEntity: entityType },
      {
        onSuccess: (res) => {
          const raw = res?.data?.data ?? res?.data ?? res;
          const id = raw?.jobId ?? raw?.id;
          const total = raw?.totalRows ?? 0;
          if (id) {
            setJobId(id);
            setStep("mapping");
            toast.success(`File parsed: ${total} rows found`);
          }
        },
        onError: () => toast.error("Upload failed"),
      },
    );
  };

  commitRef.current = () => {
    if (!jobId) return;
    commitMut.mutate(jobId, {
      onSuccess: () => { setStep("progress"); toast.success("Import started"); },
      onError: () => toast.error("Failed to start import"),
    });
  };

  completeRef.current = onComplete;

  // Update footer buttons based on current step
  useEffect(() => {
    const makeFooter = () => {
      switch (step) {
        case "upload":
          return [
            { id: "cancel", label: "Cancel", showAs: "text" as const, onClick: () => onClose(), variant: "ghost" as const },
            { id: "upload", label: file ? (uploadMut.isPending ? "Uploading..." : "Upload & Continue") : "Select a file first", showAs: "text" as const, onClick: () => uploadRef.current(), variant: "primary" as const, disabled: !file || uploadMut.isPending },
          ];
        case "mapping":
          return []; // Mapping step has its own "Apply Mapping & Validate" button
        case "validation":
          return []; // Validation step has its own "Start Import" button
        case "progress":
          return [
            { id: "done", label: "Done — Close", showAs: "text" as const, onClick: () => completeRef.current(), variant: "primary" as const },
          ];
        default:
          return [];
      }
    };

    updatePanelConfig(panelId, { footerButtons: makeFooter() });
  }, [step, file, uploadMut.isPending, panelId, updatePanelConfig, onClose]);

  return (
    <div>
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-0 mb-5">
        {STEPS.map((s, i) => {
          const isActive = i === currentIdx;
          const isDone = i < currentIdx;
          return (
            <div key={s.key} className="flex items-center">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium ${
                isActive ? "bg-blue-50 text-blue-700 border border-blue-200" :
                isDone ? "bg-green-50 text-green-700 border border-green-200" :
                "bg-white text-gray-400 border border-gray-200"
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                  isActive ? "bg-blue-500" : isDone ? "bg-green-500" : "bg-gray-300"
                }`}>
                  {isDone ? <Icon name="check" size={10} color="#fff" /> : i + 1}
                </div>
                {s.label}
              </div>
              {i < STEPS.length - 1 && <div className={`w-6 h-0.5 ${i < currentIdx ? "bg-green-300" : "bg-gray-200"}`} />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
            dragOver ? "border-blue-400 bg-blue-50" :
            file ? "border-green-300 bg-green-50" :
            "border-gray-300 bg-gray-50 hover:border-gray-400"
          }`}
        >
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          {file ? (
            <div>
              <Icon name="check-circle" size={36} color="#16a34a" />
              <div className="font-semibold text-sm mt-2 text-green-700">{file.name}</div>
              <div className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(0)} KB — Click to change</div>
            </div>
          ) : (
            <div>
              <Icon name="upload-cloud" size={36} color="#9ca3af" />
              <div className="font-medium text-sm mt-2 text-gray-700">Drop your file here or click to browse</div>
              <div className="text-xs text-gray-400 mt-1">CSV, XLS, or XLSX up to 10 MB</div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Mapping */}
      {step === "mapping" && job && <ImportStepMapping job={job} onMapped={() => setStep("validation")} />}

      {/* Step 3: Validation */}
      {step === "validation" && job && <ImportStepValidation job={job} onCommit={() => commitRef.current()} />}

      {/* Step 4: Progress */}
      {step === "progress" && job && <ImportStepProgress job={job} onDone={onComplete} />}
    </div>
  );
}
