import { NextResponse } from "next/server";

const DEFAULT_METHODS = "GET,POST,PATCH,OPTIONS";
const DEFAULT_HEADERS = "Content-Type, Authorization";

function normalizeOrigin(origin: string | null) {
  return origin?.replace(/\/$/, "") ?? "";
}

export function getAllowedOrigins() {
  const origins = new Set<string>();
  const publicNetlifyOrigin = process.env.PUBLIC_NETLIFY_ORIGIN;
  if (publicNetlifyOrigin) origins.add(normalizeOrigin(publicNetlifyOrigin));
  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
    origins.add("http://localhost:3001");
    origins.add("http://127.0.0.1:3000");
    origins.add("http://127.0.0.1:3001");
  }
  return origins;
}

export function getCorsOrigin(req: Request) {
  const requestOrigin = normalizeOrigin(req.headers.get("origin"));
  if (!requestOrigin) return "";
  return getAllowedOrigins().has(requestOrigin) ? requestOrigin : "";
}

export function withCors(req: Request, response: NextResponse, methods = DEFAULT_METHODS) {
  const allowedOrigin = getCorsOrigin(req);
  if (allowedOrigin) response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  response.headers.set("Vary", "Origin");
  response.headers.set("Access-Control-Allow-Methods", methods);
  response.headers.set("Access-Control-Allow-Headers", DEFAULT_HEADERS);
  return response;
}

export function corsJson(req: Request, body: unknown, init?: ResponseInit, methods = DEFAULT_METHODS) {
  return withCors(req, NextResponse.json(body, init), methods);
}

export function handleOptions(req: Request, methods = DEFAULT_METHODS) {
  return withCors(req, new NextResponse(null, { status: 204 }), methods);
}
