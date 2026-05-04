import api from "../api-client";
import { lookupService } from "../lookup.service";

jest.mock("../api-client", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

// ── Fixtures ────────────────────────────────────────────

const fakeLookups = [
  { id: "lv-1", label: "IT Services", value: "IT_SERVICES", category: "INDUSTRY_TYPE" },
  { id: "lv-2", label: "Manufacturing", value: "MANUFACTURING", category: "INDUSTRY_TYPE" },
];

const wrappedResponse = {
  data: {
    success: true,
    statusCode: 200,
    message: "OK",
    data: fakeLookups,
    timestamp: "2026-02-28T00:00:00Z",
    path: "/api/v1/lookups/values",
    requestId: "req-3",
  },
};

// ── Tests ────────────────────────────────────────────────

describe("lookupService.getValues", () => {
  it("calls GET /api/v1/lookups/values/:masterCode as route param", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce(wrappedResponse);

    const result = await lookupService.getValues("INDUSTRY_TYPE");

    expect(api.get).toHaveBeenCalledWith(
      "/api/v1/lookups/values/INDUSTRY_TYPE",
    );
    expect(result).toEqual(fakeLookups);
  });
});
