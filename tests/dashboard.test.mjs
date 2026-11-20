// The dashboard's contract with results.json and with apps that reuse its components.
// The components in dashboard/src/components/ are shared: this repo's app and other apps (such as a
// hosted portal) render them from the same typed result. So they take the result as props, never
// fetch or read files themselves, and never import brand.ts (each app brands itself).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

const SRC = new URL("../dashboard/src/", import.meta.url);

function interfaceFields(name) {
  const src = readFileSync(new URL("types.ts", SRC), "utf8");
  const body = src.match(new RegExp(`export interface ${name} \\{([\\s\\S]*?)\\n\\}`))[1];
  return new Set([...body.matchAll(/^ {2}(\w+)\??:/gm)].map((m) => m[1]));
}

test("the demo results.json matches types.ts", () => {
  const res = JSON.parse(readFileSync(new URL("../dashboard/public/results.json", import.meta.url), "utf8"));
  assert.deepEqual(new Set(Object.keys(res)), interfaceFields("Results"));
});

test("components take props only: no fetching, no brand.ts, no inline styles", () => {
  const dir = new URL("components/", SRC);
  const files = readdirSync(dir).filter((f) => f.endsWith(".tsx"));
  assert.ok(files.length, "dashboard/src/components/ is empty");
  for (const f of files) {
    const src = readFileSync(new URL(f, dir), "utf8");
    assert.ok(!src.includes("fetch("), `${f} fetches; pass the result in as props`);
    assert.ok(![...src.matchAll(/from "([^"]+)"/g)].some((m) => m[1].includes("brand")), `${f} imports brand.ts`);
    assert.ok(!src.includes("style={"), `${f} uses inline styles; use Tailwind classes`);
  }
});
