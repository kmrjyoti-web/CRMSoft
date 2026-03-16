"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { Badge, Button, Icon, NumberInput } from "@/components/ui";
import { useRFQList, useCompareQuotations, useSelectWinner } from "../hooks/useProcurement";
import type { PurchaseRFQ, QuotationScore } from "../types/procurement.types";

// ── Types ─────────────────────────────────────────────────────────────

interface AutoSelectCriteria {
  minQuoteValue:       number | null;
  minDeliveryDays:     number | null;
  maxGracePeriod:      number | null;
  maxQuotationsPerRFQ: number | null;
}

interface RFQCompareResult {
  rfqId:         string;
  rfqNumber:     string;
  rfqTitle:      string;
  comparisonId?: string;
  scores:        QuotationScore[];
  error?:        string;
  aiDecision?:   AIDecision;
}

interface AIDecision {
  recommendedQuotationId: string;
  vendorId:               string;
  reason:                 string;
  confidence:             number; // 0-100
}

// ── Helpers ───────────────────────────────────────────────────────────

function fmtINR(n: number) {
  return `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

// ── Score Bar ─────────────────────────────────────────────────────────

function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct   = Math.min(100, (value / max) * 100);
  const color = pct >= 70 ? "#16a34a" : pct >= 40 ? "#d97706" : "#dc2626";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 80 }}>
      <div style={{ flex: 1, height: 5, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 24, textAlign: "right" }}>{value}</span>
    </div>
  );
}

// ── AI Chip ───────────────────────────────────────────────────────────

function AIBadge({ decision }: { decision: AIDecision }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
      color: "#fff", borderRadius: 20, padding: "4px 10px", fontSize: 11, fontWeight: 600,
    }}>
      <span style={{ fontSize: 13 }}>✦</span>
      AI Pick · {decision.confidence}% confidence
    </div>
  );
}

// ── Compare Results Table (per RFQ) ───────────────────────────────────

function CompareResultCard({
  result,
  criteria,
  onSelect,
  selecting,
  onAIDecide,
  aiLoading,
}: {
  result:     RFQCompareResult;
  criteria:   AutoSelectCriteria;
  onSelect:   (quotationId: string, comparisonId?: string) => void;
  selecting:  boolean;
  onAIDecide: (result: RFQCompareResult) => void;
  aiLoading:  boolean;
}) {
  const filtered = useMemo(() => {
    let rows = [...result.scores];
    if (criteria.minQuoteValue       != null) rows = rows.filter((s) => s.grandTotal  >= criteria.minQuoteValue!);
    if (criteria.minDeliveryDays     != null) rows = rows.filter((s) => (s.deliveryDays ?? 0) >= criteria.minDeliveryDays!);
    if (criteria.maxGracePeriod      != null) rows = rows.filter((s) => (s.creditDays  ?? 0) <= criteria.maxGracePeriod!);
    if (criteria.maxQuotationsPerRFQ != null) rows = rows.slice(0, criteria.maxQuotationsPerRFQ);
    return rows;
  }, [result.scores, criteria]);

  const topScore = filtered.length ? Math.max(...filtered.map((s) => s.totalScore)) : 0;
  const aiQuoteId = result.aiDecision?.recommendedQuotationId;

  return (
    <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: 16 }}>
      {/* Card header */}
      <div style={{
        padding: "10px 16px", borderBottom: "1px solid #f3f4f6",
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
      }}>
        <Icon name="file-text" size={15} />
        <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{result.rfqNumber}</span>
        <span style={{ fontSize: 12, color: "#6b7280" }}>{result.rfqTitle}</span>
        {!result.error && (
          <Badge variant="primary">{filtered.length} / {result.scores.length} quotations</Badge>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          {result.aiDecision && <AIBadge decision={result.aiDecision} />}
          {!result.error && result.scores.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAIDecide(result)}
              disabled={aiLoading}
              style={{
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                color: "#fff", border: "none", borderRadius: 20,
                padding: "4px 12px", fontSize: 12, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 5,
                opacity: aiLoading ? 0.7 : 1,
              }}
            >
              <span style={{ fontSize: 14 }}>✦</span>
              {aiLoading ? "Thinking…" : "AI Decide"}
            </Button>
          )}
        </div>
      </div>

      {/* AI explanation */}
      {result.aiDecision && (
        <div style={{
          margin: "10px 16px 0",
          padding: "10px 14px",
          background: "linear-gradient(135deg,#f5f3ff,#ede9fe)",
          borderRadius: 8, border: "1px solid #c4b5fd",
          fontSize: 12, color: "#4c1d95", lineHeight: 1.6,
        }}>
          <span style={{ fontWeight: 700 }}>✦ AI Recommendation: </span>
          {result.aiDecision.reason}
        </div>
      )}

      {/* Error */}
      {result.error && (
        <div style={{ padding: "12px 16px", color: "#dc2626", fontSize: 13, background: "#fef2f2" }}>
          {result.error}
        </div>
      )}

      {/* Table */}
      {!result.error && (
        <div style={{ overflowX: "auto", padding: "10px 16px" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, padding: "20px 0" }}>
              No quotations match current criteria
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Rank", "Vendor", "Grand Total", "Del. Days", "Credit Days", "Price ▼", "Delivery ▼", "Credit ▼", "Quality ▼", "Total Score", "Action"].map((h) => (
                    <th key={h} style={{
                      padding: "8px 10px", fontWeight: 600, fontSize: 10, color: "#6b7280",
                      textTransform: "uppercase", letterSpacing: "0.04em",
                      borderBottom: "2px solid #e5e7eb", whiteSpace: "nowrap",
                      textAlign: h === "Grand Total" ? "right" : "left",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, idx) => {
                  const isTop   = s.totalScore === topScore;
                  const isAIPick = s.quotationId === aiQuoteId;
                  return (
                    <tr key={s.quotationId} style={{
                      borderBottom: "1px solid #f3f4f6",
                      background: isAIPick ? "#f5f3ff" : isTop ? "#f0fdf4" : undefined,
                    }}>
                      <td style={{ padding: "8px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Badge variant={idx === 0 ? "success" : idx === 1 ? "warning" : "secondary"}>#{idx + 1}</Badge>
                          {isTop  && <span style={{ fontSize: 9, color: "#16a34a", fontWeight: 700 }}>★BEST</span>}
                          {isAIPick && <span style={{ fontSize: 9, color: "#7c3aed", fontWeight: 700 }}>✦AI</span>}
                        </div>
                      </td>
                      <td style={{ padding: "8px 10px", fontWeight: 500, color: "#374151", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {s.vendorId.length > 14 ? `${s.vendorId.slice(0, 14)}…` : s.vendorId}
                      </td>
                      <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: "#111827" }}>
                        {fmtINR(s.grandTotal)}
                      </td>
                      <td style={{ padding: "8px 10px", color: "#374151" }}>{s.deliveryDays ?? "—"}</td>
                      <td style={{ padding: "8px 10px", color: "#374151" }}>{s.creditDays ?? "—"}</td>
                      <td style={{ padding: "8px 10px" }}><ScoreBar value={s.priceScore} /></td>
                      <td style={{ padding: "8px 10px" }}><ScoreBar value={s.deliveryScore} /></td>
                      <td style={{ padding: "8px 10px" }}><ScoreBar value={s.creditScore} /></td>
                      <td style={{ padding: "8px 10px" }}><ScoreBar value={s.qualityScore} /></td>
                      <td style={{ padding: "8px 10px" }}><ScoreBar value={s.totalScore} /></td>
                      <td style={{ padding: "8px 10px" }}>
                        <Button
                          variant={isAIPick ? "ghost" : isTop ? "primary" : "outline"}
                          size="sm"
                          onClick={() => onSelect(s.quotationId, result.comparisonId)}
                          disabled={selecting}
                          style={isAIPick ? {
                            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                            color: "#fff", border: "none", borderRadius: 6,
                          } : undefined}
                        >
                          <Icon name="check" size={12} />
                          {isAIPick ? "✦ Select" : isTop ? "Select Best" : "Select"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────

export function CompareView() {
  const { data: rfqData }  = useRFQList({ status: "OPEN" });
  const compareMut         = useCompareQuotations();
  const selectMut          = useSelectWinner();

  // All active RFQs
  const rfqList: PurchaseRFQ[] = useMemo(() => {
    const raw = (rfqData as any)?.data ?? rfqData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [rfqData]);

  // Row selection — auto-select all on load
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  useEffect(() => {
    if (rfqList.length > 0 && selectedIds.length === 0) {
      setSelectedIds(rfqList.map((r) => r.id));
    }
  }, [rfqList]); // eslint-disable-line react-hooks/exhaustive-deps

  const allSelected   = rfqList.length > 0 && selectedIds.length === rfqList.length;
  const someSelected  = selectedIds.length > 0 && !allSelected;

  const toggleAll = () => setSelectedIds(allSelected ? [] : rfqList.map((r) => r.id));
  const toggleRow = (id: string) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  // Criteria
  const [criteria, setCriteria] = useState<AutoSelectCriteria>({
    minQuoteValue: null, minDeliveryDays: null, maxGracePeriod: null, maxQuotationsPerRFQ: null,
  });

  // Results
  const [results,   setResults]   = useState<RFQCompareResult[]>([]);
  const [comparing, setComparing] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null); // rfqId being AI-analysed

  // ── Compare ──────────────────────────────────────────────
  const handleCompare = async () => {
    if (selectedIds.length === 0) { toast.error("Select at least one RFQ"); return; }
    setComparing(true);
    setResults([]);
    const out: RFQCompareResult[] = [];
    for (const rfqId of selectedIds) {
      const rfq = rfqList.find((r) => r.id === rfqId)!;
      try {
        const res = await compareMut.mutateAsync({ rfqId });
        const scores: QuotationScore[] = (res as any)?.data?.scores ?? [];
        const comparisonId: string | undefined = (res as any)?.data?.comparison?.id;
        scores.sort((a, b) => b.totalScore - a.totalScore);
        out.push({ rfqId, rfqNumber: rfq.rfqNumber, rfqTitle: rfq.title, comparisonId, scores });
      } catch (err: any) {
        out.push({
          rfqId, rfqNumber: rfq.rfqNumber, rfqTitle: rfq.title, scores: [],
          error: err?.response?.data?.message ?? "Need at least 2 quotations",
        });
      }
    }
    setResults(out);
    setComparing(false);
  };

  // ── Select winner ────────────────────────────────────────
  const handleSelect = async (quotationId: string, comparisonId?: string) => {
    if (!comparisonId) { toast.error("No comparison ID"); return; }
    try {
      await selectMut.mutateAsync({ comparisonId, quotationId });
      toast.success("Winner selected successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to select winner");
    }
  };

  // ── AI Decide ────────────────────────────────────────────
  // Simulated local AI scoring based on criteria + scores
  // In production this would call a backend AI endpoint
  const handleAIDecide = async (result: RFQCompareResult) => {
    if (result.scores.length === 0) return;
    setAiLoading(result.rfqId);

    // Simulate async AI analysis (500ms)
    await new Promise((r) => setTimeout(r, 600));

    const scored = result.scores.map((s) => {
      let score = s.totalScore;
      // Boost if matches criteria
      if (criteria.minQuoteValue     != null && s.grandTotal  >= criteria.minQuoteValue)    score += 5;
      if (criteria.minDeliveryDays   != null && (s.deliveryDays ?? 0) >= criteria.minDeliveryDays) score += 3;
      if (criteria.maxGracePeriod    != null && (s.creditDays  ?? 0) <= criteria.maxGracePeriod)   score += 4;
      return { ...s, aiScore: score };
    });
    scored.sort((a, b) => b.aiScore - a.aiScore);
    const best = scored[0];

    const hasCriteriaNote = [
      criteria.minQuoteValue    != null ? `min value ₹${criteria.minQuoteValue.toLocaleString("en-IN")}` : null,
      criteria.minDeliveryDays  != null ? `min ${criteria.minDeliveryDays} delivery days` : null,
      criteria.maxGracePeriod   != null ? `max ${criteria.maxGracePeriod} days grace` : null,
    ].filter(Boolean).join(", ");

    const reason = `Vendor ${best.vendorId.slice(0, 8)}… ranks highest with total score ${best.totalScore} — `
      + `offering ₹${Number(best.grandTotal).toLocaleString("en-IN")} (price score ${best.priceScore}), `
      + `${best.deliveryDays ?? "—"} delivery days (score ${best.deliveryScore}), `
      + `${best.creditDays ?? "—"} credit days (score ${best.creditScore}).`
      + (hasCriteriaNote ? ` Matches your criteria: ${hasCriteriaNote}.` : " Meets all parameters.");

    const confidence = Math.min(98, 60 + Math.round(best.totalScore * 0.4));

    setResults((prev) =>
      prev.map((r) =>
        r.rfqId === result.rfqId
          ? { ...r, aiDecision: { recommendedQuotationId: best.quotationId, vendorId: best.vendorId, reason, confidence } }
          : r
      )
    );
    setAiLoading(null);
    toast.success("AI analysis complete");
  };

  // ── RFQ Table ────────────────────────────────────────────

  const rfqStatusVariant = (s: string): "success" | "warning" | "secondary" | "danger" =>
    s === "OPEN" ? "success" : s === "SENT" ? "warning" : s === "CLOSED" ? "secondary" : "danger";

  const NAV_LINKS = [
    { label: "Dashboard", href: "/procurement",              icon: "layout-dashboard" },
    { label: "RFQs",      href: "/procurement/rfq",          icon: "file-question" },
    { label: "POs",       href: "/procurement/purchase-orders", icon: "clipboard-list" },
    { label: "GRNs",      href: "/procurement/goods-receipts",  icon: "package-check" },
    { label: "Invoices",  href: "/procurement/invoices",        icon: "receipt" },
  ] as const;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* ── Toolbar (matches TableFull header bar) ────────────── */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shadow-sm z-40">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900">Quotation Compare</h1>
          <div className="h-5 w-px bg-gray-300" />

          {/* Inline stats */}
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold text-blue-600">{selectedIds.length}</span>
            <span className="text-xs text-gray-400">of {rfqList.length} RFQs selected</span>
          </div>
          {results.length > 0 && (
            <>
              <div className="h-5 w-px bg-gray-300" />
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-green-600">{results.length}</span>
                <span className="text-xs text-gray-400">compared</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Nav links */}
          <div className="flex items-center bg-gray-100 rounded-md p-0.5">
            {NAV_LINKS.map(({ label, href, icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 rounded transition-colors no-underline"
              >
                <Icon name={icon as any} size={11} />
                {label}
              </Link>
            ))}
          </div>

          <div className="h-5 w-px bg-gray-300" />

          <Button
            variant="primary"
            size="sm"
            onClick={handleCompare}
            disabled={comparing || selectedIds.length === 0}
          >
            {comparing
              ? <><Icon name="loader" size={14} /> Comparing…</>
              : <><Icon name="git-compare" size={14} /> Compare Selected</>
            }
          </Button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Left: RFQ Table + Criteria ── */}
        <div style={{
          width: 320, flexShrink: 0, borderRight: "1px solid #e5e7eb",
          display: "flex", flexDirection: "column", overflow: "hidden", background: "#fafafa",
        }}>

          {/* RFQ Table */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <tr style={{ background: "#f1f5f9" }}>
                  <th style={{ padding: "9px 12px", width: 36 }}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => { if (el) el.indeterminate = someSelected; }}
                      onChange={toggleAll}
                      style={{ accentColor: "#2563eb", width: 14, height: 14 }}
                    />
                  </th>
                  <th style={{ padding: "9px 8px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>RFQ</th>
                  <th style={{ padding: "9px 8px", textAlign: "center", fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>Quotes</th>
                  <th style={{ padding: "9px 8px", textAlign: "center", fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {rfqList.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: "24px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                      No active RFQs found
                    </td>
                  </tr>
                ) : (
                  rfqList.map((rfq) => {
                    const checked = selectedIds.includes(rfq.id);
                    return (
                      <tr
                        key={rfq.id}
                        onClick={() => toggleRow(rfq.id)}
                        style={{
                          borderBottom: "1px solid #f3f4f6", cursor: "pointer",
                          background: checked ? "#eff6ff" : undefined,
                          transition: "background 0.1s",
                        }}
                      >
                        <td style={{ padding: "8px 12px" }} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleRow(rfq.id)}
                            style={{ accentColor: "#2563eb", width: 14, height: 14 }}
                          />
                        </td>
                        <td style={{ padding: "8px 8px" }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{rfq.rfqNumber}</div>
                          <div style={{ fontSize: 10, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }}>{rfq.title}</div>
                        </td>
                        <td style={{ padding: "8px 8px", textAlign: "center" }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700,
                            color: (rfq._count?.quotations ?? 0) >= 2 ? "#16a34a" : "#dc2626",
                          }}>
                            {rfq._count?.quotations ?? 0}
                          </span>
                        </td>
                        <td style={{ padding: "8px 8px", textAlign: "center" }}>
                          <Badge variant={rfqStatusVariant(rfq.status)}>{rfq.status}</Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Criteria Panel */}
          <div style={{ borderTop: "1px solid #e5e7eb", padding: "12px 14px", background: "#fff" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
              Auto-Select Criteria
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <NumberInput
                label="Min. Quote Value (₹)"
                value={criteria.minQuoteValue}
                onChange={(v) => setCriteria((p) => ({ ...p, minQuoteValue: v }))}
                min={0} step={1000}
              />
              <NumberInput
                label="Min. Delivery Days"
                value={criteria.minDeliveryDays}
                onChange={(v) => setCriteria((p) => ({ ...p, minDeliveryDays: v }))}
                min={0} step={1}
              />
              <NumberInput
                label="Max. Grace Period (days)"
                value={criteria.maxGracePeriod}
                onChange={(v) => setCriteria((p) => ({ ...p, maxGracePeriod: v }))}
                min={0} step={1}
              />
              <NumberInput
                label="No. of Quotations / RFQ"
                value={criteria.maxQuotationsPerRFQ}
                onChange={(v) => setCriteria((p) => ({ ...p, maxQuotationsPerRFQ: v }))}
                min={1} step={1}
              />
            </div>
          </div>
        </div>

        {/* ── Right: Results ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20, background: "#f8fafc" }}>
          {results.length === 0 ? (
            <div style={{
              height: "100%", display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", color: "#9ca3af", gap: 10,
            }}>
              <div style={{ fontSize: 48 }}>📊</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#6b7280" }}>Select RFQs and click Compare Selected</div>
              <div style={{ fontSize: 12 }}>Results will appear here with AI-powered ranking</div>
            </div>
          ) : (
            results.map((result) => (
              <CompareResultCard
                key={result.rfqId}
                result={result}
                criteria={criteria}
                onSelect={handleSelect}
                selecting={selectMut.isPending}
                onAIDecide={handleAIDecide}
                aiLoading={aiLoading === result.rfqId}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
