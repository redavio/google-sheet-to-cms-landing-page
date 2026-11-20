# google-sheet-to-cms-landing-page

Write landing pages in a Google Sheet, check every field against its character limit, and push them to your CMS. Sanity is built in (pages land as drafts you review and publish). For other CMSs it writes one JSON file per page that you can import. Nothing goes live from here.

Built for performance marketers working with product marketing: the copy is written and approved in the sheet, and the pages ship the same day.

## The template

**[Make a copy of the template sheet](https://docs.google.com/spreadsheets/d/1cOHJjB80GHYeW8mY76_j5WO8nGxurO-RXwjJ54jvxcE/copy)** (or start from `template/landing-pages.csv`).

One row per page. Each text column has a `#` column next to it that counts characters and turns red over the limit.

| Part | Fields | Limits |
|---|---|---|
| SEO | Slug, page title | title 60 |
| Hero | Headline, subhead, 3 bullets | 60, 160, 80 each |
| Form | Heading, fields (comma separated), button, submit URL | 40, -, 20, - |
| 4 sections | Heading, text, screenshot URL | 60, 220, - |
| Footer | One line | 120 |

The two example pages and their screenshots are fictional.

## Install

```bash
git clone https://github.com/redavio/google-sheet-to-cms-landing-page
cd google-sheet-to-cms-landing-page
npm install
cp .env.example .env   # pick your CMS; for Sanity add the project id and a write token
```

Needs Node 20.12 or newer.

## Run

Share your sheet as "Anyone with the link: Viewer", then:

```bash
node scripts/push.mjs "<sheet link>"                      # check only, nothing written
node scripts/push.mjs "<sheet link>" --apply              # save every page (CMS from .env)
node scripts/push.mjs "<sheet link>" --apply --cms json   # or pick one per run
```

A CSV file works in place of the link. If any page has a problem (empty field, text over its limit, bad slug or URL), it lists them and saves nothing.

Add `--json results.json` to any run to also write the check report (every page's fields, values and problems, plus a summary) for the dashboard.

## Dashboard

A small React app that shows the check report: every page ready or blocked, each page's fields against their limits, and a preview of each page in the landing page layout.

```bash
npm run check -- "<sheet link or file.csv>" --json dashboard/public/results.json
cd dashboard && npm install && npm run dev
```

`dashboard/public/results.json` ships with the check run on `examples/landing-pages-with-a-problem.csv` (the two template pages plus one page with four problems), so you can see a report before running your own. To share it, deploy the `dashboard` folder to Vercel (or any static host) with your `results.json` in `public/`. Anyone can also open a results file with the "Open results file" button.

## Make it yours

This is a starting point, not a finished product. Fork it and change anything:

- **Brand the dashboard.** It ships unbranded. Set your name and logo in
  `dashboard/src/brand.ts` and your brand color (one CSS variable, `--brand`) at the
  top of `dashboard/src/index.css`. It's styled with Tailwind and follows the
  system's light or dark mode. The page preview's own colors are in
  `dashboard/src/components/Preview.tsx`.
- **Reuse the screens in your own app.** The screens live in
  `dashboard/src/components/` and take the result (typed in `dashboard/src/types.ts`)
  as props; they load nothing themselves. `dashboard/src/App.tsx` is the only part
  that reads `results.json`, so copy the components and types into any React +
  Tailwind app and feed them from your own API. Add a `brand` color to your
  Tailwind config.
- **Change the screens or build your own app.** Everything on screen comes from one file, `results.json`. Build your own React app, internal tool or AI agent on it.
- **Change the rules.** Fields, headers, limits and which fields are required are in `fields.json`; the checks are in `scripts/lib.mjs`.
- **Bring another CMS.** Add one file to `cms/` (below).

## Your CMS

| `--cms` | What it does |
|---|---|
| `sanity` | Uploads each screenshot, then saves every page in one transaction as a draft (`drafts.landingPage.<slug>`). Review and publish in Sanity Studio. |
| `json` | Writes `out/<slug>.json` per page, screenshots as URLs. Import them with your CMS's API or importer. |

To push straight into another CMS, add one file to `cms/` (copy `cms/json.mjs`) that exports `save(pages)`, then run with `--cms <its name>`.

## Add it to your site

- `next/LandingPage.tsx`: the page template (React and Tailwind). It takes the same page shape whatever your CMS.
- `next/page.tsx`: a sample Next.js route that loads a published page from Sanity by slug.
- `sanity/landingPage.ts`: the Sanity schema, with the same limits, so Studio flags the same problems.
- `sanity/structure.ts`, `next/draft-mode-route.ts`: optional, for reviewing drafts (below).

## Review pages before you publish (Sanity)

Pushed pages are drafts. To let whoever reviews them see each page as it will look, add the Preview tab:

1. `npm install sanity-plugin-iframe-pane next-sanity` in your site.
2. Add `sanity/structure.ts` to your Studio and pass `defaultDocumentNode` to `structureTool` in `sanity.config.ts`.
3. Add `next/draft-mode-route.ts` as `app/api/draft-mode/enable/route.ts`, and `next/page.tsx` as `app/lp/[slug]/page.tsx`. Set `SANITY_READ_TOKEN` (Viewer access).

In the Studio, open **Landing page**, pick a page, and switch between the **Edit** and **Preview** tabs. Publish when it looks right.

## Adapt it to your own setup

It isn't only for landing pages. Every field, its header and its limit live in `fields.json`: change them (and the schema) for feature pages, comparison pages or any page with a fixed layout. The form posts to the submit URL you set per page, so point it at your form tool or CRM.

## In Claude Code

`.claude/skills/google-sheet-to-cms-landing-page/SKILL.md` lets Claude run the check, explain any problems and push the pages for you.

## Tests

```bash
npm test
```

## License

MIT

Sanity is a trademark of Sanity AS. Google Sheets is a trademark of Google LLC. This project is not affiliated with or endorsed by either company.
