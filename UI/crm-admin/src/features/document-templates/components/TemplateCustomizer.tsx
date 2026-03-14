"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Icon,
  Button,
  Card,
  Input,
  Switch,
  Badge,
  ColorPicker,
  SelectInput,
} from "@/components/ui";
import { TemplatePreview } from "./TemplatePreview";
import {
  useTemplateDetail,
  useTemplateCustomization,
  useSaveCustomization,
  usePreviewTemplate,
} from "../hooks/useDocumentTemplates";
import type { CustomizeTemplatePayload } from "../types/document-template.types";

interface TemplateCustomizerProps {
  templateId: string;
}

type SettingsSection =
  | "branding"
  | "header"
  | "columns"
  | "footer"
  | "terms"
  | "bank"
  | "paper";

const SECTIONS: { key: SettingsSection; label: string; icon: string }[] = [
  { key: "branding", label: "Branding", icon: "palette" },
  { key: "header", label: "Header Fields", icon: "layout" },
  { key: "columns", label: "Table Columns", icon: "columns" },
  { key: "footer", label: "Footer", icon: "align-left" },
  { key: "terms", label: "Terms & Conditions", icon: "file-text" },
  { key: "bank", label: "Bank Details", icon: "landmark" },
  { key: "paper", label: "Paper Settings", icon: "printer" },
];

const PAPER_SIZES = [
  { value: "A4", label: "A4 (210 x 297 mm)" },
  { value: "LETTER", label: "Letter (8.5 x 11 in)" },
  { value: "LEGAL", label: "Legal (8.5 x 14 in)" },
];

const FONT_OPTIONS = [
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Georgia", label: "Georgia" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
];

// Default customization settings
function getDefaultSettings(): Record<string, unknown> {
  return {
    primaryColor: "#2563eb",
    secondaryColor: "#64748b",
    fontFamily: "Arial",
    fontSize: 12,
    paperSize: "A4",
    orientation: "portrait",
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 15,
    marginRight: 15,
    showLogo: true,
    showCompanyName: true,
    showCompanyAddress: true,
    showCompanyPhone: true,
    showCompanyEmail: true,
    showCompanyGST: true,
    showCustomerName: true,
    showCustomerAddress: true,
    showCustomerPhone: true,
    showCustomerEmail: true,
    showCustomerGST: true,
    showDocNumber: true,
    showDocDate: true,
    showDueDate: true,
    showItemCode: true,
    showItemDescription: true,
    showHSN: true,
    showQuantity: true,
    showUnit: true,
    showRate: true,
    showDiscount: true,
    showTax: true,
    showAmount: true,
    showSubtotal: true,
    showTotalTax: true,
    showGrandTotal: true,
    showSignature: true,
    showFooterNote: true,
    showPageNumbers: true,
  };
}

export function TemplateCustomizer({ templateId }: TemplateCustomizerProps) {
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Data queries
  const { data: templateRes, isLoading: loadingTemplate } = useTemplateDetail(templateId);
  const { data: custRes } = useTemplateCustomization(templateId);

  const template = templateRes?.data;
  const existingCust = custRes?.data;

  // Local form state
  const [settings, setSettings] = useState<Record<string, unknown>>(getDefaultSettings());
  const [customHeader, setCustomHeader] = useState("");
  const [customFooter, setCustomFooter] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [bankDetails, setBankDetails] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");
  const [activeSection, setActiveSection] = useState<SettingsSection>("branding");

  // Preview state
  const [previewHtml, setPreviewHtml] = useState("<p style='padding:40px;color:#888;'>Loading preview...</p>");

  // Mutations
  const saveMutation = useSaveCustomization();
  const previewMutation = usePreviewTemplate();

  // Populate from existing customization
  useEffect(() => {
    if (existingCust) {
      if (existingCust.customSettings) {
        setSettings((prev) => ({ ...prev, ...existingCust.customSettings }));
      }
      setCustomHeader(existingCust.customHeader ?? "");
      setCustomFooter(existingCust.customFooter ?? "");
      setTermsAndConditions(existingCust.termsAndConditions ?? "");
      setBankDetails(existingCust.bankDetails ?? "");
      setLogoUrl(existingCust.logoUrl ?? "");
      setSignatureUrl(existingCust.signatureUrl ?? "");
    }
  }, [existingCust]);

  // Populate from template defaults
  useEffect(() => {
    if (template?.defaultSettings && !existingCust) {
      setSettings((prev) => ({ ...prev, ...template.defaultSettings }));
    }
  }, [template, existingCust]);

  // Debounced preview update
  const refreshPreview = useCallback(() => {
    if (!templateId || !template) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      previewMutation.mutate(
        {
          templateId,
          documentType: template.documentType,
          documentId: "sample",
        },
        {
          onSuccess: (res: unknown) => {
            const r = res as { data?: { html?: string } | string };
            const html = typeof r?.data === "string"
              ? r.data
              : (r?.data as { html?: string })?.html ?? "";
            if (html) setPreviewHtml(html);
          },
        },
      );
    }, 600);
  }, [templateId, template, previewMutation]);

  useEffect(() => {
    refreshPreview();
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, templateId]);

  // Setting helpers
  function updateSetting(key: string, value: unknown) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    const payload: CustomizeTemplatePayload = {
      customSettings: settings,
      customHeader: customHeader || undefined,
      customFooter: customFooter || undefined,
      termsAndConditions: termsAndConditions || undefined,
      bankDetails: bankDetails || undefined,
      logoUrl: logoUrl || undefined,
      signatureUrl: signatureUrl || undefined,
    };
    saveMutation.mutate({ templateId, payload });
  }

  function handleReset() {
    setSettings(getDefaultSettings());
    setCustomHeader("");
    setCustomFooter("");
    setTermsAndConditions("");
    setBankDetails("");
    setLogoUrl("");
    setSignatureUrl("");
  }

  if (loadingTemplate) {
    return (
      <div className="p-6 text-center text-muted">
        <Icon name="loader" size={24} /> Loading template...
      </div>
    );
  }

  if (!template) {
    return (
      <div className="p-6 text-center text-muted">
        <Icon name="alert-circle" size={40} />
        <p className="mt-3">Template not found.</p>
        <Button variant="outline" onClick={() => router.push("/settings/templates")}>
          Back to Templates
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-3">
          <Button variant="ghost" onClick={() => router.push("/settings/templates")}>
            <Icon name="arrow-left" size={18} />
          </Button>
          <div>
            <h4 className="mb-0" style={{ fontWeight: 600 }}>
              {template.name}
            </h4>
            <span className="text-muted" style={{ fontSize: 13 }}>
              Customize template settings and preview changes live
            </span>
          </div>
          <Badge variant="primary">{template.documentType.replace(/_/g, " ")}</Badge>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <Icon name="rotate-ccw" size={14} /> Reset
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saveMutation.isPending}
          >
            <Icon name="save" size={14} />{" "}
            {saveMutation.isPending ? "Saving..." : "Save Customization"}
          </Button>
        </div>
      </div>

      {/* Split pane */}
      <div style={{ display: "flex", gap: 24, minHeight: 700, alignItems: "flex-start" }}>
        {/* LEFT: Settings Panel */}
        <div style={{ width: 380, minWidth: 380, flexShrink: 0 }}>
          {/* Section tabs */}
          <div className="d-flex flex-wrap gap-1 mb-3">
            {SECTIONS.map((sec) => (
              <button
                key={sec.key}
                type="button"
                onClick={() => setActiveSection(sec.key)}
                style={{
                  padding: "6px 12px",
                  border: activeSection === sec.key ? "2px solid var(--primary, #2563eb)" : "1px solid #dee2e6",
                  borderRadius: 6,
                  background: activeSection === sec.key ? "var(--primary-bg, #eff6ff)" : "#fff",
                  color: activeSection === sec.key ? "var(--primary, #2563eb)" : "#495057",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <Icon name={sec.icon as never} size={13} /> {sec.label}
              </button>
            ))}
          </div>

          <Card>
            <div className="p-4" style={{ maxHeight: 620, overflowY: "auto" }}>
              {/* Branding */}
              {activeSection === "branding" && (
                <div className="d-flex flex-column gap-3">
                  <h6 style={{ fontWeight: 600 }}>
                    <Icon name="palette" size={16} /> Branding
                  </h6>
                  <div>
                    <label className="form-label" style={{ fontSize: 13 }}>Primary Color</label>
                    <ColorPicker
                      value={String(settings.primaryColor ?? "#2563eb")}
                      onChange={(v: string) => updateSetting("primaryColor", v)}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 13 }}>Secondary Color</label>
                    <ColorPicker
                      value={String(settings.secondaryColor ?? "#64748b")}
                      onChange={(v: string) => updateSetting("secondaryColor", v)}
                    />
                  </div>
                  <SelectInput
                    label="Font Family"
                    value={String(settings.fontFamily ?? "Arial")}
                    options={FONT_OPTIONS}
                    onChange={(v) => updateSetting("fontFamily", v)}
                  />
                  <Input
                    label="Logo URL"
                    value={logoUrl}
                    onChange={(v) => setLogoUrl(v)}
                    leftIcon={<Icon name="image" size={16} />}
                  />
                  <Input
                    label="Signature URL"
                    value={signatureUrl}
                    onChange={(v) => setSignatureUrl(v)}
                    leftIcon={<Icon name="pen-tool" size={16} />}
                  />
                </div>
              )}

              {/* Header Fields */}
              {activeSection === "header" && (
                <div className="d-flex flex-column gap-3">
                  <h6 style={{ fontWeight: 600 }}>
                    <Icon name="layout" size={16} /> Header Field Visibility
                  </h6>
                  <p className="text-muted" style={{ fontSize: 12, marginTop: -8 }}>
                    Toggle which fields appear in the document header.
                  </p>
                  <SwitchRow label="Company Logo" checked={!!settings.showLogo} onChange={(v) => updateSetting("showLogo", v)} />
                  <SwitchRow label="Company Name" checked={!!settings.showCompanyName} onChange={(v) => updateSetting("showCompanyName", v)} />
                  <SwitchRow label="Company Address" checked={!!settings.showCompanyAddress} onChange={(v) => updateSetting("showCompanyAddress", v)} />
                  <SwitchRow label="Company Phone" checked={!!settings.showCompanyPhone} onChange={(v) => updateSetting("showCompanyPhone", v)} />
                  <SwitchRow label="Company Email" checked={!!settings.showCompanyEmail} onChange={(v) => updateSetting("showCompanyEmail", v)} />
                  <SwitchRow label="Company GSTIN" checked={!!settings.showCompanyGST} onChange={(v) => updateSetting("showCompanyGST", v)} />
                  <hr />
                  <SwitchRow label="Customer Name" checked={!!settings.showCustomerName} onChange={(v) => updateSetting("showCustomerName", v)} />
                  <SwitchRow label="Customer Address" checked={!!settings.showCustomerAddress} onChange={(v) => updateSetting("showCustomerAddress", v)} />
                  <SwitchRow label="Customer Phone" checked={!!settings.showCustomerPhone} onChange={(v) => updateSetting("showCustomerPhone", v)} />
                  <SwitchRow label="Customer Email" checked={!!settings.showCustomerEmail} onChange={(v) => updateSetting("showCustomerEmail", v)} />
                  <SwitchRow label="Customer GSTIN" checked={!!settings.showCustomerGST} onChange={(v) => updateSetting("showCustomerGST", v)} />
                  <hr />
                  <SwitchRow label="Document Number" checked={!!settings.showDocNumber} onChange={(v) => updateSetting("showDocNumber", v)} />
                  <SwitchRow label="Document Date" checked={!!settings.showDocDate} onChange={(v) => updateSetting("showDocDate", v)} />
                  <SwitchRow label="Due Date" checked={!!settings.showDueDate} onChange={(v) => updateSetting("showDueDate", v)} />
                  <div style={{ marginTop: 8 }}>
                    <label className="form-label" style={{ fontSize: 13 }}>Custom Header HTML</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={customHeader}
                      onChange={(e) => setCustomHeader(e.target.value)}
                      placeholder="Optional HTML to inject in header area"
                      style={{ fontSize: 13 }}
                    />
                  </div>
                </div>
              )}

              {/* Table Columns */}
              {activeSection === "columns" && (
                <div className="d-flex flex-column gap-3">
                  <h6 style={{ fontWeight: 600 }}>
                    <Icon name="columns" size={16} /> Table Column Visibility
                  </h6>
                  <SwitchRow label="Item Code" checked={!!settings.showItemCode} onChange={(v) => updateSetting("showItemCode", v)} />
                  <SwitchRow label="Description" checked={!!settings.showItemDescription} onChange={(v) => updateSetting("showItemDescription", v)} />
                  <SwitchRow label="HSN/SAC" checked={!!settings.showHSN} onChange={(v) => updateSetting("showHSN", v)} />
                  <SwitchRow label="Quantity" checked={!!settings.showQuantity} onChange={(v) => updateSetting("showQuantity", v)} />
                  <SwitchRow label="Unit" checked={!!settings.showUnit} onChange={(v) => updateSetting("showUnit", v)} />
                  <SwitchRow label="Rate" checked={!!settings.showRate} onChange={(v) => updateSetting("showRate", v)} />
                  <SwitchRow label="Discount" checked={!!settings.showDiscount} onChange={(v) => updateSetting("showDiscount", v)} />
                  <SwitchRow label="Tax" checked={!!settings.showTax} onChange={(v) => updateSetting("showTax", v)} />
                  <SwitchRow label="Amount" checked={!!settings.showAmount} onChange={(v) => updateSetting("showAmount", v)} />
                  <hr />
                  <SwitchRow label="Subtotal" checked={!!settings.showSubtotal} onChange={(v) => updateSetting("showSubtotal", v)} />
                  <SwitchRow label="Total Tax" checked={!!settings.showTotalTax} onChange={(v) => updateSetting("showTotalTax", v)} />
                  <SwitchRow label="Grand Total" checked={!!settings.showGrandTotal} onChange={(v) => updateSetting("showGrandTotal", v)} />
                </div>
              )}

              {/* Footer */}
              {activeSection === "footer" && (
                <div className="d-flex flex-column gap-3">
                  <h6 style={{ fontWeight: 600 }}>
                    <Icon name="align-left" size={16} /> Footer Settings
                  </h6>
                  <SwitchRow label="Show Signature" checked={!!settings.showSignature} onChange={(v) => updateSetting("showSignature", v)} />
                  <SwitchRow label="Show Footer Note" checked={!!settings.showFooterNote} onChange={(v) => updateSetting("showFooterNote", v)} />
                  <SwitchRow label="Show Page Numbers" checked={!!settings.showPageNumbers} onChange={(v) => updateSetting("showPageNumbers", v)} />
                  <div>
                    <label className="form-label" style={{ fontSize: 13 }}>Custom Footer HTML</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={customFooter}
                      onChange={(e) => setCustomFooter(e.target.value)}
                      placeholder="Optional HTML for footer area"
                      style={{ fontSize: 13 }}
                    />
                  </div>
                </div>
              )}

              {/* Terms & Conditions */}
              {activeSection === "terms" && (
                <div className="d-flex flex-column gap-3">
                  <h6 style={{ fontWeight: 600 }}>
                    <Icon name="file-text" size={16} /> Terms & Conditions
                  </h6>
                  <div>
                    <label className="form-label" style={{ fontSize: 13 }}>Terms & Conditions</label>
                    <textarea
                      className="form-control"
                      rows={10}
                      value={termsAndConditions}
                      onChange={(e) => setTermsAndConditions(e.target.value)}
                      placeholder="Enter terms and conditions to appear at the bottom of the document..."
                      style={{ fontSize: 13 }}
                    />
                  </div>
                </div>
              )}

              {/* Bank Details */}
              {activeSection === "bank" && (
                <div className="d-flex flex-column gap-3">
                  <h6 style={{ fontWeight: 600 }}>
                    <Icon name="landmark" size={16} /> Bank Details
                  </h6>
                  <div>
                    <label className="form-label" style={{ fontSize: 13 }}>Bank Account Details</label>
                    <textarea
                      className="form-control"
                      rows={8}
                      value={bankDetails}
                      onChange={(e) => setBankDetails(e.target.value)}
                      placeholder={"Bank Name: ...\nAccount No: ...\nIFSC Code: ...\nBranch: ..."}
                      style={{ fontSize: 13 }}
                    />
                  </div>
                </div>
              )}

              {/* Paper Settings */}
              {activeSection === "paper" && (
                <div className="d-flex flex-column gap-3">
                  <h6 style={{ fontWeight: 600 }}>
                    <Icon name="printer" size={16} /> Paper Settings
                  </h6>
                  <SelectInput
                    label="Paper Size"
                    value={String(settings.paperSize ?? "A4")}
                    options={PAPER_SIZES}
                    onChange={(v) => updateSetting("paperSize", v)}
                  />
                  <SelectInput
                    label="Orientation"
                    value={String(settings.orientation ?? "portrait")}
                    options={[
                      { value: "portrait", label: "Portrait" },
                      { value: "landscape", label: "Landscape" },
                    ]}
                    onChange={(v) => updateSetting("orientation", v)}
                  />
                  <Input
                    label="Margin Top (mm)"
                    value={String(settings.marginTop ?? 20)}
                    onChange={(v) => updateSetting("marginTop", Number(v) || 0)}
                    leftIcon={<Icon name="arrow-up" size={16} />}
                  />
                  <Input
                    label="Margin Bottom (mm)"
                    value={String(settings.marginBottom ?? 20)}
                    onChange={(v) => updateSetting("marginBottom", Number(v) || 0)}
                    leftIcon={<Icon name="arrow-down" size={16} />}
                  />
                  <Input
                    label="Margin Left (mm)"
                    value={String(settings.marginLeft ?? 15)}
                    onChange={(v) => updateSetting("marginLeft", Number(v) || 0)}
                    leftIcon={<Icon name="arrow-left" size={16} />}
                  />
                  <Input
                    label="Margin Right (mm)"
                    value={String(settings.marginRight ?? 15)}
                    onChange={(v) => updateSetting("marginRight", Number(v) || 0)}
                    leftIcon={<Icon name="arrow-right" size={16} />}
                  />
                  <Input
                    label="Font Size (pt)"
                    value={String(settings.fontSize ?? 12)}
                    onChange={(v) => updateSetting("fontSize", Number(v) || 12)}
                    leftIcon={<Icon name="type" size={16} />}
                  />
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT: Live Preview */}
        <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          <Card>
            <div className="p-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="mb-0" style={{ fontWeight: 600 }}>
                  <Icon name="eye" size={16} /> Live Preview
                </h6>
                <Button variant="ghost" size="sm" onClick={refreshPreview}>
                  <Icon name="refresh-cw" size={14} /> Refresh
                </Button>
              </div>
              <TemplatePreview html={previewHtml} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Helper: Switch Row ──────────────────────────────────────

function SwitchRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="d-flex align-items-center justify-content-between">
      <span style={{ fontSize: 13 }}>{label}</span>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}
