import { useState, useCallback } from "react";

export interface BulkResult {
  succeeded: string[];
  failed: string[];
}

export interface BulkProgress {
  completed: number;
  total: number;
}

export interface UseBulkOperationsReturn {
  execute: (
    ids: string[],
    action: (id: string) => Promise<unknown>,
  ) => Promise<BulkResult>;
  isRunning: boolean;
  progress: BulkProgress;
  reset: () => void;
}

export function useBulkOperations(): UseBulkOperationsReturn {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<BulkProgress>({ completed: 0, total: 0 });

  const reset = useCallback(() => {
    setProgress({ completed: 0, total: 0 });
  }, []);

  const execute = useCallback(
    async (
      ids: string[],
      action: (id: string) => Promise<unknown>,
    ): Promise<BulkResult> => {
      const result: BulkResult = { succeeded: [], failed: [] };
      setIsRunning(true);
      setProgress({ completed: 0, total: ids.length });

      for (const id of ids) {
        try {
          await action(id);
          result.succeeded.push(id);
        } catch {
          result.failed.push(id);
        }
        setProgress((prev) => ({ ...prev, completed: prev.completed + 1 }));
      }

      setIsRunning(false);
      return result;
    },
    [],
  );

  return { execute, isRunning, progress, reset };
}
