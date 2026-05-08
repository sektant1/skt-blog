import { getAllPages } from "../src/features/content/loaders/pages";
import { getAllPosts } from "../src/features/content/loaders/posts";
import { getAllProjects } from "../src/features/content/loaders/projects";

function detectDuplicates(slugs: string[], label: string) {
  const seen = new Set<string>();
  for (const slug of slugs) {
    if (seen.has(slug)) throw new Error(`Duplicate ${label} slug: ${slug}`);
    seen.add(slug);
  }
}

async function main() {
  const [posts, projects, pages] = await Promise.all([
    getAllPosts({ includeDrafts: true }),
    getAllProjects({ includeDrafts: true }),
    getAllPages()
  ]);

  detectDuplicates(posts.map((post) => post.slug), "post");
  detectDuplicates(projects.map((project) => project.slug), "project");
  detectDuplicates(pages.map((page) => page.slug), "page");

  for (const post of posts) {
    if (Number.isNaN(Date.parse(post.date))) throw new Error(`Invalid post date: ${post.slug}`);
  }
  for (const project of projects) {
    if (Number.isNaN(Date.parse(project.date))) throw new Error(`Invalid project date: ${project.slug}`);
  }

  console.log(`content ok: ${posts.length} posts, ${projects.length} projects, ${pages.length} pages`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
