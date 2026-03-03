import { renderHook, act } from "@testing-library/react";

import { useBulkOperations } from "../useBulkOperations";

describe("useBulkOperations", () => {
  it("starts idle with zero progress", () => {
    const { result } = renderHook(() => useBulkOperations());
    expect(result.current.isRunning).toBe(false);
    expect(result.current.progress.completed).toBe(0);
    expect(result.current.progress.total).toBe(0);
  });

  it("executes action for each id and returns succeeded list", async () => {
    const { result } = renderHook(() => useBulkOperations());
    const action = jest.fn().mockResolvedValue(undefined);

    let bulkResult!: { succeeded: string[]; failed: string[] };
    await act(async () => {
      bulkResult = await result.current.execute(["a", "b", "c"], action);
    });

    expect(action).toHaveBeenCalledTimes(3);
    expect(bulkResult.succeeded).toEqual(["a", "b", "c"]);
    expect(bulkResult.failed).toEqual([]);
  });

  it("collects failed ids when action throws", async () => {
    const { result } = renderHook(() => useBulkOperations());
    const action = jest.fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValueOnce(undefined);

    let bulkResult!: { succeeded: string[]; failed: string[] };
    await act(async () => {
      bulkResult = await result.current.execute(["a", "b", "c"], action);
    });

    expect(bulkResult.succeeded).toEqual(["a", "c"]);
    expect(bulkResult.failed).toEqual(["b"]);
  });

  it("returns isRunning=false after execution completes", async () => {
    const { result } = renderHook(() => useBulkOperations());
    const action = jest.fn().mockResolvedValue(undefined);

    await act(async () => {
      await result.current.execute(["x"], action);
    });

    expect(result.current.isRunning).toBe(false);
  });

  it("reset clears progress", () => {
    const { result } = renderHook(() => useBulkOperations());
    act(() => result.current.reset());
    expect(result.current.progress).toEqual({ completed: 0, total: 0 });
  });
});
