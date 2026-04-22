'use client';

import { Input, Icon } from '@/components/ui';

interface Variable {
  key: string;
  sampleValue: string;
}

interface WaTemplateVariableEditorProps {
  body: string;
  variables: Variable[];
  onChange: (variables: Variable[]) => void;
}

export function WaTemplateVariableEditor({ body, variables, onChange }: WaTemplateVariableEditorProps) {
  // Extract variable placeholders from body text like {{1}}, {{2}}
  const matches = body.match(/\{\{(\d+)\}\}/g) ?? [];
  const uniqueKeys = [...new Set(matches.map((m) => m.replace(/[{}]/g, '')))];

  // Sync variables with detected placeholders
  const syncedVars = uniqueKeys.map((key) => {
    const existing = variables.find((v) => v.key === key);
    return existing ?? { key, sampleValue: '' };
  });

  const updateVariable = (key: string, sampleValue: string) => {
    const updated = syncedVars.map((v) => (v.key === key ? { ...v, sampleValue } : v));
    onChange(updated);
  };

  if (uniqueKeys.length === 0) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
        No variables detected. Use {'{{1}}'}, {'{{2}}'}, etc. in the body text.
      </div>
    );
  }

  return (
    <div>
      <label style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 12, display: 'block' }}>
        Variables ({uniqueKeys.length})
      </label>
      {syncedVars.map((v) => (
        <div key={v.key} style={{ marginBottom: 8 }}>
          <Input
            label={`{{${v.key}}} — Sample Value`}
            value={v.sampleValue}
            onChange={(val) => updateVariable(v.key, val)}
            leftIcon={<Icon name="hash" size={16} />}
          />
        </div>
      ))}
    </div>
  );
}
