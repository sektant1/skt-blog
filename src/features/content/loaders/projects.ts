import { excerptFromMdx } from "../mdx";
import { projectsDir } from "../paths";
import type { Project } from "../types";
import { projectFrontmatterSchema } from "../schemas/projectSchema";
import { readContent } from "./shared";

export async function getAllProjects(options: { includeDrafts?: boolean } = {}): Promise<Project[]> {
  const rows = await readContent(projectsDir, projectFrontmatterSchema, "Project");
  return rows
    .map(({ slug, filePath, body, frontmatter }) => ({
      kind: "project" as const,
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
      techStack: frontmatter.techStack,
      repoUrl: frontmatter.repoUrl || undefined,
      demoUrl: frontmatter.demoUrl || undefined,
      coverImage: frontmatter.coverImage,
      media: frontmatter.media,
      featured: frontmatter.featured,
      status: frontmatter.status
    }))
    .filter((project) => options.includeDrafts || (project.published && !project.draft))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getProjectBySlug(
  slug: string,
  options: { includeDrafts?: boolean } = {}
): Promise<Project | null> {
  return (await getAllProjects(options)).find((project) => project.slug === slug) ?? null;
}
