// Sample Next.js route: app/lp/[slug]/page.tsx. Loads a published landing page from Sanity
// and renders the template. Copy LandingPage.tsx next to it and set your project id.
import { createClient } from "@sanity/client";
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const page = await sanity.fetch<LandingPageData | null>(QUERY, { slug: (await params).slug });
  return { title: page?.pageTitle };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const page = await sanity.fetch<LandingPageData | null>(QUERY, { slug: (await params).slug });
  if (!page) notFound();
  return <LandingPage page={page} />;
}
