import { saveAs } from "file-saver";

export type ExportFormat = "csv" | "json" | "excel" | "pdf";

export interface ExportColumn {
  id: string;
  label: string;
}

export interface ExportOptions {
  data: Record<string, unknown>[];
  columns: ExportColumn[];
  fileName: string;
}

/** Strip React elements, handle null/undefined, convert to plain string */
function cellToString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  // React element or object — skip
  if (typeof value === "object") return "";
  return String(value);
}

function buildFileName(base: string, ext: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${base}-${date}.${ext}`;
}

/** Build rows as string[][] from data + columns */
function buildRows(data: Record<string, unknown>[], columns: ExportColumn[]): string[][] {
  return data.map((row) => columns.map((col) => cellToString(row[col.id])));
}

// ─── CSV (native) ───────────────────────────────────────────────────────────

function exportCSV({ data, columns, fileName }: ExportOptions): void {
  const headers = columns.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(",");
  const rows = buildRows(data, columns).map((row) =>
    row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","),
  );
  const csv = [headers, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, buildFileName(fileName, "csv"));
}

// ─── JSON (native) ──────────────────────────────────────────────────────────

function exportJSON({ data, columns, fileName }: ExportOptions): void {
  const cleaned = data.map((row) => {
    const obj: Record<string, string> = {};
    for (const col of columns) {
      obj[col.label] = cellToString(row[col.id]);
    }
    return obj;
  });
  const json = JSON.stringify(cleaned, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  saveAs(blob, buildFileName(fileName, "json"));
}

// ─── Excel (dynamic import for code-splitting) ─────────────────────────────

async function exportExcel({ data, columns, fileName }: ExportOptions): Promise<void> {
  const XLSX = await import("xlsx");
  const headers = columns.map((c) => c.label);
  const rows = buildRows(data, columns);
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Auto-fit column widths
  ws["!cols"] = columns.map((col, i) => {
    const maxLen = Math.max(
      col.label.length,
      ...rows.map((r) => (r[i] ?? "").length),
    );
    return { wch: Math.min(maxLen + 2, 40) };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, buildFileName(fileName, "xlsx"));
}

// ─── PDF (dynamic import for code-splitting) ────────────────────────────────

async function exportPDF({ data, columns, fileName }: ExportOptions): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  // Title
  doc.setFontSize(14);
  doc.text(fileName.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), 40, 30);

  const headers = columns.map((c) => c.label);
  const rows = buildRows(data, columns);

  autoTable(doc, {
    startY: 45,
    head: [headers],
    body: rows,
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { left: 20, right: 20 },
  });

  doc.save(buildFileName(fileName, "pdf"));
}

// ─── Main dispatcher ────────────────────────────────────────────────────────

export async function exportData(
  format: ExportFormat,
  options: ExportOptions,
): Promise<void> {
  switch (format) {
    case "csv":
      return exportCSV(options);
    case "json":
      return exportJSON(options);
    case "excel":
      return exportExcel(options);
    case "pdf":
      return exportPDF(options);
  }
}
