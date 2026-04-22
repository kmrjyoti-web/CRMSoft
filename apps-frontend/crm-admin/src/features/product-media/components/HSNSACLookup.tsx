'use client';

import { useState, useEffect, useRef } from 'react';

import { Icon, Input, Card, Badge } from '@/components/ui';

import { useHSNSearch } from '../hooks/useProductMedia';
import type { HSNCode } from '../types/product-media.types';

// ── Props ─────────────────────────────────────────────────────────────

interface HSNSACLookupProps {
  onSelect: (code: HSNCode) => void;
  value?: string;
}

// ── Component ─────────────────────────────────────────────────────────

export function HSNSACLookup({ onSelect, value }: HSNSACLookupProps) {
  const [query, setQuery] = useState(value ?? '');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<HSNCode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const { data, isLoading } = useHSNSearch(debouncedQuery);
  const results: HSNCode[] = (data as any)?.data ?? [];

  // ── Debounce ──────────────────────────────────────────────────────

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // ── Click outside ─────────────────────────────────────────────────

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Sync external value ───────────────────────────────────────────

  useEffect(() => {
    if (value !== undefined && value !== query) {
      setQuery(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // ── Handlers ──────────────────────────────────────────────────────

  function handleSelect(code: HSNCode) {
    setSelectedCode(code);
    setQuery(code.code);
    setIsOpen(false);
    onSelect(code);
  }

  function handleInputChange(v: string) {
    setQuery(v);
    setIsOpen(true);
    if (!v) {
      setSelectedCode(null);
    }
  }

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Search Input */}
      <Input
        label="HSN/SAC Code"
        leftIcon={<Icon name="search" size={16} />}
        value={query}
        onChange={handleInputChange}
        onFocus={() => {
          if (query.length >= 2) setIsOpen(true);
        }}
      />

      {/* Dropdown */}
      {isOpen && query.length >= 2 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 50,
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            marginTop: 4,
            maxHeight: 280,
            overflowY: 'auto',
          }}
        >
          {isLoading ? (
            <div style={{ padding: 16, textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
              <Icon name="loader" size={16} />
              <span style={{ marginLeft: 8 }}>Searching...</span>
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: 16, textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
              No matching HSN/SAC codes found.
            </div>
          ) : (
            results.map((code) => (
              <div
                key={code.code}
                onClick={() => handleSelect(code)}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f3f4f6',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, fontFamily: 'monospace' }}>{code.code}</span>
                  <Badge variant="primary">{code.gstRate}% GST</Badge>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{code.description}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                  Category: {code.category}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Selected Code Display */}
      {selectedCode && (
        <Card style={{ padding: 14, marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="check-circle" size={16} />
              <span style={{ fontSize: 14, fontWeight: 600, fontFamily: 'monospace' }}>{selectedCode.code}</span>
            </div>
            <Badge variant="primary">{selectedCode.gstRate}% GST</Badge>
          </div>
          <div style={{ fontSize: 13, color: '#374151', marginBottom: 8 }}>{selectedCode.description}</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <div style={{ padding: '6px 10px', backgroundColor: '#f0fdf4', borderRadius: 4, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 500 }}>CGST</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedCode.cgstRate}%</div>
            </div>
            <div style={{ padding: '6px 10px', backgroundColor: '#eff6ff', borderRadius: 4, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 500 }}>SGST</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedCode.sgstRate}%</div>
            </div>
            <div style={{ padding: '6px 10px', backgroundColor: '#fef3c7', borderRadius: 4, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 500 }}>IGST</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedCode.igstRate}%</div>
            </div>
          </div>

          {selectedCode.cess != null && selectedCode.cess > 0 && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
              Cess: {selectedCode.cess}%
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
