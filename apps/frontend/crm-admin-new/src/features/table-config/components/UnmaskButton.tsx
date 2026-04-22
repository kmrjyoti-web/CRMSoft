"use client";

import { useState, useCallback } from "react";

import { Button, Icon } from "@/components/ui";

interface UnmaskButtonProps {
  tableKey: string;
  columnId: string;
  recordId: string;
  onUnmask: (recordId: string, columnId: string) => Promise<string | null>;
  onValueRevealed?: (value: string | null) => void;
}

export function UnmaskButton({
  tableKey,
  columnId,
  recordId,
  onUnmask,
  onValueRevealed,
}: UnmaskButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      setLoading(true);
      try {
        const value = await onUnmask(recordId, columnId);
        onValueRevealed?.(value);
      } finally {
        setLoading(false);
      }
    },
    [recordId, columnId, onUnmask, onValueRevealed],
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center justify-center w-5 h-5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
      title="Unmask value"
    >
      {loading ? (
        <Icon name="loader" size={12} className="animate-spin" />
      ) : (
        <Icon name="eye" size={12} />
      )}
    </button>
  );
}
