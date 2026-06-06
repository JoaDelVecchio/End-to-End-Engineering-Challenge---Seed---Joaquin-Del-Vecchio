const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init.headers
      }
    });
  } catch {
    throw new Error("No pudimos conectar con la API.");
  }

  if (!response.ok) {
    throw new Error(`No pudimos completar la solicitud. Código ${response.status}.`);
  }

  return response.json() as Promise<T>;
}
