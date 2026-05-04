'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from '@/components/ui';
import { useSmartSearch, useParameterConfig, parsePattern } from './useSmartSearch';
import { SmartResultTable } from './SmartResultTable';
import { SmartResultCards } from './SmartResultCards';
import { SmartResultList } from './SmartResultList';
import { getDisplayName } from './columns';
import type { SmartAutoCompleteProps, SearchFilter, ViewMode } from './types';

export function SmartAutoComplete({
  entityType,
  onSelect,
  value,
  placeholder,
  defaultView = 'TABLE',
  disabled,
  required,
  label,
  tableColumns,
  allowedParameters,
  onCreateNew,
  multiple,
  className,
}: SmartAutoCompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [activeParam, setActiveParam] = useState('NM');
  const [chainedFilters, setChainedFilters] = useState<SearchFilter[]>([]);
  const [showParamPicker, setShowParamPicker] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<any>(value ?? null);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const parameters = useParameterConfig(entityType, allowedParameters);

  useEffect(() => {
    const def = parameters.find((p: any) => p.isDefault);
    if (def) setActiveParam(def.code);
  }, [parameters]);

  const { data, isLoading } = useSmartSearch(
    entityType,
    chainedFilters,
    activeParam,
    inputValue,
    isOpen && (inputValue.trim().length > 0 || chainedFilters.length > 0),
  );

  const results: any[] = (data as any)?.data?.results ?? (data as any)?.results ?? [];
  const total: number = (data as any)?.data?.total ?? (data as any)?.total ?? 0;

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowParamPicker(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.shiftKey && e.key === ' ') {
      e.preventDefault();
      setShowParamPicker((v) => !v);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((p) => Math.min(p + 1, results.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((p) => Math.max(p - 1, 0));
    }
    if (e.key === 'Enter' && results[highlightIndex]) {
      e.preventDefault();
      handleSelect(results[highlightIndex]);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
      setShowParamPicker(false);
    }
    if (e.key === 'Tab') {
      setIsOpen(false);
      setShowParamPicker(false);
    }
    if (e.key === 'Backspace' && !inputValue && chainedFilters.length > 0) {
      setChainedFilters((p) => p.slice(0, -1));
    }
  };

  const handleParamSelect = useCallback(
    (code: string) => {
      // Chain current input as a filter
      if (inputValue.trim()) {
        setChainedFilters((p) => [
          ...p,
          { parameter: activeParam, value: inputValue.trim(), pattern: parsePattern(inputValue.trim()) },
        ]);
        setInputValue('');
      }
      setActiveParam(code);
      setShowParamPicker(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    },
    [inputValue, activeParam],
  );

  const removeFilter = (index: number) => {
    setChainedFilters((p) => p.filter((_, i) => i !== index));
  };

  const handleSelect = (item: any) => {
    setSelectedItem(item);
    onSelect(item);
    setIsOpen(false);
    setInputValue('');
    setChainedFilters([]);
    setShowParamPicker(false);
  };

  const handleClear = () => {
    setSelectedItem(null);
    setInputValue('');
    setChainedFilters([]);
    setTimeout(() => {
      inputRef.current?.focus();
      setIsOpen(true);
    }, 50);
  };

  const activeParamLabel = parameters.find((p: any) => p.code === activeParam)?.label || activeParam;
  const cleanQuery = inputValue.replace(/^[%=]|%$/g, '');

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }} className={className}>
      {label && (
        <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
        </div>
      )}

      {/* Input area */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '7px 10px',
          borderRadius: 10,
          border: `1.5px solid ${isOpen ? '#2563eb' : '#d1d5db'}`,
          background: disabled ? '#f9fafb' : 'white',
          cursor: disabled ? 'not-allowed' : 'text',
          flexWrap: 'wrap',
          minHeight: 40,
          transition: 'border-color 0.15s',
          boxShadow: isOpen ? '0 0 0 3px rgba(37,99,235,0.1)' : undefined,
        }}
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
            inputRef.current?.focus();
          }
        }}
      >
        {/* Selected chip (single select) */}
        {selectedItem && !multiple && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '2px 8px',
              borderRadius: 20,
              background: '#dbeafe',
              color: '#1d4ed8',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {getDisplayName(selectedItem, entityType)}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                color: '#1d4ed8',
                fontSize: 14,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </span>
        )}

        {/* Chained filter chips */}
        {chainedFilters.map((f, i) => (
          <span
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 7px',
              borderRadius: 20,
              background: '#e0f2fe',
              color: '#0369a1',
              fontSize: 11,
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: '#0369a1', fontWeight: 800 }}>{f.parameter}</span>
            <span style={{ color: '#374151' }}>{f.value}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeFilter(i);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                color: '#6b7280',
                fontSize: 13,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </span>
        ))}

        {/* Active param badge + input */}
        {(!selectedItem || multiple) && (
          <>
            <span
              title="Shift+Space to change"
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: '#2563eb',
                background: '#dbeafe',
                padding: '2px 6px',
                borderRadius: 6,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setShowParamPicker((v) => !v);
              }}
            >
              {activeParam} ▾
            </span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setIsOpen(true);
                setHighlightIndex(0);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              placeholder={
                selectedItem ? '' : placeholder || `Search by ${activeParamLabel}… (Shift+Space to switch)`
              }
              disabled={disabled}
              style={{
                flex: 1,
                minWidth: 120,
                outline: 'none',
                border: 'none',
                background: 'transparent',
                fontSize: 13,
                color: '#111827',
              }}
            />
          </>
        )}

        {/* Right side controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            marginLeft: 'auto',
            flexShrink: 0,
          }}
        >
          {isLoading && (
            <div
              style={{
                width: 13,
                height: 13,
                border: '2px solid #e5e7eb',
                borderTopColor: '#2563eb',
                borderRadius: '50%',
                animation: 'sac-spin 0.7s linear infinite',
              }}
            />
          )}
          {/* View toggle */}
          <div style={{ display: 'flex', gap: 2, borderLeft: '1px solid #e5e7eb', paddingLeft: 6 }}>
            {(['TABLE', 'CARD', 'LIST'] as ViewMode[]).map((v) => (
              <button
                key={v}
                type="button"
                title={v}
                onClick={(e) => {
                  e.stopPropagation();
                  setViewMode(v);
                }}
                style={{
                  padding: '2px 4px',
                  borderRadius: 4,
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === v ? '#dbeafe' : 'transparent',
                  color: viewMode === v ? '#2563eb' : '#9ca3af',
                }}
              >
                <Icon
                  name={v === 'TABLE' ? 'table2' : v === 'CARD' ? 'layout-grid' : 'list'}
                  size={12}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Parameter picker popup */}
      {showParamPicker && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 10000,
            background: 'white',
            borderRadius: 10,
            border: '1.5px solid #e5e7eb',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            padding: 8,
            minWidth: 200,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '2px 8px 6px',
              borderBottom: '1px solid #f3f4f6',
              marginBottom: 4,
            }}
          >
            Filter by parameter
          </div>
          {parameters.map((p: any) => (
            <button
              key={p.code}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleParamSelect(p.code);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 8px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                background: activeParam === p.code ? '#eff6ff' : 'white',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#2563eb',
                  background: '#dbeafe',
                  padding: '1px 6px',
                  borderRadius: 4,
                  minWidth: 30,
                  textAlign: 'center',
                  flexShrink: 0,
                }}
              >
                {p.code}
              </span>
              <span style={{ fontSize: 12, color: '#374151', flex: 1 }}>{p.label}</span>
              {p.isDefault && <span style={{ fontSize: 10, color: '#9ca3af' }}>default</span>}
            </button>
          ))}
          <div
            style={{
              borderTop: '1px solid #f3f4f6',
              marginTop: 6,
              padding: '6px 8px 2px',
              fontSize: 10,
              color: '#9ca3af',
              lineHeight: 1.5,
            }}
          >
            <div>
              <kbd style={{ background: '#f3f4f6', padding: '0 3px', borderRadius: 3 }}>%val</kbd>{' '}
              starts with
            </div>
            <div>
              <kbd style={{ background: '#f3f4f6', padding: '0 3px', borderRadius: 3 }}>val%</kbd>{' '}
              ends with
            </div>
            <div>
              <kbd style={{ background: '#f3f4f6', padding: '0 3px', borderRadius: 3 }}>=val</kbd>{' '}
              exact match
            </div>
          </div>
        </div>
      )}

      {/* Results dropdown */}
      {isOpen && (inputValue.trim() || chainedFilters.length > 0) && !showParamPicker && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 9999,
            background: 'white',
            borderRadius: 12,
            border: '1.5px solid #e5e7eb',
            boxShadow: '0 8px 30px rgba(0,0,0,0.14)',
            overflow: 'hidden',
            maxHeight: 380,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              borderBottom: '1px solid #f3f4f6',
              background: '#fafafa',
            }}
          >
            <span style={{ fontSize: 11, color: '#6b7280' }}>
              {isLoading ? 'Searching…' : `${total} result${total !== 1 ? 's' : ''}`}
            </span>
            {onCreateNew && (
              <button
                type="button"
                onClick={onCreateNew}
                style={{
                  fontSize: 11,
                  color: '#2563eb',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                + Create New
              </button>
            )}
          </div>
          {/* Results */}
          <div style={{ overflowY: 'auto', maxHeight: 320 }}>
            {viewMode === 'TABLE' && (
              <SmartResultTable
                entityType={entityType}
                results={results}
                highlightIndex={highlightIndex}
                onSelect={handleSelect}
                onHover={setHighlightIndex}
                columns={tableColumns}
                query={cleanQuery}
              />
            )}
            {viewMode === 'CARD' && (
              <SmartResultCards
                entityType={entityType}
                results={results}
                highlightIndex={highlightIndex}
                onSelect={handleSelect}
                onHover={setHighlightIndex}
              />
            )}
            {viewMode === 'LIST' && (
              <SmartResultList
                entityType={entityType}
                results={results}
                highlightIndex={highlightIndex}
                onSelect={handleSelect}
                onHover={setHighlightIndex}
              />
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes sac-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
