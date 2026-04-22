"use client";

import { useQuery } from "@tanstack/react-query";
import { Input, SelectInput, Switch } from "@/components/ui";
import api from "@/services/api-client";

interface ExtraField {
  field: string;
  label: string;
  type: 'string' | 'number' | 'select' | 'boolean' | 'date' | 'tags' | 'textarea';
  options?: string[];
  required?: boolean;
}

interface IndustryFieldsProps {
  entity: string;  // "product", "lead", "contact"
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
}

export function IndustryFields({ entity, values, onChange }: IndustryFieldsProps) {
  const { data: fields } = useQuery<ExtraField[]>({
    queryKey: ['industry', 'extra-fields', entity],
    queryFn: async () => {
      const r = await api.get(`/api/v1/business-types/extra-fields/${entity}`);
      const outer = r?.data?.data;
      return (outer?.data ?? outer) || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (!fields?.length) return null;

  return (
    <div className="space-y-3">
      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Industry-Specific Fields
      </p>
      {fields.map((f) => {
        const val = values[f.field] ?? '';

        switch (f.type) {
          case 'select':
            return (
              <SelectInput
                key={f.field}
                label={f.label}
                value={val}
                onChange={(v) => onChange(f.field, v)}
                options={(f.options || []).map(o => ({ label: o, value: o }))}
              />
            );
          case 'boolean':
            return (
              <Switch
                key={f.field}
                label={f.label}
                checked={!!val}
                onChange={(checked) => onChange(f.field, checked)}
              />
            );
          case 'number':
            return (
              <Input
                key={f.field}
                label={f.label}
                type="number"
                value={val?.toString() ?? ''}
                onChange={(v) => onChange(f.field, v ? Number(v) : null)}
              />
            );
          default:
            return (
              <Input
                key={f.field}
                label={f.label}
                value={val}
                onChange={(v) => onChange(f.field, v)}
              />
            );
        }
      })}
    </div>
  );
}
