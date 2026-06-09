import { DEFAULT_ALLOWED_ORIGINS, readCsv, readServerConfig } from "./env";

describe("server config", () => {
  it("uses safe defaults for local development", () => {
    expect(readServerConfig({})).toEqual({
      port: 8080,
      allowedOrigins: DEFAULT_ALLOWED_ORIGINS
    });
  });

  it("parses comma-separated frontend origins", () => {
    expect(readCsv(" http://localhost:3000, https://example.com ")).toEqual([
      "http://localhost:3000",
      "https://example.com"
    ]);
  });

  it("rejects invalid ports and origins", () => {
    expect(() => readServerConfig({ PORT: "abc" })).toThrow("Invalid PORT");
    expect(() => readServerConfig({ CLIENT_ORIGINS: "notaurl" })).toThrow("Invalid CLIENT_ORIGINS");
  });
});
