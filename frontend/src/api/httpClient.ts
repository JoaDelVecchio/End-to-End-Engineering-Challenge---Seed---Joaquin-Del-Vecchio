import { ApiError } from "./ApiError";
import { API_BASE_URL } from "./config";

type ApiErrorResponse = {
  error?: {
    code?: unknown;
    message?: unknown;
    details?: unknown;
  };
};

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  const headers = new Headers(init.headers);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "No pudimos conectar con la API.");
  }

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return response.json() as Promise<T>;
}

async function parseApiError(response: Response): Promise<ApiError> {
  let code = "REQUEST_FAILED";
  let message = `No pudimos completar la solicitud. Código ${response.status}.`;
  let details: unknown;

  try {
    const body = (await response.json()) as ApiErrorResponse;

    if (typeof body.error?.code === "string" && typeof body.error?.message === "string") {
      code = body.error.code;
      message = body.error.message;
      details = body.error.details;
    }
  } catch {
    // Keep the generic fallback for non-JSON or unexpected error bodies.
  }

  return new ApiError(response.status, code, message, details);
}
