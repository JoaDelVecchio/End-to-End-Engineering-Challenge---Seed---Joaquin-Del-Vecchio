import { formatCurrency, formatDate } from "./format";

describe("format utilities", () => {
  it("formats prices as Argentine pesos for es-AR", () => {
    const value = formatCurrency(1200000);

    expect(value).toContain("$");
    expect(value).not.toContain("US$");
    expect(value).toContain("1.200.000");
  });

  it("formats dates in the configured Buenos Aires timezone", () => {
    expect(formatDate("2026-06-06T09:30:00.000Z")).toContain("06:30");
  });
});
