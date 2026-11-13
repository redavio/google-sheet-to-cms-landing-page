// Sample Next.js route: app/lp/[slug]/page.tsx. Shows a published landing page from Sanity,
// or the draft when you're previewing from the Studio (see next/draft-mode-route.ts).
// Copy LandingPage.tsx next to it and set your project id.
import { createClient } from "@sanity/client";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { LandingPage, type LandingPageData } from "./LandingPage";

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2025-02-19",
  useCdn: true,
});

const QUERY = `*[_type == "landingPage" && slug == $slug][0]{
  pageTitle, footer,
  hero{ headline, subhead, bullets, form },
  sections[]{ heading, text, "image": image.asset->url }
}`;

async function load(slug: string) {
  const preview = (await draftMode()).isEnabled;
  const client = preview
    ? sanity.withConfig({ useCdn: false, token: process.env.SANITY_READ_TOKEN, perspective: "drafts" })
    : sanity;
  return client.fetch<LandingPageData | null>(QUERY, { slug }, preview ? { cache: "no-store" } : {});
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const page = await load((await params).slug);
  return { title: page?.pageTitle };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const page = await load((await params).slug);
  if (!page) notFound();
  return <LandingPage page={page} />;
}
