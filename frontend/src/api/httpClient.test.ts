import { ApiError } from "./ApiError";

jest.mock("./config", () => ({
  API_BASE_URL: "/api"
}));

import { request } from "./httpClient";

const fetchMock = jest.fn();

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

describe("httpClient", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as typeof fetch;
  });

  it("returns JSON responses and does not send JSON content type for GET requests", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

    await expect(request<{ ok: boolean }>("/health")).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledWith("/api/health", expect.any(Object));
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(new Headers(init.headers).has("Content-Type")).toBe(false);
  });

  it("sets JSON content type when a request body is present", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ saved: true }));

    await request("/questions/q-1/replies", {
      method: "POST",
      body: JSON.stringify({ body: "Respuesta" })
    });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(new Headers(init.headers).get("Content-Type")).toBe("application/json");
  });

  it("throws ApiError with structured backend error data", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        {
          error: {
            code: "INVALID_ORDER_TRANSITION",
            message: "Invalid order status transition"
          }
        },
        409
      )
    );

    await expect(request("/orders/ord-1/status")).rejects.toMatchObject({
      status: 409,
      code: "INVALID_ORDER_TRANSITION",
      message: "Invalid order status transition"
    });
  });

  it("falls back for unknown error bodies", async () => {
    fetchMock.mockResolvedValue(new Response("not json", { status: 500 }));

    await expect(request("/broken")).rejects.toMatchObject({
      status: 500,
      code: "REQUEST_FAILED",
      message: "No pudimos completar la solicitud. Código 500."
    });
  });

  it("throws a network ApiError when fetch fails", async () => {
    fetchMock.mockRejectedValue(new Error("ECONNREFUSED"));

    await expect(request("/health")).rejects.toBeInstanceOf(ApiError);
    await expect(request("/health")).rejects.toMatchObject({
      status: 0,
      code: "NETWORK_ERROR",
      message: "No pudimos conectar con la API."
    });
  });
});
