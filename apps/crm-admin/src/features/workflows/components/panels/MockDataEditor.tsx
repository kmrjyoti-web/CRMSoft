'use client';

import { useState, useCallback, useEffect } from 'react';

import { Icon, Button } from '@/components/ui';

// ── Props ───────────────────────────────────────────────

export interface MockDataEditorProps {
  value: string;
  onChange: (value: string) => void;
  entityType: string;
  onRandomize: () => void;
}

// ── Styles ──────────────────────────────────────────────

const CONTAINER_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  height: '100%',
};

const HEADER_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '4px 0',
};

const LABEL_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
};

const TEXTAREA_STYLE: React.CSSProperties = {
  flex: 1,
  minHeight: 280,
  padding: 12,
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
  fontSize: 12,
  lineHeight: 1.6,
  backgroundColor: '#1e1e2e',
  color: '#cdd6f4',
  border: '1px solid #313244',
  borderRadius: 8,
  resize: 'vertical',
  outline: 'none',
  tabSize: 2,
};

const TEXTAREA_ERROR_STYLE: React.CSSProperties = {
  ...TEXTAREA_STYLE,
  border: '1px solid #ef4444',
  boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.15)',
};

const STATUS_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 11,
  padding: '4px 0',
};

// ── Component ──────────────────────────────────────────

export function MockDataEditor({ value, onChange, entityType, onRandomize }: MockDataEditorProps) {
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Validate JSON on value change
  useEffect(() => {
    try {
      JSON.parse(value);
      setIsValid(true);
      setErrorMessage('');
    } catch (err) {
      setIsValid(false);
      setErrorMessage(err instanceof Error ? err.message : 'Invalid JSON');
    }
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  const handleFormat = useCallback(() => {
    try {
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed, null, 2));
    } catch {
      // Cannot format invalid JSON — do nothing
    }
  }, [value, onChange]);

  const entityLabel = entityType
    ? entityType.charAt(0).toUpperCase() + entityType.slice(1)
    : 'Entity';

  return (
    <div style={CONTAINER_STYLE}>
      {/* Header */}
      <div style={HEADER_STYLE}>
        <div style={LABEL_STYLE}>
          <Icon name="database" size={14} color="#6b7280" />
          <span>{entityLabel} Data</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Button variant="outline" size="sm" onClick={handleFormat} disabled={!isValid}>
            <Icon name="code" size={14} />
            <span style={{ marginLeft: 4 }}>Format</span>
          </Button>
          <Button variant="outline" size="sm" onClick={onRandomize}>
            <Icon name="refresh" size={14} />
            <span style={{ marginLeft: 4 }}>Randomize</span>
          </Button>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={handleChange}
        style={isValid ? TEXTAREA_STYLE : TEXTAREA_ERROR_STYLE}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        placeholder={`{\n  "id": "...",\n  "name": "..."\n}`}
      />

      {/* Validation Status */}
      <div style={STATUS_STYLE}>
        {isValid ? (
          <>
            <Icon name="check-circle" size={12} color="#22c55e" />
            <span style={{ color: '#22c55e' }}>Valid JSON</span>
          </>
        ) : (
          <>
            <Icon name="x-circle" size={12} color="#ef4444" />
            <span style={{ color: '#ef4444' }}>{errorMessage}</span>
          </>
        )}
      </div>
    </div>
  );
}
