# google-sheet-to-cms-landing-page

Write landing pages in a Google Sheet, check every field against its character limit, and push them to your CMS. Sanity is built in (pages land as drafts you review and publish); for any other headless CMS it writes one JSON file per page. Nothing goes live from here.

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

## Your CMS

| `--cms` | What it does |
|---|---|
| `sanity` | Uploads each screenshot, then saves every page in one transaction as a draft (`drafts.landingPage.<slug>`). Review and publish in Sanity Studio. |
| `json` | Writes `out/<slug>.json` per page, screenshots as URLs. Import them into Contentful, Strapi, Payload, Storyblok or any CMS with an API or importer. |

To push straight into another CMS, add one file to `cms/` (copy `cms/json.mjs`) that exports `save(pages)`, then run with `--cms <its name>`.

## Add it to your site

- `next/LandingPage.tsx`: the page template (React and Tailwind). It takes the same page shape whatever your CMS.
- `next/page.tsx`: a sample Next.js route that loads a published page from Sanity by slug.
- `sanity/landingPage.ts`: the Sanity schema, with the same limits, so Studio flags the same problems.

## Adapt it to your own setup

Every field, its header and its limit live in `fields.json`. Add, remove or resize fields there and in the schema to fit another page type. The form posts to the submit URL you set per page, so point it at your form tool or CRM.

## In Claude Code

`.claude/skills/google-sheet-to-cms-landing-page/SKILL.md` lets Claude run the check, explain any problems and push the pages for you.

## Tests

```bash
npm test
```

## License

MIT
