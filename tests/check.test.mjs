import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FIELDS, check, csvUrl, parseCsv, readPages, toDoc } from "../scripts/lib.mjs";

const sample = readPages(parseCsv(readFileSync(new URL("../template/landing-pages.csv", import.meta.url), "utf8")));

test("the template's two sample pages pass every check", () => {
  assert.equal(sample.length, 2);
  for (const page of sample) assert.deepEqual(check(page), []);
});

test("text over its limit is caught, with the count", () => {
  const page = { ...sample[0], headline: "x".repeat(61) };
  assert.deepEqual(check(page), [{ field: "Hero headline", problem: "is 61 characters, over 60" }]);
});

test("empty required fields, bad slugs and bad URLs are caught", () => {
  const page = { ...sample[0], subhead: "", slug: "Bad Slug", section1Image: "acme-1.png" };
  const problems = check(page).map((p) => `${p.field} ${p.problem}`);
  assert.ok(problems.includes("Hero subhead is empty"));
  assert.ok(problems.some((p) => p.startsWith("Slug") && p.includes("lowercase")));
  assert.ok(problems.some((p) => p.startsWith("Section 1 screenshot URL")));
});

test("the template sheet's extra rows and columns are ignored", () => {
  const header = ["Page", FIELDS[0].header, "#", ...FIELDS.slice(1).map((f) => f.header)];
  const target = ["Target length", "", "", ...FIELDS.slice(1).map(() => "")];
  const row = ["Example", ...[sample[0].slug, "", ...FIELDS.slice(1).map((f) => sample[0][f.key])]];
  const pages = readPages([header, target, row]);
  assert.equal(pages.length, 1);
  assert.equal(pages[0].headline, sample[0].headline);
});

test("a page becomes a CMS document with four sections and up to three bullets", () => {
  const doc = toDoc(sample[0]);
  assert.equal(doc.slug, "ppc-reporting");
  assert.equal(doc.sections.length, 4);
  assert.equal(doc.hero.bullets.length, 3);
  assert.deepEqual(doc.hero.form.fields, ["Name", "Work email", "Company"]);
});

test("a Google Sheet link becomes its CSV download", () => {
  assert.equal(
    csvUrl("https://docs.google.com/spreadsheets/d/abc123/edit?gid=42#gid=42"),
    "https://docs.google.com/spreadsheets/d/abc123/export?format=csv&gid=42",
  );
});
