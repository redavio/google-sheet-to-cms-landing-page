/**
 * The landing page template: hero with headline, subhead, bullets and a form; four sections
 * (screenshot plus heading and text, alternating sides); a footer line. React and Tailwind,
 * no other dependencies. Style it to your brand: colors and fonts are plain Tailwind classes.
 *
 * `page` is the shape stored in Sanity (see sanity/landingPage.ts), with each section's
 * screenshot as a URL. The sample route in next/page.tsx shows how to load it.
 */
export type LandingPageData = {
  pageTitle: string;
  hero: {
    headline: string;
    subhead: string;
    bullets: string[];
    form: { heading: string; fields: string[]; button: string; action?: string };
  };
  sections: { heading: string; text: string; image?: string }[];
  footer?: string;
};

const fieldName = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
const fieldType = (label: string) => (/e-?mail/i.test(label) ? "email" : /phone/i.test(label) ? "tel" : "text");

export function LandingPage({ page }: { page: LandingPageData }) {
  const { hero } = page;
  return (
    <main className="bg-white text-zinc-900">
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.2fr_1fr] md:items-center md:py-24">
        <div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">{hero.headline}</h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-600">{hero.subhead}</p>
          <ul className="mt-6 space-y-2">
            {hero.bullets.map((b) => (
              <li key={b} className="flex gap-3 text-zinc-700">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-900" />
                {b}
              </li>
            ))}
          </ul>
        </div>
        <form action={hero.form.action} method="post" className="rounded-2xl border border-zinc-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold">{hero.form.heading}</h2>
          <div className="mt-4 space-y-3">
            {hero.form.fields.map((label) => (
              <label key={label} className="block text-sm font-medium text-zinc-700">
                {label}
                <input
                  name={fieldName(label)}
                  type={fieldType(label)}
                  required
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </label>
            ))}
          </div>
          <button type="submit" className="mt-5 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white">
            {hero.form.button}
          </button>
        </form>
      </section>

      {page.sections.map((s, i) => (
        <section key={s.heading} className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-2 md:items-center">
          <div className={i % 2 ? "md:order-2" : ""}>
            {s.image && <img src={s.image} alt={s.heading} className="w-full rounded-xl border border-zinc-200 shadow-sm" />}
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{s.heading}</h2>
            <p className="mt-3 leading-relaxed text-zinc-600">{s.text}</p>
          </div>
        </section>
      ))}

      {page.footer && (
        <footer className="mt-12 border-t border-zinc-200 px-6 py-8 text-center text-sm text-zinc-500">{page.footer}</footer>
      )}
    </main>
  );
}
