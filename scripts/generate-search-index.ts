import fs from "node:fs/promises";
import path from "node:path";
import { getAllPosts } from "../src/features/content/loaders/posts";
import { getAllProjects } from "../src/features/content/loaders/projects";
import type { SearchDocument } from "../src/features/search/types";

async function main() {
  const [posts, projects] = await Promise.all([getAllPosts(), getAllProjects()]);
  const documents: SearchDocument[] = [
    ...posts.map((post) => ({
      id: `post:${post.slug}`,
      type: "post" as const,
      title: post.title,
      description: post.description,
      slug: post.slug,
      href: `/blog/${post.slug}`,
      tags: post.tags,
      series: post.series,
      bodyExcerpt: post.excerpt,
      date: post.date
    })),
    ...projects.map((project) => ({
      id: `project:${project.slug}`,
      type: "project" as const,
      title: project.title,
      description: project.description,
      slug: project.slug,
      href: `/projects/${project.slug}`,
      tags: [...project.tags, ...project.techStack],
      bodyExcerpt: project.excerpt,
      date: project.date
    }))
  ];
  await fs.mkdir(path.join(process.cwd(), "public"), { recursive: true });
  await fs.writeFile(path.join(process.cwd(), "public/search-index.json"), JSON.stringify(documents, null, 2), "utf8");
  console.log(`search index ok: ${documents.length} documents`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
