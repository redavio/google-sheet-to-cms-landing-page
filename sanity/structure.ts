/**
 * Optional: open every landing page with two tabs, Edit and Preview, so whoever reviews the
 * drafts sees each page as it will look before publishing. Needs the preview route in
 * next/page.tsx, the draft mode route in next/draft-mode-route.ts, and:
 *
 *   npm install sanity-plugin-iframe-pane
 *
 * Then in sanity.config.ts: structureTool({ defaultDocumentNode })
 */
import type { DefaultDocumentNodeResolver } from "sanity/structure";
import { Iframe } from "sanity-plugin-iframe-pane";

export const defaultDocumentNode: DefaultDocumentNodeResolver = (S, { schemaType }) =>
  schemaType === "landingPage"
    ? S.document().views([
        S.view.form().title("Edit"),
        S.view
          .component(Iframe)
          .title("Preview")
          .options({
            url: {
              origin: "same-origin", // or your site's address if the Studio is hosted elsewhere
              preview: (doc: { slug?: string } | null) => (doc?.slug ? `/lp/${doc.slug}` : new Error("Add a slug to preview this page.")),
              draftMode: "/api/draft-mode/enable",
            },
            reload: { button: true },
          }),
      ])
    : S.document();
