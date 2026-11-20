import type { PageDoc, PageResult } from "../types";
import { ui } from "./ui";

const fieldType = (label: string) => (/e-?mail/i.test(label) ? "email" : /phone/i.test(label) ? "tel" : "text");
const isUrl = (s: string) => /^https?:\/\/\S+$/.test(s);

/**
 * The page laid out like next/LandingPage.tsx, so you see it before it reaches the CMS. The page
 * itself uses your landing page's colors (plain zinc here; change them below) and stays light in
 * dark mode.
 */
export default function Preview({ page }: { page: PageResult }) {
  const d: PageDoc = page.doc;
  return (
    <section className="overflow-x-auto" data-shot="3">
      {!page.ok && <p className={ui.warn}>This page has problems, so it won't be pushed yet. Over-limit text shows as written.</p>}
      <div className="mb-4 mt-2 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-1.5 border-b border-zinc-200 bg-zinc-100 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          <span className="ml-2">{d.pageTitle}</span>
        </div>
        <main className="bg-white text-zinc-900">
          <div className="grid items-center gap-10 px-5 py-8 md:grid-cols-[1.2fr_1fr] md:px-10 md:py-14">
            <div>
              <h1 className="text-balance text-[32px] font-semibold leading-tight tracking-tight md:text-[40px]">{d.hero.headline}</h1>
              <p className="mt-[18px] text-[17px] leading-relaxed text-zinc-600">{d.hero.subhead}</p>
              <ul className="mt-[22px]">
                {d.hero.bullets.map((b) => (
                  <li key={b} className="my-2 flex gap-3 text-[15px] text-zinc-600">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-900" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <form className="rounded-2xl border border-zinc-200 p-6 shadow-sm" onSubmit={(e) => e.preventDefault()}>
              <h2 className="mb-4 text-lg font-semibold">{d.hero.form.heading}</h2>
              {d.hero.form.fields.map((label) => (
                <label key={label} className="mb-3 block text-sm font-medium text-zinc-600">
                  {label}
                  <input type={fieldType(label)} tabIndex={-1} className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm" />
                </label>
              ))}
              <button type="submit" tabIndex={-1} className="mt-2 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white">
                {d.hero.form.button}
              </button>
            </form>
          </div>
          {d.sections.map((s, i) => (
            <div key={s._key} className="grid items-center gap-10 px-5 py-8 md:grid-cols-2 md:px-10">
              <div className={i % 2 ? "md:order-2" : ""}>
                {isUrl(s.imageUrl) ? (
                  <img src={s.imageUrl} alt={s.heading} className="block w-full rounded-xl border border-zinc-200 shadow-sm" />
                ) : (
                  <div className="rounded-xl border border-dashed border-orange-700 px-4 py-12 text-center text-sm text-orange-700">
                    No screenshot: {s.imageUrl || "empty"}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">{s.heading}</h2>
                <p className="mt-3 leading-relaxed text-zinc-600">{s.text}</p>
              </div>
            </div>
          ))}
          {d.footer && <footer className="mt-12 border-t border-zinc-200 px-6 py-8 text-center text-sm text-zinc-500">{d.footer}</footer>}
        </main>
      </div>
    </section>
  );
}
