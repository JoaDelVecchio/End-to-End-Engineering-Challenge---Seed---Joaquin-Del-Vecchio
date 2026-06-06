export const DEFAULT_ALLOWED_ORIGINS = ["http://127.0.0.1:3000", "http://localhost:3000"];

export function readServerConfig(env: NodeJS.ProcessEnv = process.env) {
  return {
    port: Number(env.PORT ?? 8080),
    allowedOrigins: readCsv(env.CLIENT_ORIGINS) ?? DEFAULT_ALLOWED_ORIGINS
  };
}

function readCsv(value: string | undefined): string[] | undefined {
  const values = value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return values?.length ? values : undefined;
}
