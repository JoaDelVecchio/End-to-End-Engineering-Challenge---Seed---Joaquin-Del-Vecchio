import { listOrdersQuerySchema } from "../schemas/orderSchemas";
import { normalizeDateBoundary } from "./dateQuery";

describe("date query validation", () => {
  it("normalizes date-only boundaries for browser date inputs", () => {
    expect(normalizeDateBoundary("2026-06-05", "from")).toBe("2026-06-05T00:00:00.000Z");
    expect(normalizeDateBoundary("2026-06-05", "to")).toBe("2026-06-05T23:59:59.999Z");
  });

  it("keeps valid ISO datetimes untouched", () => {
    expect(normalizeDateBoundary("2026-06-05T12:30:00.000Z", "from")).toBe("2026-06-05T12:30:00.000Z");
  });

  it("rejects invalid dates in order query schemas", () => {
    const result = listOrdersQuerySchema.safeParse({ from: "not-a-date" });

    expect(result.success).toBe(false);
  });
});
