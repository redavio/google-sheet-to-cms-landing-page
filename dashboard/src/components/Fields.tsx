import type { PageResult } from "../types";
import type { View } from "./SheetCheck";
import { ui } from "./ui";

/** One page's fields checked against their character limits. */
export default function Fields({ page, show }: { page: PageResult; show: (slug: string, v: View) => void }) {
  return (
    <section className="overflow-x-auto" data-shot="2">
      <p className={ui.help}>
        Every field for /{page.slug}, in sheet order. Length is in characters; limits come from fields.json.{" "}
        <button type="button" className={ui.link} onClick={() => show(page.slug, "preview")}>Preview this page</button>
      </p>
      <table className={ui.table}>
        <thead>
          <tr>{["Field", "Value", "Length / limit", "Check"].map((h) => <th key={h} className={ui.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {page.fields.map((f) => {
            const td = `${ui.cell} ${f.ok ? "" : ui.badRow}`;
            return (
              <tr key={f.key}>
                <td className={`${td} whitespace-nowrap`}>
                  {f.header}
                  {!f.required && (
                    <span className={`ml-1.5 rounded-full border border-zinc-200 px-1.5 py-px text-xs dark:border-zinc-700 ${ui.muted}`}>optional</span>
                  )}
                </td>
                <td className={`${td} max-w-[520px]`}>{f.value || <span className={ui.muted}>empty</span>}</td>
                <td className={`${td} whitespace-nowrap ${f.limit && f.length > f.limit ? ui.bad : ""}`}>
                  {f.limit ? `${f.length} / ${f.limit}` : f.length || "–"}
                </td>
                <td className={td}>{f.ok ? <span className="text-brand">✓</span> : <span className={ui.bad}>✕ {f.problems.join("; ")}</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
