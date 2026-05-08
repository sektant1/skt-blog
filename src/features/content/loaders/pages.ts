import { excerptFromMdx } from "../mdx";
import { pagesDir } from "../paths";
import type { ContentPage } from "../types";
import { pageFrontmatterSchema } from "../schemas/pageSchema";
import { readContent } from "./shared";

export async function getAllPages(): Promise<ContentPage[]> {
  const rows = await readContent(pagesDir, pageFrontmatterSchema, "Page");
  return rows.map(({ slug, filePath, body, frontmatter }) => ({
    kind: "page" as const,
    slug,
    filePath,
    body,
    excerpt: excerptFromMdx(body),
    title: frontmatter.title,
    description: frontmatter.description,
    updated: frontmatter.updated,
    published: frontmatter.published,
    draft: false
  }));
}

export async function getPageBySlug(slug: string): Promise<ContentPage | null> {
  return (await getAllPages()).find((page) => page.slug === slug && page.published) ?? null;
}
