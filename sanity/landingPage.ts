import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * One landing page: hero (headline, subhead, bullets, form), four sections with a screenshot
 * each, and a footer line. Limits match fields.json, so Studio flags the same problems the
 * sheet and the push script do. Add it to your schema types.
 */
export const landingPage = defineType({
  name: "landingPage",
  title: "Landing page",
  type: "document",
  fields: [
    defineField({ name: "slug", title: "Slug", type: "string", validation: (r) => r.required().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) }),
    defineField({ name: "pageTitle", title: "Page title", type: "string", validation: (r) => r.required().max(60) }),
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      fields: [
        defineField({ name: "headline", type: "string", validation: (r) => r.required().max(60) }),
        defineField({ name: "subhead", type: "text", rows: 2, validation: (r) => r.required().max(160) }),
        defineField({ name: "bullets", type: "array", of: [defineArrayMember({ type: "string", validation: (r) => r.max(80) })], validation: (r) => r.min(1).max(3) }),
        defineField({
          name: "form",
          type: "object",
          fields: [
            defineField({ name: "heading", type: "string", validation: (r) => r.required().max(40) }),
            defineField({ name: "fields", type: "array", of: [defineArrayMember({ type: "string" })] }),
            defineField({ name: "button", type: "string", validation: (r) => r.required().max(20) }),
            defineField({ name: "action", title: "Submit URL", type: "url" }),
          ],
        }),
      ],
    }),
    defineField({
      name: "sections",
      type: "array",
      validation: (r) => r.length(4),
      of: [
        defineArrayMember({
          type: "object",
          name: "section",
          fields: [
            defineField({ name: "heading", type: "string", validation: (r) => r.required().max(60) }),
            defineField({ name: "text", type: "text", rows: 3, validation: (r) => r.required().max(220) }),
            defineField({ name: "image", title: "Screenshot", type: "image" }),
            defineField({ name: "imageUrl", title: "Screenshot source URL", type: "url", readOnly: true }),
          ],
          preview: { select: { title: "heading", media: "image" } },
        }),
      ],
    }),
    defineField({ name: "footer", type: "string", validation: (r) => r.max(120) }),
  ],
  preview: { select: { title: "hero.headline", subtitle: "slug" } },
});
