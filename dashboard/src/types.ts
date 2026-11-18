// Shape of results.json, written by the check (node scripts/push.mjs <sheet> --json results.json).

export interface Problem {
  key: string;
  field: string;
  problem: string;
}

export interface FieldResult {
  key: string;
  header: string;
  value: string;
  length: number;
  limit: number | null;
  required: boolean;
  ok: boolean;
  problems: string[];
}

/** The page as the CMS gets it (scripts/lib.mjs toDoc), screenshots as URLs. */
export interface PageDoc {
  slug: string;
  pageTitle: string;
  hero: {
    headline: string;
    subhead: string;
    bullets: string[];
    form: { heading: string; fields: string[]; button: string; action: string };
  };
  sections: { _key: string; heading: string; text: string; imageUrl: string }[];
  footer: string;
}

export interface PageResult {
  slug: string;
  ok: boolean;
  problems: Problem[];
  fields: FieldResult[];
  doc: PageDoc;
}

export interface Results {
  tool: string;
  version: number;
  checked_at: string;
  source: string;
  summary: { pages: number; passed: number; with_problems: number; problems: number };
  fields: { key: string; header: string; limit: number | null; required: boolean; note: string }[];
  pages: PageResult[];
}
