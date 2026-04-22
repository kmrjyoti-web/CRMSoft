/**
 * React AICTagsInput component.
 * Tag chips with Enter to add, X to remove, autocomplete suggestions.
 * Source: Angular tags-input.component.ts
 */

import React, { useCallback, useRef, useState } from "react";
import {
  cn,
  addTag,
  removeTag,
  removeLastTag,
  filterSuggestions,
} from "@coreui/ui";

export interface TagsInputProps {
  value?: string[];
  defaultValue?: string[];
  placeholder?: string;
  maxTags?: number;
  minLength?: number;
  maxLength?: number;
  suggestions?: string[];
  disabled?: boolean;
  label?: string;
  className?: string;
  onChange?: (tags: string[]) => void;
}

export const AICTagsInput = React.forwardRef<HTMLDivElement, TagsInputProps>(
  (props, ref) => {
    const {
      value: controlledValue,
      defaultValue = [],
      placeholder = "Type and press Enter",
      maxTags,
      minLength,
      maxLength,
      suggestions = [],
      disabled = false,
      label,
      className,
      onChange,
    } = props;

    const isControlled = controlledValue !== undefined;
    const [internalTags, setInternalTags] = useState(defaultValue);
    const tags = isControlled ? controlledValue : internalTags;

    const [inputValue, setInputValue] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredSuggestions = filterSuggestions(suggestions, inputValue, tags);

    const commitTags = useCallback(
      (newTags: string[]) => {
        if (!isControlled) setInternalTags(newTags);
        onChange?.(newTags);
      },
      [isControlled, onChange],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const newTags = addTag(tags, inputValue, maxTags, minLength, maxLength);
          if (newTags !== tags) {
            commitTags(newTags);
            setInputValue("");
          }
        } else if (e.key === "Backspace" && inputValue === "") {
          const newTags = removeLastTag(tags);
          if (newTags !== tags) {
            commitTags(newTags);
          }
        }
      },
      [tags, inputValue, maxTags, minLength, maxLength, commitTags],
    );

    const handleRemove = useCallback(
      (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        commitTags(removeTag(tags, index));
      },
      [tags, commitTags],
    );

    const handleSuggestionClick = useCallback(
      (suggestion: string) => {
        const newTags = addTag(tags, suggestion, maxTags, minLength, maxLength);
        if (newTags !== tags) {
          commitTags(newTags);
          setInputValue("");
        }
        setShowSuggestions(false);
        inputRef.current?.focus();
      },
      [tags, maxTags, minLength, maxLength, commitTags],
    );

    return (
      <div className={cn("relative", className)} ref={ref} data-testid="tags-input">
        {label && (
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            {label}
          </label>
        )}

        <div
          className={cn(
            "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]",
            "focus-within:border-[var(--color-border-focus)] focus-within:ring-1 focus-within:ring-[var(--color-border-focus)]",
            "flex flex-wrap gap-2 items-center px-2 py-1.5 min-h-[3rem] transition-all cursor-text",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          onClick={() => inputRef.current?.focus()}
          data-testid="tags-container"
        >
          {/* Tag chips */}
          {tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="inline-flex items-center gap-1 py-0.5 px-2 rounded-md font-medium bg-blue-50 text-blue-700 border border-blue-100 text-sm"
              data-testid={`tag-${index}`}
            >
              {tag}
              <button
                type="button"
                onClick={(e) => handleRemove(index, e)}
                disabled={disabled}
                className="hover:text-blue-900 focus:outline-none rounded-full p-0.5 hover:bg-blue-200 transition-colors"
                data-testid={`tag-remove-${index}`}
                aria-label={`Remove ${tag}`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}

          {/* AICInput */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={tags.length === 0 ? placeholder : ""}
            disabled={disabled}
            className="flex-1 outline-none border-none bg-transparent min-w-[120px] p-0 text-sm"
            style={{ height: "auto", boxShadow: "none" }}
            data-testid="tags-input-field"
          />
        </div>

        <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
          Press <strong>Enter</strong> to add a tag.
        </p>

        {/* AICAutocomplete suggestions */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div
            className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto"
            data-testid="tags-suggestions"
          >
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                onMouseDown={() => handleSuggestionClick(suggestion)}
                data-testid={`tags-suggestion-${suggestion}`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  },
);

AICTagsInput.displayName = "AICTagsInput";
