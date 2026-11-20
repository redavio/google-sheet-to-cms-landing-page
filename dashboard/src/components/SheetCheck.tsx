import { useState } from "react";
import type { Results } from "../types";
import Badge from "./Badge";
import Fields from "./Fields";
import Preview from "./Preview";
import Summary from "./Summary";
import { ui } from "./ui";

export const VIEWS = { summary: "Summary", fields: "Field report", preview: "Page preview" } as const;
export type View = keyof typeof VIEWS;

/**
 * The whole check report for one results.json: a one-line summary, then Summary / Field report /
 * Page preview. Takes the result as props and loads nothing itself, so any app can render it (this
 * repo's dashboard reads results.json; a hosted app can pass the same object from its own API).
 */
export default function SheetCheck({
  res,
  initialView = "summary",
  initialPage = "",
}: {
  res: Results;
  initialView?: View;
  initialPage?: string;
}) {
  const [view, setView] = useState<View>(initialView);
  const [slug, setSlug] = useState(initialPage);

  // With no page picked, the field report opens on the first page with a problem
  // and the preview on the first page that passes.
  const page =
    res.pages.find((p) => p.slug === slug) ||
    (view === "preview" ? res.pages.find((p) => p.ok) : res.pages.find((p) => !p.ok)) ||
    res.pages[0];

  const show = (s: string, v: View) => {
    setSlug(s);
    setView(v);
  };

  return (
    <div>
      <p className={`text-sm ${ui.muted}`}>{res.source || "Sheet"} checked {res.checked_at.slice(0, 16).replace("T", " ")} UTC.</p>
      <nav className="mb-2 mt-4 flex flex-wrap gap-1.5">
        {(Object.keys(VIEWS) as View[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`rounded-full border px-3.5 py-1.5 text-sm ${
              view === v
                ? "border-brand bg-brand text-white"
                : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            }`}
          >
            {VIEWS[v]}
          </button>
        ))}
      </nav>
      {view === "summary" && <Summary res={res} show={show} />}
      {view !== "summary" && page && (
        <div className="my-3 flex flex-wrap items-center gap-2 text-sm">
          <select
            value={page.slug}
            onChange={(e) => setSlug(e.target.value)}
            aria-label="Page"
            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {res.pages.map((p) => (
              <option key={p.slug} value={p.slug}>/{p.slug} {p.ok ? "✓" : "✕"}</option>
            ))}
          </select>
          <Badge ok={page.ok} n={page.problems.length} />
        </div>
      )}
      {view === "fields" && page && <Fields page={page} show={show} />}
      {view === "preview" && page && <Preview page={page} />}
    </div>
  );
}
