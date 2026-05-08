import { z } from "zod";

const optionalUrl = z.string().url().or(z.literal("")).optional();

export const postFrontmatterSchema = z
  .object({
    title: z.string().min(1),
    slug: z.string().optional(),
    description: z.string().min(1),
    date: z.string().date(),
    updated: z.string().date().optional(),
    published: z.boolean().default(true),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    category: z.string().optional(),
    series: z.string().optional(),
    seriesTitle: z.string().optional(),
    seriesOrder: z.number().int().positive().optional(),
    coverImage: z.string().optional(),
    canonicalUrl: optionalUrl,
    featured: z.boolean().default(false)
  })
  .superRefine((value, ctx) => {
    if (value.series && !value.seriesOrder) {
      ctx.addIssue({
        code: "custom",
        path: ["seriesOrder"],
        message: "seriesOrder is required when series is set."
      });
    }
  });

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;
