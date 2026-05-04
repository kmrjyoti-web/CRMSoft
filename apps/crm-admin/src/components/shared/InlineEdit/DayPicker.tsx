'use client';

const DAYS = ['MON','TUE','WED','THU','FRI','SAT','SUN'] as const;
const DAY_LABELS: Record<string, string> = {
  MON:'Mon', TUE:'Tue', WED:'Wed', THU:'Thu', FRI:'Fri', SAT:'Sat', SUN:'Sun',
};

interface Props { label: string; value?: string[]; onSave: (v: string[]) => void; }

export function DayPicker({ label, value = [], onSave }: Props) {
  const toggle = (day: string) => {
    const next = value.includes(day) ? value.filter((d) => d !== day) : [...value, day];
    onSave(next);
  };

  return (
    <div>
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', gap: 4 }}>
        {DAYS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => toggle(d)}
            style={{
              width: 36, height: 28, borderRadius: 6, border: '1.5px solid',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              borderColor: value.includes(d) ? '#2563eb' : '#d1d5db',
              background: value.includes(d) ? '#dbeafe' : 'white',
              color: value.includes(d) ? '#2563eb' : '#6b7280',
            }}
          >
            {DAY_LABELS[d]}
          </button>
        ))}
      </div>
    </div>
  );
}
