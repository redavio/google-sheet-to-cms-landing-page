// Other CMSs: writes one JSON file per page to out/<slug>.json, in the same shape as the
// Sanity document. Import them with your CMS's API or importer. Screenshots stay as URLs.
import { mkdirSync, writeFileSync } from "node:fs";
import { toDoc } from "../scripts/lib.mjs";

export async function save(pages) {
  const dir = process.env.JSON_OUT_DIR || "out";
  mkdirSync(dir, { recursive: true });
  for (const page of pages) writeFileSync(`${dir}/${page.slug}.json`, JSON.stringify(toDoc(page), null, 2) + "\n");
  return `Wrote ${pages.length} page(s) to ${dir}/ as JSON.`;
}
