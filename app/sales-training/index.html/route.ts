import chunk00 from "./chunk-00";
import chunk01 from "./chunk-01";
import chunk02 from "./chunk-02";
import chunk03 from "./chunk-03";
import chunk04 from "./chunk-04";
import chunk05 from "./chunk-05";

export const runtime = "nodejs";

export function GET() {
  const html = Buffer.from(
    [chunk00, chunk01, chunk02, chunk03, chunk04, chunk05].join(""),
    "base64",
  ).toString("utf8");

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
