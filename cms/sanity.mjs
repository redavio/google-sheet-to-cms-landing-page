// Sanity: each page becomes a draft `landingPage` document (schema in sanity/landingPage.ts).
// Needs SANITY_PROJECT_ID, SANITY_DATASET and SANITY_WRITE_TOKEN. Nothing is published.
import { createClient } from "@sanity/client";
import { toDoc } from "../scripts/lib.mjs";

export async function save(pages) {
  const { SANITY_PROJECT_ID, SANITY_DATASET, SANITY_WRITE_TOKEN } = process.env;
  if (!SANITY_PROJECT_ID || !SANITY_DATASET || !SANITY_WRITE_TOKEN)
    throw new Error("Set SANITY_PROJECT_ID, SANITY_DATASET and SANITY_WRITE_TOKEN first (see .env.example).");
  const sanity = createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    token: SANITY_WRITE_TOKEN,
    apiVersion: "2025-02-19",
    useCdn: false,
  });

  // Upload each screenshot once per run; Sanity also skips files it already has.
  const uploaded = new Map();
  async function image(url) {
    if (!uploaded.has(url)) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Couldn't download ${url} (${res.status})`);
      const asset = await sanity.assets.upload("image", Buffer.from(await res.arrayBuffer()), {
        filename: url.split("/").pop() || "screenshot",
      });
      uploaded.set(url, asset._id);
    }
    return { _type: "image", asset: { _type: "reference", _ref: uploaded.get(url) } };
  }

  const tx = sanity.transaction();
  for (const page of pages) {
    const doc = { _type: "landingPage", ...toDoc(page) };
    for (const s of doc.sections) s.image = await image(s.imageUrl);
    tx.createOrReplace({ ...doc, _id: `drafts.landingPage.${page.slug}` });
  }
  await tx.commit();
  return `Saved ${pages.length} page(s) to Sanity as drafts. Review and publish them in Sanity Studio.`;
}
