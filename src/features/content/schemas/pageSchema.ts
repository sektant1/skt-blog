import { z } from "zod";

export const pageFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().min(1),
  updated: z.string().date().optional(),
  published: z.boolean().default(true)
});

export type PageFrontmatter = z.infer<typeof pageFrontmatterSchema>;
