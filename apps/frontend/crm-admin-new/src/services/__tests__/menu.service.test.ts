import api from "../api-client";
import { menuService } from "../menu.service";

jest.mock("../api-client", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

// ── Fixtures ────────────────────────────────────────────

const fakeMenuTree = [
  { id: "1", name: "Dashboard", code: "dash", icon: "icon-dash", route: "/dashboard", menuType: "item" },
  { id: "2", name: "Leads", code: "leads", icon: "icon-leads", route: "/leads", menuType: "item" },
];

// Double-wrapped: ResponseMapperInterceptor wraps ApiResponse.success()
const wrappedResponse = {
  data: {
    success: true,
    statusCode: 200,
    message: "OK",
    data: { success: true, message: "OK", data: fakeMenuTree },
    timestamp: "2026-02-28T00:00:00Z",
    path: "/api/v1/menus/my-menu",
    requestId: "req-1",
  },
};

// Single-wrapped: data.data is the array directly
const singleWrappedResponse = {
  data: {
    success: true,
    statusCode: 200,
    message: "OK",
    data: fakeMenuTree,
    timestamp: "2026-02-28T00:00:00Z",
    path: "/api/v1/menus/my-menu",
    requestId: "req-1",
  },
};

// ── Tests ────────────────────────────────────────────────

describe("menuService.getMyMenu", () => {
  it("unwraps double-wrapped response (ResponseMapperInterceptor + ApiResponse)", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce(wrappedResponse);

    const result = await menuService.getMyMenu();

    expect(api.get).toHaveBeenCalledWith("/api/v1/menus/my-menu");
    expect(result).toEqual(fakeMenuTree);
  });

  it("handles single-wrapped response (data.data is the array directly)", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce(singleWrappedResponse);

    const result = await menuService.getMyMenu();

    expect(result).toEqual(fakeMenuTree);
  });
});
