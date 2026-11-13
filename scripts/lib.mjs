// Reading the sheet, checking each page against the template, and shaping it for Sanity.
// No network here, so the tests can run it directly.
import { readFileSync } from "node:fs";
import path from "node:path";

export const FIELDS = JSON.parse(
  readFileSync(path.join(import.meta.dirname, "..", "fields.json"), "utf8"),
).fields;

/** CSV text to rows of cells. Handles quotes, commas and line breaks inside quotes. */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

/**
 * Rows of cells to pages: { slug, pageTitle, ... }. Finds the header row by the Slug column,
 * ignores helper columns ("Page", "#") and the "Target length" row the template sheet adds.
 */
export function readPages(rows) {
  const headerAt = rows.findIndex((r) => r.some((c) => c.trim() === FIELDS[0].header));
  if (headerAt < 0) throw new Error(`No header row found. The sheet needs a "${FIELDS[0].header}" column.`);
  const header = rows[headerAt].map((c) => c.trim());
  const missing = FIELDS.filter((f) => !header.includes(f.header)).map((f) => f.header);
  if (missing.length) throw new Error(`Missing columns: ${missing.join(", ")}`);
  return rows
    .slice(headerAt + 1)
    .filter((r) => (r[0] ?? "").trim() !== "Target length")
    .map((r) => Object.fromEntries(FIELDS.map((f) => [f.key, (r[header.indexOf(f.header)] ?? "").trim()])))
    .filter((p) => p.slug);
}

/** Problems with one page: missing required fields, text over its limit, a malformed slug or URL. */
export function check(page) {
  const problems = [];
  for (const f of FIELDS) {
    const v = page[f.key] ?? "";
    if (f.required && !v) problems.push({ field: f.header, problem: "is empty" });
    if (f.limit && v.length > f.limit) problems.push({ field: f.header, problem: `is ${v.length} characters, over ${f.limit}` });
  }
  if (page.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.slug))
    problems.push({ field: FIELDS[0].header, problem: "should be lowercase words and hyphens only" });
  for (const f of FIELDS.filter((x) => /Image$|formAction$/.test(x.key))) {
    const v = page[f.key];
    if (v && !/^https?:\/\/\S+$/.test(v)) problems.push({ field: f.header, problem: "should be a full URL starting with https://" });
  }
  return problems;
}

/** One page as a plain object every CMS adapter starts from (screenshots as URLs). */
export function toDoc(page) {
  return {
    slug: page.slug,
    pageTitle: page.pageTitle,
    hero: {
      headline: page.headline,
      subhead: page.subhead,
      bullets: [page.bullet1, page.bullet2, page.bullet3].filter(Boolean),
      form: {
        heading: page.formHeading,
        fields: page.formFields.split(",").map((s) => s.trim()).filter(Boolean),
        button: page.formButton,
        action: page.formAction,
      },
    },
    sections: [1, 2, 3, 4].map((n) => ({
      _key: `section${n}`,
      heading: page[`section${n}Heading`],
      text: page[`section${n}Text`],
      imageUrl: page[`section${n}Image`],
    })),
    footer: page.footer,
  };
}

/** A Google Sheet link to its CSV download (the sheet must be viewable by anyone with the link). */
export function csvUrl(url) {
  const m = url.match(/docs\.google\.com\/spreadsheets\/d\/([^/]+)/);
  if (!m) return url;
  const gid = url.match(/[#&?]gid=(\d+)/)?.[1] ?? "0";
  return `https://docs.google.com/spreadsheets/d/${m[1]}/export?format=csv&gid=${gid}`;
}
