'use client';

import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';

import { Icon } from './Icon';

// ── Types ─────────────────────────────────────────────────

export interface AutocompleteOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface AutocompleteProps {
  /** Dropdown options */
  options?: AutocompleteOption[];
  /** Currently selected value */
  value?: string | number | boolean | null;
  /** Called when a value is selected or cleared */
  onChange?: (value: string | number | boolean | null) => void;
  /** Floating label text (MUI outlined style) */
  label?: string;
  /** Placeholder shown when no value is selected */
  placeholder?: string;
  /** Left icon inside the trigger */
  leftIcon?: React.ReactNode;
  /** Footer content below the select (action links, hints) */
  footer?: React.ReactNode;
  /** Show error border */
  error?: boolean;
  /** Error message displayed below the input */
  errorMessage?: string;
  /** Mark as required (red asterisk on label) */
  required?: boolean;
  /** Disable the input */
  disabled?: boolean;
  /** Show a loading spinner */
  loading?: boolean;
  /** Allow typing to filter options (default: true) */
  searchable?: boolean;
  /** Show clear button (default: true) */
  clearable?: boolean;
}

// ── Component ─────────────────────────────────────────────

export const Autocomplete = forwardRef<HTMLDivElement, AutocompleteProps>(
  (props, ref) => {
    const {
      options = [],
      value,
      onChange,
      label,
      placeholder = 'Select...',
      leftIcon,
      footer,
      error,
      errorMessage,
      required,
      disabled,
      loading,
      searchable = true,
      clearable = true,
    } = props;

    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // ── Derived ─────────────────────────────────────────

    const selectedOption = useMemo(
      () => options.find((o) => String(o.value) === String(value)),
      [options, value],
    );

    const filtered = useMemo(() => {
      if (!search || !searchable) return options;
      const q = search.toLowerCase();
      return options.filter((o) => o.label.toLowerCase().includes(q));
    }, [options, search, searchable]);

    const hasValue = value != null && value !== '';
    const isFloating = isOpen || hasValue || !!placeholder;
    const displayValue = isOpen ? search : selectedOption?.label ?? '';

    // ── Effects ─────────────────────────────────────────

    useEffect(() => {
      setHighlightedIndex(-1);
    }, [filtered]);

    // Click outside → close (check both container and portal dropdown)
    useEffect(() => {
      const handler = (e: MouseEvent) => {
        const target = e.target as Node;
        if (containerRef.current?.contains(target)) return;
        if (listRef.current?.contains(target)) return;
        setIsOpen(false);
        setSearch('');
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Calculate dropdown position when open
    useEffect(() => {
      if (!isOpen || !containerRef.current) {
        setDropdownPos(null);
        return;
      }
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }, [isOpen]);

    // Scroll highlighted into view
    useEffect(() => {
      if (highlightedIndex < 0 || !listRef.current) return;
      const el = listRef.current.children[highlightedIndex] as
        | HTMLElement
        | undefined;
      el?.scrollIntoView({ block: 'nearest' });
    }, [highlightedIndex]);

    // ── Handlers ────────────────────────────────────────

    const handleSelect = useCallback(
      (opt: AutocompleteOption) => {
        onChange?.(opt.value);
        setIsOpen(false);
        setSearch('');
        inputRef.current?.blur();
      },
      [onChange],
    );

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange?.(null);
        setSearch('');
      },
      [onChange],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        switch (e.key) {
          case 'Escape':
            setIsOpen(false);
            setSearch('');
            inputRef.current?.blur();
            break;
          case 'ArrowDown':
            e.preventDefault();
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex((prev) =>
              prev < filtered.length - 1 ? prev + 1 : 0,
            );
            break;
          case 'ArrowUp':
            e.preventDefault();
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex((prev) =>
              prev > 0 ? prev - 1 : filtered.length - 1,
            );
            break;
          case 'Enter':
            e.preventDefault();
            if (
              highlightedIndex >= 0 &&
              filtered[highlightedIndex] &&
              !filtered[highlightedIndex].disabled
            ) {
              handleSelect(filtered[highlightedIndex]);
            }
            break;
        }
      },
      [isOpen, filtered, highlightedIndex, handleSelect],
    );

    // ── Styles ──────────────────────────────────────────

    const triggerCls = [
      'flex items-center gap-1.5 rounded-[var(--radius-md)] border h-8 px-3 transition-all cursor-text',
      'bg-[var(--color-bg)] text-[var(--color-text)]',
      disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : '',
      error
        ? 'border-[var(--color-danger)] focus-within:ring-2 focus-within:ring-[var(--color-danger)]/20'
        : isOpen
          ? 'border-[var(--color-border-focus)] ring-2 ring-[var(--color-border-focus)]/20'
          : 'border-[var(--color-border)] hover:border-gray-400',
    ]
      .filter(Boolean)
      .join(' ');

    const labelCls = label
      ? [
          'absolute bg-white px-1 pointer-events-none transition-all duration-200 truncate max-w-[80%]',
          isFloating
            ? [
                'z-[2] top-0 -translate-y-1/2 text-[11px] left-2',
                error
                  ? 'text-red-500'
                  : isOpen
                    ? 'text-[var(--color-primary)]'
                    : 'text-gray-500',
              ].join(' ')
            : [
                'z-[1] top-1/2 -translate-y-1/2 text-sm text-gray-400',
                leftIcon ? 'left-9' : 'left-3',
              ].join(' '),
        ].join(' ')
      : '';

    // ── Render ──────────────────────────────────────────

    return (
      <div ref={ref}>
        <div ref={containerRef} className="relative">
          {/* Trigger */}
          <div
            className={triggerCls}
            onClick={() => !disabled && inputRef.current?.focus()}
          >
            {leftIcon && (
              <span className="flex-shrink-0 text-gray-400">{leftIcon}</span>
            )}

            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent text-sm outline-none min-w-0 placeholder:text-[var(--color-text-tertiary)]"
              value={displayValue}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              onFocus={() => {
                if (disabled) return;
                setIsOpen(true);
                setSearch('');
              }}
              onKeyDown={handleKeyDown}
              placeholder={!label || isFloating ? placeholder : ''}
              disabled={disabled}
              readOnly={!searchable}
              role="combobox"
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              aria-autocomplete={searchable ? 'list' : 'none'}
              autoComplete="off"
            />

            {/* Clear */}
            {clearable && hasValue && !disabled && !loading && (
              <button
                type="button"
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={handleClear}
                tabIndex={-1}
                aria-label="Clear"
              >
                <Icon name="x" size={14} />
              </button>
            )}

            {/* Loading spinner or chevron */}
            {loading ? (
              <Icon
                name="loader"
                size={14}
                className="flex-shrink-0 text-gray-400 animate-spin"
              />
            ) : (
              <span
                className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              >
                <Icon name="chevron-down" size={14} />
              </span>
            )}
          </div>

          {/* Floating label */}
          {label && (
            <label className={labelCls}>
              {label}
              {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
          )}

          {/* Dropdown — rendered as portal to avoid overflow clipping */}
          {isOpen && !disabled && dropdownPos && typeof document !== 'undefined' &&
            createPortal(
              <div
                ref={listRef}
                className="fixed z-[9999] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] py-1 shadow-lg max-h-[200px] overflow-y-auto"
                style={{
                  top: dropdownPos.top,
                  left: dropdownPos.left,
                  width: dropdownPos.width,
                }}
                role="listbox"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-gray-400">
                    <Icon name="loader" size={16} className="animate-spin" />
                    Loading...
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-gray-400 text-center">
                    No options found
                  </div>
                ) : (
                  filtered.map((opt, idx) => {
                    const isSelected =
                      String(opt.value) === String(value);
                    const isHighlighted = idx === highlightedIndex;
                    return (
                      <button
                        key={String(opt.value)}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={opt.disabled}
                        className={[
                          'flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
                          opt.disabled
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer',
                          isSelected
                            ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium'
                            : isHighlighted
                              ? 'bg-[var(--color-bg-secondary)]'
                              : 'hover:bg-[var(--color-bg-secondary)]',
                        ].join(' ')}
                        onClick={() => !opt.disabled && handleSelect(opt)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                      >
                        {opt.label}
                        {isSelected && (
                          <Icon
                            name="check"
                            size={14}
                            className="ml-auto text-[var(--color-primary)]"
                          />
                        )}
                      </button>
                    );
                  })
                )}
              </div>,
              document.body,
            )}
        </div>

        {/* Error message */}
        {error && errorMessage && (
          <p className="mt-1 text-xs text-red-500">{errorMessage}</p>
        )}

        {/* Footer */}
        {footer}
      </div>
    );
  },
);
Autocomplete.displayName = 'Autocomplete';
