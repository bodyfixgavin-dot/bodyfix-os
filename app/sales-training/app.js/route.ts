import chunk00 from "../index.html/chunk-00";
import chunk01 from "../index.html/chunk-01";
import chunk02 from "../index.html/chunk-02";
import chunk03 from "../index.html/chunk-03";
import chunk04 from "../index.html/chunk-04";
import chunk05 from "../index.html/chunk-05";

export const runtime = "nodejs";

export function GET() {
  const html = Buffer.from(
    [chunk00, chunk01, chunk02, chunk03, chunk04, chunk05].join(""),
    "base64",
  ).toString("utf8");

  const match = html.match(/<script>([\s\S]*?)<\/script>/);

  if (!match) {
    return new Response("Sales training script not found.", { status: 500 });
  }

  return new Response(match[1], {
    headers: {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
