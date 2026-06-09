import { z } from "zod";

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

export function queryDate(boundary: "from" | "to") {
  return z.string().trim().transform((value, context) => {
    const normalized = normalizeDateBoundary(value, boundary);

    if (!normalized) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid date or datetime"
      });
      return z.NEVER;
    }

    return normalized;
  });
}

export function normalizeDateBoundary(value: string, boundary: "from" | "to"): string | undefined {
  const trimmed = value.trim();

  if (dateOnlyPattern.test(trimmed)) {
    return boundary === "from" ? `${trimmed}T00:00:00.000Z` : `${trimmed}T23:59:59.999Z`;
  }

  if (!z.string().datetime().safeParse(trimmed).success) {
    return undefined;
  }

  return trimmed;
}
