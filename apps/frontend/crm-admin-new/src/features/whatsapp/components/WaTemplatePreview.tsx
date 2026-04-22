'use client';

import { Icon } from '@/components/ui';

interface WaTemplatePreviewProps {
  headerType?: 'NONE' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  headerContent?: string;
  body?: string;
  footer?: string;
  buttons?: { type: string; text: string; url?: string; phoneNumber?: string }[];
}

export function WaTemplatePreview({
  headerType,
  headerContent,
  body,
  footer,
  buttons,
}: WaTemplatePreviewProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          width: 320,
          border: '1px solid #e5e7eb',
          borderRadius: 24,
          overflow: 'hidden',
          background: '#f0f2f5',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}
      >
        {/* Phone header */}
        <div
          style={{
            background: '#075e54',
            color: '#fff',
            padding: '12px 16px',
            fontSize: 14,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Icon name="message-circle" size={18} color="#fff" />
          Template Preview
        </div>

        {/* Chat area */}
        <div style={{ padding: 16, minHeight: 300 }}>
          {(headerType || body || footer || buttons?.length) ? (
            <div
              style={{
                background: '#fff',
                borderRadius: 8,
                padding: 10,
                maxWidth: '90%',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              {/* Header */}
              {headerType && headerType !== 'NONE' && (
                <div style={{ marginBottom: 8 }}>
                  {headerType === 'TEXT' && (
                    <p style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>
                      {headerContent || 'Header text'}
                    </p>
                  )}
                  {headerType === 'IMAGE' && (
                    <div
                      style={{
                        width: '100%',
                        height: 120,
                        background: '#e2e8f0',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name="image" size={32} color="#94a3b8" />
                    </div>
                  )}
                  {headerType === 'VIDEO' && (
                    <div
                      style={{
                        width: '100%',
                        height: 120,
                        background: '#1e293b',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name="monitor" size={32} color="#fff" />
                    </div>
                  )}
                  {headerType === 'DOCUMENT' && (
                    <div
                      style={{
                        padding: 8,
                        background: '#f1f5f9',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Icon name="file-text" size={18} color="#64748b" />
                      <span style={{ fontSize: 12, color: '#64748b' }}>
                        {headerContent || 'document.pdf'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Body */}
              {body && (
                <p style={{ fontSize: 13, color: '#1e293b', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                  {body}
                </p>
              )}

              {/* Footer */}
              {footer && (
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{footer}</p>
              )}

              {/* Buttons */}
              {buttons && buttons.length > 0 && (
                <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 8, paddingTop: 6 }}>
                  {buttons.map((btn, i) => (
                    <div
                      key={i}
                      style={{
                        textAlign: 'center',
                        padding: '6px 0',
                        fontSize: 13,
                        color: '#2563eb',
                        fontWeight: 500,
                        borderTop: i > 0 ? '1px solid #f1f5f9' : 'none',
                      }}
                    >
                      {btn.text || `Button ${i + 1}`}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#94a3b8', paddingTop: 80, fontSize: 13 }}>
              Fill in the template to see preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
