#!/usr/bin/env node
// Push landing pages from a sheet into your CMS.
//
//   node scripts/push.mjs <google-sheet-link | file.csv>                   check only, nothing written
//   node scripts/push.mjs <google-sheet-link | file.csv> --apply           save every page
//   node scripts/push.mjs <google-sheet-link | file.csv> --apply --cms json
//   node scripts/push.mjs <google-sheet-link | file.csv> --json results.json   also write the check report
//
// --json writes every page's fields, values and problems to a file the dashboard (dashboard/) reads.
// --cms picks a file in cms/ (default: the CMS setting in .env, else sanity). Sanity saves
// drafts; json writes files to import into another CMS. Adding a CMS = one file in cms/ with save(pages).
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { check, csvUrl, parseCsv, readPages, report } from "./lib.mjs";

if (existsSync(".env")) process.loadEnvFile(".env");

const args = process.argv.slice(2);
const cmsAt = args.indexOf("--cms");
const cms = (cmsAt >= 0 ? args[cmsAt + 1] : process.env.CMS) || "sanity";
const jsonAt = args.indexOf("--json");
const jsonOut = jsonAt >= 0 ? args[jsonAt + 1] : "";
const valueAt = [cmsAt, jsonAt].filter((i) => i >= 0).map((i) => i + 1);
const [source] = args.filter((a, i) => !a.startsWith("--") && !valueAt.includes(i));
const apply = args.includes("--apply");
if (!source) {
  console.log("Usage: node scripts/push.mjs <google-sheet-link | file.csv> [--apply] [--cms sanity|json] [--json results.json]");
  process.exit(1);
}

process.on("uncaughtException", (e) => {
  console.log(e.message);
  process.exit(1);
});

const text = /^https?:/.test(source)
  ? await fetch(csvUrl(source)).then((r) => {
      if (!r.ok) throw new Error(`Couldn't read the sheet (${r.status}). Share it as "Anyone with the link: Viewer".`);
      return r.text();
    })
  : readFileSync(source, "utf8");

const pages = readPages(parseCsv(text));
let blocked = 0;
for (const page of pages) {
  const problems = check(page);
  if (problems.length) blocked++;
  console.log(`${problems.length ? "✕" : "✓"} /${page.slug}`);
  for (const p of problems) console.log(`    ${p.field} ${p.problem}`);
}
console.log(`\n${pages.length} page(s), ${blocked} with problems.`);
if (jsonOut) {
  writeFileSync(jsonOut, JSON.stringify(report(pages, source), null, 1) + "\n");
  console.log(`Wrote the check report to ${jsonOut}.`);
}
if (blocked) {
  console.log("Fix the problems above and run it again. Nothing was saved.");
  process.exit(1);
}
if (!apply) {
  console.log(`Check only. Add --apply to save these pages (${cms}).`);
  process.exit(0);
}

const adapter = new URL(`../cms/${cms}.mjs`, import.meta.url);
if (!existsSync(adapter)) throw new Error(`No CMS called "${cms}". Pick one in cms/, or add a file there.`);
const { save } = await import(adapter);
console.log(await save(pages));
