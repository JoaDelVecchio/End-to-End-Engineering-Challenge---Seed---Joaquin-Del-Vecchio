import { AppError } from "../../errors/AppError";

export function routeParam(params: Record<string, string | string[] | undefined>, key: string): string {
  const value = params[key];
  const normalized = Array.isArray(value) ? value[0] : value;

  if (!normalized) {
    throw new AppError(400, "ROUTE_PARAM_MISSING", `Missing route parameter: ${key}`);
  }

  return normalized;
}
