import { z } from "zod";

const optionalUrl = z.string().url().or(z.literal("")).optional();

export const projectFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().min(1),
  date: z.string().date(),
  updated: z.string().date().optional(),
  published: z.boolean().default(true),
  draft: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  techStack: z.array(z.string()).default([]),
  repoUrl: optionalUrl,
  demoUrl: optionalUrl,
  coverImage: z.string().optional(),
  media: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  status: z.enum(["active", "paused", "archived", "shipping", "experiment"]).default("active")
});

export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;
