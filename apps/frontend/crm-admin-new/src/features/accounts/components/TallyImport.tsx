"use client";

/**
 * TallyImport — Import ledgers from a Tally XML export file.
 *
 * How to export from Tally:
 *   Gateway of Tally → Display → List of Accounts → Ledgers → Export (XML)
 *
 * The exported XML contains <LEDGER> elements under <TALLYMESSAGE>.
 * This component parses the file client-side, shows a preview table,
 * then POSTs the parsed data to POST /api/v1/accounts/ledgers/tally-import.
 */

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { Icon, Button } from "@/components/ui";
import { accountsService } from "../services/accounts.service";

// ── Tally XML parser ────────────────────────────────────────────────────────

function parseTallyXML(xmlText: string): any[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");

  const parseError = doc.querySelector("parsererror");
  if (parseError) throw new Error("Invalid XML file");

  const ledgerEls = Array.from(doc.querySelectorAll("LEDGER"));
  if (ledgerEls.length === 0) throw new Error("No LEDGER elements found. Make sure this is a Tally ledger export XML.");

  return ledgerEls.map((el) => {
    const getText = (tag: string) => el.querySelector(tag)?.textContent?.trim() ?? "";
    const getLines = (tag: string) =>
      Array.from(el.querySelectorAll(tag)).map((n) => n.textContent?.trim() ?? "").filter(Boolean);

    return {
      NAME:                 el.getAttribute("NAME") ?? getText("NAME"),
      PARENT:               getText("PARENT"),
      OPENINGBALANCE:       getText("OPENINGBALANCE"),
      EMAIL:                getText("EMAIL"),
      PARTYGSTIN:           getText("PARTYGSTIN"),
      PANNO:                getText("PANNO"),
      COUNTRYNAME:          getText("COUNTRYNAME"),
      STATENAME:            getText("LEDSTATENAME") || getText("STATENAME"),
      PINCODE:              getText("PINCODE"),
      BANKACNO:             getText("BANKACNO"),
      BANKNAME:             getText("BANKNAME"),
      IFSCCODE:             getText("IFSCCODE"),
      GSTREGISTRATIONTYPE:  getText("GSTREGISTRATIONTYPE"),
      ADDRESS:              getLines("ADDRESS"),
    };
  });
}

// ── groupType label from Tally PARENT ───────────────────────────────────────

const PARENT_LABEL: Record<string, { label: string; color: string }> = {
  "Sundry Debtors":           { label: "ASSET",     color: "#16a34a" },
  "Sundry Creditors":         { label: "LIABILITY",  color: "#dc2626" },
  "Bank Accounts":            { label: "ASSET",      color: "#16a34a" },
  "Cash-in-Hand":             { label: "ASSET",      color: "#16a34a" },
  "Capital Account":          { label: "EQUITY",     color: "#7c3aed" },
  "Current Assets":           { label: "ASSET",      color: "#16a34a" },
  "Current Liabilities":      { label: "LIABILITY",  color: "#dc2626" },
  "Fixed Assets":             { label: "ASSET",      color: "#16a34a" },
  "Investments":              { label: "ASSET",      color: "#16a34a" },
  "Loans & Advances (Asset)": { label: "ASSET",      color: "#16a34a" },
  "Secured Loans":            { label: "LIABILITY",  color: "#dc2626" },
  "Unsecured Loans":          { label: "LIABILITY",  color: "#dc2626" },
  "Bank OD A/c":              { label: "LIABILITY",  color: "#dc2626" },
  "Duties & Taxes":           { label: "LIABILITY",  color: "#dc2626" },
  "Provisions":               { label: "LIABILITY",  color: "#dc2626" },
  "Revenue Account":          { label: "INCOME",     color: "#0891b2" },
  "Direct Incomes":           { label: "INCOME",     color: "#0891b2" },
  "Direct Expenses":          { label: "EXPENSE",    color: "#ea580c" },
  "Indirect Expenses":        { label: "EXPENSE",    color: "#ea580c" },
  "Reserves & Surplus":       { label: "EQUITY",     color: "#7c3aed" },
  "Profit & Loss":            { label: "EQUITY",     color: "#7c3aed" },
  "Stock-in-Hand":            { label: "ASSET",      color: "#16a34a" },
};

function groupLabel(parent: string) {
  return PARENT_LABEL[parent] ?? { label: "ASSET", color: "#6b7280" };
}

// ── Component ────────────────────────────────────────────────────────────────

export function TallyImport() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: number; results: any[] } | null>(null);
  const [error, setError] = useState("");

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError("");
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const ledgers = parseTallyXML(ev.target?.result as string);
        setParsed(ledgers);
      } catch (err: any) {
        setError(err.message ?? "Failed to parse file");
        setParsed([]);
      }
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!parsed.length) return;
    setImporting(true);
    try {
      const res = await accountsService.tallyImportLedgers(parsed);
      const d = res?.data ?? res;
      setResult(d);
      toast.success(`Import done: ${d.created} created, ${d.skipped} skipped`);
      setParsed([]);
      setFileName("");
    } catch {
      toast.error("Import failed. Check console for details.");
    } finally {
      setImporting(false);
    }
  }

  function reset() {
    setParsed([]);
    setFileName("");
    setResult(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div style={{ maxWidth: 960 }}>

      {/* Instructions card */}
      <div style={{
        background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10,
        padding: "14px 18px", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start",
      }}>
        <span style={{ color: "#2563eb", flexShrink: 0, marginTop: 2 }}>
          <Icon name="info" size={16} />
        </span>
        <div style={{ fontSize: 13, color: "#1e40af", lineHeight: 1.6 }}>
          <strong>How to export from Tally Prime / Tally ERP 9:</strong><br />
          Gateway of Tally → <strong>Display</strong> → <strong>List of Accounts</strong> → <strong>Ledgers</strong>
          → Press <kbd style={{ background: "#dbeafe", padding: "1px 5px", borderRadius: 4, fontSize: 11 }}>Alt+E</kbd>
          → Format: <strong>XML</strong> → Export.<br />
          Then upload the <code>.xml</code> file below. Duplicate ledger names are automatically skipped.
        </div>
      </div>

      {/* Upload zone */}
      {!parsed.length && !result && (
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: "2px dashed #d1d5db", borderRadius: 12, padding: "48px 24px",
            textAlign: "center", cursor: "pointer", background: "#fafafa",
            transition: "border-color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
        >
          <div style={{ marginBottom: 10 }}>
            <Icon name="upload-cloud" size={36} color="#9ca3af" />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 4 }}>
            Click to upload Tally XML export
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>
            Supports .xml files exported from Tally Prime or ERP 9
          </div>
          <input ref={fileRef} type="file" accept=".xml" onChange={handleFile} style={{ display: "none" }} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8,
          padding: "12px 16px", color: "#dc2626", fontSize: 13, display: "flex", gap: 8, alignItems: "center",
        }}>
          <Icon name="alert-circle" size={16} />
          {error}
        </div>
      )}

      {/* Preview table */}
      {parsed.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                {parsed.length} ledgers found
              </span>
              <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 8 }}>from {fileName}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="secondary" onClick={reset}>Clear</Button>
              <Button variant="primary" onClick={handleImport} loading={importing}>
                {importing ? "Importing…" : `Import ${parsed.length} Ledgers`}
              </Button>
            </div>
          </div>

          <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ overflowX: "auto", maxHeight: 420, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    {["#", "Name", "Tally Group (PARENT)", "Type", "Opening Bal", "GSTIN", "State"].map((h) => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#6b7280", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsed.map((l, i) => {
                    const { label, color } = groupLabel(l.PARENT);
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "7px 12px", color: "#9ca3af" }}>{i + 1}</td>
                        <td style={{ padding: "7px 12px", fontWeight: 600, color: "#111827" }}>{l.NAME}</td>
                        <td style={{ padding: "7px 12px", color: "#6b7280" }}>{l.PARENT || "—"}</td>
                        <td style={{ padding: "7px 12px" }}>
                          <span style={{
                            padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700,
                            background: color + "18", color,
                          }}>{label}</span>
                        </td>
                        <td style={{ padding: "7px 12px", color: "#374151", fontFamily: "monospace" }}>
                          {l.OPENINGBALANCE || "0"}
                        </td>
                        <td style={{ padding: "7px 12px", color: "#6b7280" }}>{l.PARTYGSTIN || "—"}</td>
                        <td style={{ padding: "7px 12px", color: "#6b7280" }}>{l.STATENAME || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Import result summary */}
      {result && (
        <div>
          <div style={{
            background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10,
            padding: "16px 20px", marginBottom: 20,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", gap: 24 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#16a34a" }}>{result.created}</div>
                <div style={{ fontSize: 11, color: "#15803d", fontWeight: 600 }}>CREATED</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#d97706" }}>{result.skipped}</div>
                <div style={{ fontSize: 11, color: "#b45309", fontWeight: 600 }}>SKIPPED (already exist)</div>
              </div>
            </div>
            <Button variant="secondary" onClick={reset}>Import Another File</Button>
          </div>

          {/* Detail rows */}
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ overflowY: "auto", maxHeight: 320 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    <th style={{ padding: "8px 12px", textAlign: "left", color: "#6b7280", fontWeight: 600 }}>Name</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", color: "#6b7280", fontWeight: 600 }}>Code</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", color: "#6b7280", fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((r: any, i: number) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "7px 12px", color: "#111827" }}>{r.name}</td>
                      <td style={{ padding: "7px 12px", fontFamily: "monospace", color: "#6b7280" }}>{r.code || "—"}</td>
                      <td style={{ padding: "7px 12px" }}>
                        <span style={{
                          padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700,
                          background: r.status === "created" ? "#dcfce7" : "#fef3c7",
                          color: r.status === "created" ? "#15803d" : "#b45309",
                        }}>
                          {r.status === "created" ? "✓ Created" : "— Skipped"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
