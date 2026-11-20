import type { Results } from "../types";
import Badge from "./Badge";
import type { View } from "./SheetCheck";
import { ui } from "./ui";

/** Every page in the sheet, ready or blocked, with its problems. */
export default function Summary({ res, show }: { res: Results; show: (slug: string, v: View) => void }) {
  const s = res.summary;
  const cards: [string, number, string][] = [
    ["Pages", s.pages, "rows in the sheet"],
    ["Ready", s.passed, "pass every check"],
    ["With problems", s.with_problems, "fix before pushing"],
    ["Problems", s.problems, "across all pages"],
  ];
  return (
    <section className="overflow-x-auto" data-shot="1">
      <div className="my-5 grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
        {cards.map(([label, value, sub]) => (
          <div key={label} className="rounded-xl border border-zinc-200 p-3.5 dark:border-zinc-700">
            <div className={`text-xs ${ui.muted}`}>{label}</div>
            <div className={`my-1 text-2xl font-semibold ${label === "With problems" && value ? ui.bad : ""}`}>{value}</div>
            <div className={`text-xs ${ui.muted}`}>{sub}</div>
          </div>
        ))}
      </div>
      <p className={s.with_problems ? ui.warn : ui.note}>
        {s.with_problems
          ? "Nothing is pushed while any page has a problem. Fix them in the sheet and run the check again."
          : "Every page passes. Run the push to save them to your CMS as drafts."}
      </p>
      <table className={ui.table}>
        <thead>
          <tr>{["Page", "Headline", "Status", "Problems", ""].map((h, i) => <th key={i} className={ui.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {res.pages.map((p) => {
            const td = `${ui.cell} ${p.ok ? "" : ui.badRow}`;
            return (
              <tr key={p.slug}>
                <td className={`${td} whitespace-nowrap`}>/{p.slug}</td>
                <td className={td}>{p.doc.hero.headline}</td>
                <td className={`${td} whitespace-nowrap`}><Badge ok={p.ok} n={p.problems.length} /></td>
                <td className={td}>{p.problems.length ? p.problems.map((x) => `${x.field} ${x.problem}`).join("; ") : "–"}</td>
                <td className={`${td} whitespace-nowrap`}>
                  <button type="button" className={ui.link} onClick={() => show(p.slug, "fields")}>Fields</button>
                  <button type="button" className={`ml-3 ${ui.link}`} onClick={() => show(p.slug, "preview")}>Preview</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
