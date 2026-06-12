"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Icon, Button, SelectInput } from "@/components/ui";
import type { ImportTargetEntity } from "../types/bulk-import.types";

const TARGET_OPTIONS = [
  { label: "Contacts", value: "CONTACT" },
  { label: "Organizations", value: "ORGANIZATION" },
  { label: "Leads", value: "LEAD" },
  { label: "Products", value: "PRODUCT" },
];

const ACCEPTED_TYPES = [
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface ImportStepUploadProps {
  onUpload: (file: File, targetEntity: ImportTargetEntity) => void;
  isUploading: boolean;
}

export function ImportStepUpload({ onUpload, isUploading }: ImportStepUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [targetEntity, setTargetEntity] = useState<ImportTargetEntity>("CONTACT");
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f: File) => {
    if (!ACCEPTED_TYPES.includes(f.type) && !f.name.endsWith(".csv") && !f.name.endsWith(".xlsx")) {
      toast.error("Only CSV and XLSX files are supported");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      toast.error("File size must be under 10 MB");
      return;
    }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = () => {
    if (!file) return;
    onUpload(file, targetEntity);
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      {/* Target Entity */}
      <div style={{ marginBottom: 24 }}>
        <SelectInput
          label="Import Type"
          options={TARGET_OPTIONS}
          value={targetEntity}
          onChange={(v) => setTargetEntity(String(v ?? "CONTACT") as ImportTargetEntity)}
          leftIcon={<Icon name="database" size={16} />}
        />
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? "#3b82f6" : "#d1d5db"}`,
          borderRadius: 12,
          padding: "48px 24px",
          textAlign: "center",
          cursor: "pointer",
          backgroundColor: dragOver ? "#eff6ff" : "#f9fafb",
          transition: "all 0.2s",
        }}
      >
        <Icon name="upload-cloud" size={40} color="#9ca3af" />
        <p style={{ fontSize: 15, fontWeight: 500, color: "#374151", marginTop: 12 }}>
          {file ? file.name : "Drop your file here or click to browse"}
        </p>
        <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
          CSV or XLSX, max 10 MB, up to 10,000 rows
        </p>
        {file && (
          <p style={{ fontSize: 12, color: "#3b82f6", marginTop: 8 }}>
            {(file.size / 1024).toFixed(1)} KB
          </p>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      {/* File Info */}
      {file && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 16,
            padding: "12px 16px",
            background: "#f0fdf4",
            borderRadius: 8,
            border: "1px solid #bbf7d0",
          }}
        >
          <Icon name="file-spreadsheet" size={20} color="#16a34a" />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 500 }}>{file.name}</p>
            <p style={{ fontSize: 11, color: "#6b7280" }}>
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setFile(null); }}
            style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af" }}
          >
            <Icon name="x" size={16} />
          </button>
        </div>
      )}

      {/* Upload Button */}
      <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={isUploading}
          disabled={!file || isUploading}
        >
          <Icon name="upload" size={16} />
          Upload & Parse
        </Button>
      </div>
    </div>
  );
}
