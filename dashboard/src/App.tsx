import { useEffect, useState } from "react";
import { BRAND } from "./brand";
import type { PageDoc, PageResult, Results } from "./types";

type Tab = "summary" | "fields" | "preview";
const TABS: Record<Tab, string> = { summary: "Summary", fields: "Field report", preview: "Page preview" };

const params = new URLSearchParams(location.search);
const startTab = (Object.keys(TABS).includes(params.get("view") || "") ? params.get("view") : "summary") as Tab;

export default function App() {
  const [res, setRes] = useState<Results | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>(startTab);
  const [slug, setSlug] = useState(params.get("page") || "");

  useEffect(() => {
    const src = params.get("src") || "results.json";
    fetch(src)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Couldn't load ${src}.`))))
      .then(setRes)
      .catch((e) => setError(e.message));
  }, []);

  const open = (file: File) =>
    file.text().then((t) => {
      try {
        const r: Results = JSON.parse(t);
        if (!Array.isArray(r.pages)) throw new Error();
        setRes(r);
        setSlug("");
        setError("");
      } catch {
        setError("That file isn't a landing page check report.");
      }
    });

  // With no page picked, the field report opens on the first page with a problem
  // and the preview on the first page that passes.
  const page =
    res?.pages.find((p) => p.slug === slug) ||
    (tab === "preview" ? res?.pages.find((p) => p.ok) : res?.pages.find((p) => !p.ok)) ||
    res?.pages[0];

  const show = (s: string, t: Tab) => {
    setSlug(s);
    setTab(t);
    window.scrollTo(0, 0);
  };

  return (
    <div className="page">
      <header>
        <div>
          <h1>{BRAND.logo && <img src={BRAND.logo} alt="" className="logo" />}{BRAND.name} <span className="muted">· Check report</span></h1>
          {res && <p className="muted">{res.source || "Sheet"} checked {res.checked_at.slice(0, 16).replace("T", " ")} UTC.</p>}
        </div>
        <label className="file">
          Open results file
          <input type="file" accept=".json" onChange={(e) => e.target.files?.[0] && open(e.target.files[0])} />
        </label>
      </header>
      {error && <p className="note">{error} Run the check with --json results.json, then open the file here.</p>}
      {res && (
        <>
          <nav>
            {(Object.keys(TABS) as Tab[]).map((t) => (
              <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{TABS[t]}</button>
            ))}
          </nav>
          {tab === "summary" && <Summary res={res} show={show} />}
          {tab !== "summary" && page && (
            <div className="controls">
              <select value={page.slug} onChange={(e) => setSlug(e.target.value)} aria-label="Page">
                {res.pages.map((p) => <option key={p.slug} value={p.slug}>/{p.slug} {p.ok ? "✓" : "✕"}</option>)}
              </select>
              <Badge ok={page.ok} n={page.problems.length} />
            </div>
          )}
          {tab === "fields" && page && <Fields page={page} show={show} />}
          {tab === "preview" && page && <Preview page={page} />}
        </>
      )}
    </div>
  );
}

function Badge({ ok, n }: { ok: boolean; n: number }) {
  return <span className={ok ? "badge pass" : "badge fail"}>{ok ? "Ready" : `${n} problem${n === 1 ? "" : "s"}`}</span>;
}

function Summary({ res, show }: { res: Results; show: (slug: string, t: Tab) => void }) {
  const s = res.summary;
  const cards: [string, number, string][] = [
    ["Pages", s.pages, "rows in the sheet"],
    ["Ready", s.passed, "pass every check"],
    ["With problems", s.with_problems, "fix before pushing"],
    ["Problems", s.problems, "across all pages"],
  ];
  return (
    <section data-shot="1">
      <div className="cards">
        {cards.map(([label, value, sub]) => (
          <div key={label} className="card">
            <div className="muted small">{label}</div>
            <div className={`big${label === "With problems" && value ? " bad" : ""}`}>{value}</div>
            <div className="muted small">{sub}</div>
          </div>
        ))}
      </div>
      <p className={s.with_problems ? "note warn" : "note"}>
        {s.with_problems
          ? "Nothing is pushed while any page has a problem. Fix them in the sheet and run the check again."
          : "Every page passes. Run the push to save them to your CMS as drafts."}
      </p>
      <table>
        <thead><tr><th>Page</th><th>Headline</th><th>Status</th><th>Problems</th><th></th></tr></thead>
        <tbody>
          {res.pages.map((p) => (
            <tr key={p.slug} className={p.ok ? "" : "bad"}>
              <td>/{p.slug}</td>
              <td className="wrap">{p.doc.hero.headline}</td>
              <td><Badge ok={p.ok} n={p.problems.length} /></td>
              <td className="wrap">{p.problems.length ? p.problems.map((x) => `${x.field} ${x.problem}`).join("; ") : "–"}</td>
              <td className="actions">
                <button className="num" onClick={() => show(p.slug, "fields")}>Fields</button>
                <button className="num" onClick={() => show(p.slug, "preview")}>Preview</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Fields({ page, show }: { page: PageResult; show: (slug: string, t: Tab) => void }) {
  return (
    <section data-shot="2">
      <p className="help">
        Every field for /{page.slug}, in sheet order. Length is in characters; limits come from fields.json.{" "}
        <button className="num" onClick={() => show(page.slug, "preview")}>Preview this page</button>
      </p>
      <table>
        <thead><tr><th>Field</th><th>Value</th><th>Length / limit</th><th>Check</th></tr></thead>
        <tbody>
          {page.fields.map((f) => (
            <tr key={f.key} className={f.ok ? "" : "bad"}>
              <td>{f.header}{f.required ? "" : <span className="tag">optional</span>}</td>
              <td className="wrap value">{f.value || <span className="muted">empty</span>}</td>
              <td className={f.limit && f.length > f.limit ? "over" : ""}>{f.limit ? `${f.length} / ${f.limit}` : f.length || "–"}</td>
              <td className="wrap">{f.ok ? <span className="pass-text">✓</span> : <span className="fail-text">✕ {f.problems.join("; ")}</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

const fieldType = (label: string) => (/e-?mail/i.test(label) ? "email" : /phone/i.test(label) ? "tel" : "text");
const isUrl = (s: string) => /^https?:\/\/\S+$/.test(s);

/** The page laid out like next/LandingPage.tsx, so you see it before it reaches the CMS. */
function Preview({ page }: { page: PageResult }) {
  const d: PageDoc = page.doc;
  return (
    <section data-shot="3">
      {!page.ok && <p className="note warn">This page has problems, so it won't be pushed yet. Over-limit text shows as written.</p>}
      <div className="browser">
        <div className="browser-bar"><span className="dot" /><span className="dot" /><span className="dot" /><span className="tab-title">{d.pageTitle}</span></div>
        <main className="lp">
          <div className="lp-hero">
            <div>
              <h1 className="lp-h1">{d.hero.headline}</h1>
              <p className="lp-sub">{d.hero.subhead}</p>
              <ul className="lp-bullets">{d.hero.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
            </div>
            <form className="lp-form" onSubmit={(e) => e.preventDefault()}>
              <h2>{d.hero.form.heading}</h2>
              {d.hero.form.fields.map((label) => (
                <label key={label}>{label}<input type={fieldType(label)} tabIndex={-1} /></label>
              ))}
              <button type="submit" tabIndex={-1}>{d.hero.form.button}</button>
            </form>
          </div>
          {d.sections.map((s, i) => (
            <div key={s._key} className={`lp-section${i % 2 ? " flip" : ""}`}>
              <div className="lp-shot">
                {isUrl(s.imageUrl) ? <img src={s.imageUrl} alt={s.heading} /> : <div className="lp-missing">No screenshot: {s.imageUrl || "empty"}</div>}
              </div>
              <div>
                <h2>{s.heading}</h2>
                <p>{s.text}</p>
              </div>
            </div>
          ))}
          {d.footer && <footer className="lp-footer">{d.footer}</footer>}
        </main>
      </div>
    </section>
  );
}
