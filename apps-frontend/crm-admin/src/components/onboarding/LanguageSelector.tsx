'use client';

export type Locale = 'en' | 'hi' | 'mr';

interface Language {
  code: Locale;
  native: string;
  english: string;
  script: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', native: 'English', english: 'English', script: 'Latin' },
  { code: 'hi', native: 'हिंदी', english: 'Hindi', script: 'Devanagari' },
  { code: 'mr', native: 'मराठी', english: 'Marathi', script: 'Devanagari' },
];

interface LanguageSelectorProps {
  value: Locale;
  onChange: (locale: Locale) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {LANGUAGES.map((lang) => {
        const selected = value === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => onChange(lang.code)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderRadius: 12,
              border: selected
                ? '2px solid var(--brand-primary, #b8894a)'
                : '2px solid rgba(255,255,255,0.1)',
              background: selected
                ? 'var(--brand-primary-soft, rgba(184,137,74,0.12))'
                : 'rgba(255,255,255,0.04)',
              cursor: 'pointer',
              transition: 'all 200ms ease',
              textAlign: 'left',
              width: '100%',
            }}
            onMouseEnter={(e) => {
              if (!selected) {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
              }
            }}
            onMouseLeave={(e) => {
              if (!selected) {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              }
            }}
            aria-pressed={selected}
            type="button"
          >
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: selected
                    ? 'var(--brand-primary, #b8894a)'
                    : 'var(--brand-text, #f1f5f9)',
                  marginBottom: 2,
                  fontFamily: lang.code === 'en' ? 'var(--font-sans)' : 'system-ui, sans-serif',
                }}
              >
                {lang.native}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--brand-muted, #94a3b8)',
                }}
              >
                {lang.english}
              </div>
            </div>

            {/* Selection indicator */}
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: selected
                  ? '2px solid var(--brand-primary, #b8894a)'
                  : '2px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 200ms ease',
              }}
            >
              {selected && (
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: 'var(--brand-primary, #b8894a)',
                  }}
                />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
