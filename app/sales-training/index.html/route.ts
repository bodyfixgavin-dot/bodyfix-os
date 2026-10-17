import chunk00 from "./chunk-00";
import chunk01 from "./chunk-01";
import chunk02 from "./chunk-02";
import chunk03 from "./chunk-03";
import chunk04 from "./chunk-04";
import chunk05 from "./chunk-05";

export const runtime = "nodejs";

const encodedDocument = [
  chunk00,
  chunk01,
  chunk02,
  chunk03,
  chunk04,
  chunk05,
].join("");

function readDocument() {
  return Buffer.from(encodedDocument, "base64").toString("utf8");
}

export function GET() {
  const html = readDocument().replace(
    /<script>[\s\S]*?<\/script>/,
    '<script src="/sales-training/app-script" defer></script>',
  );

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
