import readingTime from "reading-time";
import { excerptFromMdx, titleFromSlug } from "../mdx";
import { postsDir } from "../paths";
import type { Post, Series } from "../types";
import { postFrontmatterSchema } from "../schemas/postSchema";
import { readContent } from "./shared";

export async function getAllPosts(options: { includeDrafts?: boolean } = {}): Promise<Post[]> {
  const rows = await readContent(postsDir, postFrontmatterSchema, "Post");
  return rows
    .map(({ slug, filePath, body, frontmatter }) => ({
      kind: "post" as const,
      slug,
      filePath,
      body,
      excerpt: excerptFromMdx(body),
      title: frontmatter.title,
      description: frontmatter.description,
      date: frontmatter.date,
      updated: frontmatter.updated,
      published: frontmatter.published,
      draft: frontmatter.draft,
      tags: frontmatter.tags,
      category: frontmatter.category,
      series: frontmatter.series,
      seriesTitle: frontmatter.seriesTitle,
      seriesOrder: frontmatter.seriesOrder,
      coverImage: frontmatter.coverImage,
      canonicalUrl: frontmatter.canonicalUrl || undefined,
      featured: frontmatter.featured,
      readingTime: readingTime(body).text
    }))
    .filter((post) => options.includeDrafts || (post.published && !post.draft))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPostBySlug(
  slug: string,
  options: { includeDrafts?: boolean } = {}
): Promise<Post | null> {
  return (await getAllPosts(options)).find((post) => post.slug === slug) ?? null;
}

export async function getAllSeries(options: { includeDrafts?: boolean } = {}): Promise<Series[]> {
  const posts = await getAllPosts(options);
  const groups = new Map<string, Post[]>();
  for (const post of posts) {
    if (!post.series) continue;
    groups.set(post.series, [...(groups.get(post.series) ?? []), post]);
  }
  return [...groups.entries()]
    .map(([slug, seriesPosts]) => {
      const ordered = seriesPosts.sort((a, b) => (a.seriesOrder ?? 999) - (b.seriesOrder ?? 999));
      return {
        slug,
        title: ordered.find((post) => post.seriesTitle)?.seriesTitle ?? titleFromSlug(slug),
        description: `${ordered.length} field note${ordered.length === 1 ? "" : "s"} in this series.`,
        posts: ordered,
        count: ordered.length,
        updated: ordered[0]?.updated ?? ordered[0]?.date
      };
    })
    .sort((a, b) => (b.updated ?? "").localeCompare(a.updated ?? ""));
}

export async function getSeriesBySlug(
  slug: string,
  options: { includeDrafts?: boolean } = {}
): Promise<Series | null> {
  return (await getAllSeries(options)).find((series) => series.slug === slug) ?? null;
}
