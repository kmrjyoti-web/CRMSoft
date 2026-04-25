"use client";

import { useState, useRef, useCallback } from "react";

import { ConfirmDialog } from "@/components/ui";

interface ConfirmOptions {
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "danger";
  confirmText?: string;
  cancelText?: string;
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: "",
    message: "",
  });
  const resolverRef = useRef<(value: boolean) => void>();

  const confirm = useCallback(
    (opts: ConfirmOptions): Promise<boolean> =>
      new Promise((resolve) => {
        resolverRef.current = resolve;
        setOptions(opts);
        setIsOpen(true);
      }),
    [],
  );

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    resolverRef.current?.(true);
  }, []);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    resolverRef.current?.(false);
  }, []);

  function ConfirmDialogPortal() {
    return (
      <ConfirmDialog
        isOpen={isOpen}
        title={options.title}
        message={options.message}
        type={options.type}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
  }

  return { confirm, ConfirmDialogPortal };
}
