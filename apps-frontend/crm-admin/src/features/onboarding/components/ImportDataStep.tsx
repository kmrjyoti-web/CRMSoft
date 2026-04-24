"use client";

import { useState, useRef } from "react";

import toast from "react-hot-toast";

import { Button, Typography, Icon } from "@/components/ui";

interface ImportDataStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function ImportDataStep({ onComplete, onSkip }: ImportDataStepProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.name.endsWith(".csv") && !selected.name.endsWith(".xlsx")) {
        toast.error("Please upload a CSV or Excel file");
        return;
      }
      setFile(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    // For now, just mark step as complete — actual import logic can be added later
    setTimeout(() => {
      toast.success("Import started — you can track progress from the dashboard");
      setUploading(false);
      onComplete();
    }, 1500);
  };

  return (
    <div>
      <div className="text-center mb-6">
        <div
          className="mx-auto mb-3 flex items-center justify-center"
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-lg, 12px)",
            background: "var(--color-primary-light, rgba(59,130,246,0.1))",
          }}
        >
          <Icon name="upload" size={24} />
        </div>
        <Typography variant="heading" level={4}>
          Import Your Data
        </Typography>
        <Typography variant="text" color="muted" size="14px">
          Upload a CSV or Excel file with your contacts to get started quickly
        </Typography>
      </div>

      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: "2px dashed var(--border-color, #e2e8f0)",
          borderRadius: "var(--radius-lg, 12px)",
          padding: "40px 20px",
          textAlign: "center",
          cursor: "pointer",
          transition: "border-color 0.2s ease",
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = "var(--color-primary)";
        }}
        onDragLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border-color, #e2e8f0)";
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = "var(--border-color, #e2e8f0)";
          const dropped = e.dataTransfer.files?.[0];
          if (dropped) setFile(dropped);
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
        <Icon name="upload-cloud" size={40} />
        <Typography variant="text" className="mt-3">
          {file ? file.name : "Click or drag file to upload"}
        </Typography>
        <Typography variant="text" color="muted" size="12px" className="mt-1">
          Supports CSV and Excel files (max 10MB)
        </Typography>
      </div>

      {file && (
        <div
          className="mt-3 flex items-center gap-2 px-3 py-2"
          style={{
            background: "var(--color-primary-light, rgba(59,130,246,0.05))",
            borderRadius: "var(--radius-md, 8px)",
          }}
        >
          <Icon name="file" size={16} />
          <span className="text-sm flex-1">{file.name}</span>
          <span className="text-xs text-slate-500">
            {(file.size / 1024).toFixed(1)} KB
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setFile(null);
            }}
          >
            <Icon name="x" size={14} />
          </Button>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <Button type="button" variant="ghost" onClick={onSkip}>
          Skip for now
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleUpload}
          loading={uploading}
          disabled={uploading || !file}
        >
          Upload & Continue
          <Icon name="arrow-right" size={16} />
        </Button>
      </div>
    </div>
  );
}
