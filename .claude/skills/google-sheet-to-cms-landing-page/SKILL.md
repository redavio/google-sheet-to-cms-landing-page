---
name: google-sheet-to-cms-landing-page
description: Check landing page copy from a Google Sheet or CSV against its character limits and push the pages to a CMS (Sanity drafts, or JSON files to import into another CMS). Use when the user wants to create or update landing pages in bulk from a sheet.
---

# Google Sheet to CMS Landing Page

1. Ask for the sheet link (shared as "Anyone with the link: Viewer") or a CSV path, if not given.
2. Check first: `node scripts/push.mjs "<link or file>"`. Nothing is written.
3. If any page shows ✕, list each problem (page, field, characters vs limit) and suggest a shorter version that keeps the meaning. Don't edit the sheet; the user does.
4. When every page passes, confirm with the user, then run the same command with `--apply` (add `--cms json` to export files for another CMS). Sanity needs SANITY_PROJECT_ID, SANITY_DATASET and SANITY_WRITE_TOKEN in `.env`.
5. Report what was saved. For Sanity, remind the user to review and publish the drafts in Studio. Never publish for them.

Limits and fields are in `fields.json`.
