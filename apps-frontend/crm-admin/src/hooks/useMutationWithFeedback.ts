import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { handleApiError } from "@/lib/api-error-handler";

interface MutationFeedbackOptions<TData> {
  /** Toast shown on success, e.g. "Contact created successfully" */
  successMessage: string;
  /** Query keys to invalidate on success, e.g. ["contacts"] */
  invalidateQueries?: string[];
  /** Redirect after success — string or function receiving response data */
  redirectTo?: string | ((data: TData) => string);
  /** Close a drawer/panel on success */
  closePanel?: () => void;
  /** Refetch callback on success */
  refetch?: () => void;
  /** react-hook-form setError for 422 field-level validation */
  setFieldError?: (field: string, error: { message: string }) => void;
  /** Extra logic on success */
  onSuccessExtra?: (data: TData) => void;
}

/**
 * Wraps useMutation with built-in success toasts, error handling,
 * query invalidation, and optional redirect/panel-close.
 */
export function useMutationWithFeedback<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: MutationFeedbackOptions<TData>,
) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<TData, unknown, TVariables>({
    mutationFn,

    onSuccess: (data: TData) => {
      toast.success(options.successMessage);

      if (options.invalidateQueries) {
        for (const key of options.invalidateQueries) {
          queryClient.invalidateQueries({ queryKey: [key] });
        }
      }

      options.closePanel?.();
      options.refetch?.();

      if (options.redirectTo) {
        const url =
          typeof options.redirectTo === "function"
            ? options.redirectTo(data)
            : options.redirectTo;
        router.push(url);
      }

      options.onSuccessExtra?.(data);
    },

    onError: (error: unknown) => {
      handleApiError(error, {
        setFieldError: options.setFieldError,
      });
    },
  });
}
