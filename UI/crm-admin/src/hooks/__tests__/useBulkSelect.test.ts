import { renderHook, act } from "@testing-library/react";

import { useBulkSelect } from "../useBulkSelect";

describe("useBulkSelect", () => {
  it("starts with empty selection", () => {
    const { result } = renderHook(() => useBulkSelect());
    expect(result.current.count).toBe(0);
    expect(result.current.selectedIds.size).toBe(0);
  });

  it("toggles a single id on", () => {
    const { result } = renderHook(() => useBulkSelect());
    act(() => result.current.toggle("abc"));
    expect(result.current.isSelected("abc")).toBe(true);
    expect(result.current.count).toBe(1);
  });

  it("toggles a selected id off", () => {
    const { result } = renderHook(() => useBulkSelect());
    act(() => result.current.toggle("abc"));
    act(() => result.current.toggle("abc"));
    expect(result.current.isSelected("abc")).toBe(false);
    expect(result.current.count).toBe(0);
  });

  it("selectAll replaces selection with all provided ids", () => {
    const { result } = renderHook(() => useBulkSelect());
    act(() => result.current.toggle("x"));
    act(() => result.current.selectAll(["a", "b", "c"]));
    expect(result.current.count).toBe(3);
    expect(result.current.isSelected("a")).toBe(true);
    expect(result.current.isSelected("x")).toBe(false);
  });

  it("clearSelection empties the set", () => {
    const { result } = renderHook(() => useBulkSelect());
    act(() => result.current.selectAll(["a", "b"]));
    act(() => result.current.clearSelection());
    expect(result.current.count).toBe(0);
  });
});
