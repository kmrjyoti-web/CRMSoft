"use client";

import { useState, useMemo } from "react";
import { Button, Modal, Input, SelectInput, Icon } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useAIQuestions, useGenerateQuotation } from "../hooks/useQuotationAI";
import type { AIGeneratedQuotation } from "../types/quotation-ai.types";
import { formatCurrency } from "@/lib/format-currency";

// ── Types ─────────────────────────────────────────────

interface AIGenerateModalProps {
  open: boolean;
  onClose: () => void;
  leadId: string;
}

// ── Helpers ───────────────────────────────────────────


// ── Component ─────────────────────────────────────────

export function AIGenerateModal({ open, onClose, leadId }: AIGenerateModalProps) {
  const { data: questionsData, isLoading: questionsLoading } = useAIQuestions(leadId);
  const generateMutation = useGenerateQuotation();

  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [generated, setGenerated] = useState<AIGeneratedQuotation | null>(null);

  const questions = useMemo(() => {
    const raw = questionsData as any;
    return Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  }, [questionsData]);

  const handleAnswerChange = (id: string, value: string | number) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleGenerate = () => {
    generateMutation.mutate(
      { leadId, answers },
      {
        onSuccess: (data) => {
          setGenerated(data as AIGeneratedQuotation);
        },
      },
    );
  };

  const handleApply = () => {
    // Dispatch generated items back (consumer handles via onClose callback or event)
    onClose();
  };

  const handleReset = () => {
    setGenerated(null);
    setAnswers({});
  };

  // Check if all required questions are answered
  const allRequiredAnswered = questions.every(
    (q: any) => !q.required || (answers[q.id] !== undefined && answers[q.id] !== ""),
  );

  return (
    <Modal open={open} onClose={onClose} title="AI Quotation Generator" size="lg">
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* ── Step 1: Questions Form ───────────────────── */}
        {!generated && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Icon name="brain" size={18} color="#7c3aed" />
              <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
                Answer the following questions to generate an AI-powered quotation.
              </p>
            </div>

            {questionsLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
                <LoadingSpinner />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {questions.map((q: any) => (
                  <div key={q.id}>
                    {q.type === "SELECT" && q.options ? (
                      <SelectInput
                        label={`${q.question}${q.required ? " *" : ""}`}
                        value={answers[q.id] as string ?? ""}
                        onChange={(val) => handleAnswerChange(q.id, val as string)}
                        options={q.options.map((opt: string) => ({ label: opt, value: opt }))}
                        leftIcon={<Icon name="list" size={16} />}
                      />
                    ) : q.type === "NUMBER" ? (
                      <Input
                        label={`${q.question}${q.required ? " *" : ""}`}
                        type="number"
                        value={String(answers[q.id] ?? "")}
                        onChange={(val) => handleAnswerChange(q.id, Number(val) || 0)}
                        leftIcon={<Icon name="hash" size={16} />}
                      />
                    ) : (
                      <Input
                        label={`${q.question}${q.required ? " *" : ""}`}
                        value={String(answers[q.id] ?? "")}
                        onChange={(val) => handleAnswerChange(q.id, val)}
                        leftIcon={<Icon name="message-square" size={16} />}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── Generate Button ──────────────────────── */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleGenerate}
                disabled={!allRequiredAnswered || generateMutation.isPending}
              >
                {generateMutation.isPending ? (
                  <>
                    <LoadingSpinner /> Generating...
                  </>
                ) : (
                  <>
                    <Icon name="sparkles" size={16} /> Generate Quotation
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {/* ── Step 2: Generated Items Table ────────────── */}
        {generated && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="check-circle" size={18} color="#16a34a" />
              <h4 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>
                Generated Quotation
              </h4>
            </div>

            {/* Notes */}
            {generated.notes && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 6,
                  backgroundColor: "#f0f9ff",
                  border: "1px solid #bae6fd",
                  fontSize: 13,
                  color: "#0c4a6e",
                }}
              >
                <Icon name="info" size={14} /> {generated.notes}
              </div>
            )}

            {/* Items table */}
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                    <th style={{ padding: "10px 12px", textAlign: "left", color: "#64748b", fontWeight: 600 }}>
                      Product
                    </th>
                    <th style={{ padding: "10px 12px", textAlign: "right", color: "#64748b", fontWeight: 600 }}>
                      Qty
                    </th>
                    <th style={{ padding: "10px 12px", textAlign: "right", color: "#64748b", fontWeight: 600 }}>
                      Unit Price
                    </th>
                    <th style={{ padding: "10px 12px", textAlign: "right", color: "#64748b", fontWeight: 600 }}>
                      Discount
                    </th>
                    <th style={{ padding: "10px 12px", textAlign: "right", color: "#64748b", fontWeight: 600 }}>
                      Total
                    </th>
                    <th style={{ padding: "10px 12px", textAlign: "left", color: "#64748b", fontWeight: 600 }}>
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {generated.items.map((item, idx) => {
                    const lineTotal = item.quantity * item.unitPrice * (1 - item.discount / 100);
                    return (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: "1px solid #e2e8f0",
                          backgroundColor: idx % 2 === 0 ? "#fff" : "#fafafa",
                        }}
                      >
                        <td style={{ padding: "10px 12px", color: "#1e293b", fontWeight: 500 }}>
                          {item.productName}
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: "#334155" }}>
                          {item.quantity}
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: "#334155" }}>
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: "#f59e0b", fontWeight: 500 }}>
                          {item.discount}%
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: "#1e293b", fontWeight: 600 }}>
                          {formatCurrency(lineTotal)}
                        </td>
                        <td style={{ padding: "10px 12px", color: "#64748b", maxWidth: 200 }}>
                          {item.reason}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                borderRadius: 8,
                backgroundColor: "#f1f5f9",
                border: "1px solid #e2e8f0",
              }}
            >
              <div>
                <span style={{ fontSize: 13, color: "#64748b" }}>Suggested Discount: </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#f59e0b" }}>
                  {generated.suggestedDiscount}%
                </span>
              </div>
              <div>
                <span style={{ fontSize: 13, color: "#64748b" }}>Total Amount: </span>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#1e293b" }}>
                  {formatCurrency(generated.totalAmount)}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <Button variant="outline" onClick={handleReset}>
                <Icon name="rotate-ccw" size={14} /> Regenerate
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleApply}>
                <Icon name="check" size={16} /> Apply
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
