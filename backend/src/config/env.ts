export const DEFAULT_ALLOWED_ORIGINS = ["http://127.0.0.1:3000", "http://localhost:3000"];

export function readServerConfig(env: NodeJS.ProcessEnv = process.env) {
  return {
    port: readPort(env.PORT),
    allowedOrigins: readAllowedOrigins(env.CLIENT_ORIGINS)
  };
}

function readPort(value: string | undefined): number {
  const port = Number(value ?? 8080);

  if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
    throw new Error("Invalid PORT. Expected an integer between 1 and 65535.");
  }

  return port;
}

function readAllowedOrigins(value: string | undefined): string[] {
  const origins = readCsv(value) ?? DEFAULT_ALLOWED_ORIGINS;

  for (const origin of origins) {
    try {
      const parsed = new URL(origin);

      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error("Unsupported protocol");
      }
    } catch {
      throw new Error(`Invalid CLIENT_ORIGINS entry: ${origin}`);
    }
  }

  return origins;
}

export function readCsv(value: string | undefined): string[] | undefined {
  const values = value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return values?.length ? values : undefined;
}
