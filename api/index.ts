import app from "../vercel/apiApp";
import type { IncomingMessage, ServerResponse } from "node:http";

type VercelRequest = IncomingMessage & {
  query?: Record<string, string | string[] | undefined>;
  url?: string;
};

function queryValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function appendQuery(searchParams: URLSearchParams, key: string, value: string | string[] | undefined) {
  if (key === "path" || value === undefined) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => searchParams.append(key, item));
    return;
  }

  searchParams.append(key, value);
}

export default function handler(request: VercelRequest, response: ServerResponse) {
  const rewrittenPath = queryValue(request.query?.path);

  if (rewrittenPath) {
    const searchParams = new URLSearchParams();

    Object.entries(request.query ?? {}).forEach(([key, value]) => appendQuery(searchParams, key, value));

    const search = searchParams.toString();
    request.url = `/api/${rewrittenPath}${search ? `?${search}` : ""}`;
  }

  return app(request, response);
}
