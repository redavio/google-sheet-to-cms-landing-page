// Sample Next.js route: app/api/draft-mode/enable/route.ts. Turns on draft mode for someone
// signed in to your Sanity Studio, so the Preview tab shows unpublished drafts. Needs
// next-sanity and a Sanity read token (SANITY_READ_TOKEN, Viewer access).
import { createClient } from "@sanity/client";
import { defineEnableDraftMode } from "next-sanity/draft-mode";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2025-02-19",
  useCdn: false,
  token: process.env.SANITY_READ_TOKEN,
});

export const { GET } = defineEnableDraftMode({ client });
