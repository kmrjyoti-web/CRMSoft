'use client';

import { useState } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { useSubmitErrorReport } from './useErrorReport';
import type { ErrorReportSeverity, SubmitErrorReportInput } from './error-report.service';

const SEVERITY_OPTIONS: { value: ErrorReportSeverity; label: string }[] = [
  { value: 'LOW', label: 'Low — minor inconvenience' },
  { value: 'MEDIUM', label: 'Medium — feature broken' },
  { value: 'HIGH', label: 'High — blocking work' },
  { value: 'CRITICAL', label: 'Critical — data loss / security' },
];

const INITIAL: SubmitErrorReportInput = {
  title: '',
  description: '',
  severity: 'MEDIUM',
  errorCode: '',
  screenshotUrl: '',
};

interface ErrorReportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ErrorReportDrawer({ isOpen, onClose }: ErrorReportDrawerProps) {
  const [form, setForm] = useState<SubmitErrorReportInput>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof SubmitErrorReportInput, string>>>({});
  const { mutate: submit, isPending } = useSubmitErrorReport();

  function handleChange(field: keyof SubmitErrorReportInput, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.title.trim()) next.title = 'Title is required.';
    if (!form.description.trim()) next.description = 'Description is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const payload: SubmitErrorReportInput = {
      title: form.title.trim(),
      description: form.description.trim(),
      severity: form.severity,
      ...(form.errorCode?.trim() ? { errorCode: form.errorCode.trim() } : {}),
      ...(form.screenshotUrl?.trim() ? { screenshotUrl: form.screenshotUrl.trim() } : {}),
    };
    submit(payload, {
      onSuccess: () => {
        setForm(INITIAL);
        setErrors({});
        onClose();
      },
    });
  }

  function handleClose() {
    setForm(INITIAL);
    setErrors({});
    onClose();
  }

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} title="Report an Issue" position="right" size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 0' }}>

        {/* Title */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#374151' }}>
            Title <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Brief summary of the issue"
            style={{
              width: '100%',
              border: `1px solid ${errors.title ? '#ef4444' : '#d1d5db'}`,
              borderRadius: 6,
              padding: '8px 12px',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {errors.title && (
            <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#374151' }}>
            Description <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe what happened, what you expected, and what you were doing when it occurred."
            rows={5}
            style={{
              width: '100%',
              border: `1px solid ${errors.description ? '#ef4444' : '#d1d5db'}`,
              borderRadius: 6,
              padding: '8px 12px',
              fontSize: 14,
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
          {errors.description && (
            <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.description}</p>
          )}
        </div>

        {/* Severity */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#374151' }}>
            Severity <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            value={form.severity}
            onChange={(e) => handleChange('severity', e.target.value)}
            style={{
              width: '100%',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              padding: '8px 12px',
              fontSize: 14,
              outline: 'none',
              background: '#fff',
              boxSizing: 'border-box',
            }}
          >
            {SEVERITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Error Code (optional) */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#374151' }}>
            Error Code <span style={{ fontSize: 12, fontWeight: 400, color: '#9ca3af' }}>(optional)</span>
          </label>
          <input
            type="text"
            value={form.errorCode ?? ''}
            onChange={(e) => handleChange('errorCode', e.target.value)}
            placeholder="e.g. E_CONTACT_001"
            style={{
              width: '100%',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              padding: '8px 12px',
              fontSize: 14,
              fontFamily: 'monospace',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Screenshot URL (optional) */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#374151' }}>
            Screenshot URL <span style={{ fontSize: 12, fontWeight: 400, color: '#9ca3af' }}>(optional)</span>
          </label>
          <input
            type="url"
            value={form.screenshotUrl ?? ''}
            onChange={(e) => handleChange('screenshotUrl', e.target.value)}
            placeholder="https://..."
            style={{
              width: '100%',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              padding: '8px 12px',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isPending}
          style={{
            width: '100%',
            padding: '10px 16px',
            background: isPending ? '#9ca3af' : '#dc2626',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            cursor: isPending ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {isPending ? 'Submitting...' : 'Submit Report'}
        </button>
      </div>
    </Drawer>
  );
}
