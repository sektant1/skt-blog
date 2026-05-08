import type { MetadataRoute } from "next";
import { getAllPosts, getAllSeries } from "@/features/content/loaders/posts";
import { getAllProjects } from "@/features/content/loaders/projects";
import { absoluteUrl } from "@/lib/seo/metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, projects, series] = await Promise.all([getAllPosts(), getAllProjects(), getAllSeries()]);
  const staticRoutes = ["/", "/blog", "/projects", "/series", "/search", "/about"];
  return [
    ...staticRoutes.map((path) => ({ url: absoluteUrl(path), lastModified: new Date() })),
    ...posts.map((post) => ({ url: absoluteUrl(`/blog/${post.slug}`), lastModified: new Date(post.updated ?? post.date) })),
    ...projects.map((project) => ({ url: absoluteUrl(`/projects/${project.slug}`), lastModified: new Date(project.updated ?? project.date) })),
    ...series.map((item) => ({ url: absoluteUrl(`/series/${item.slug}`), lastModified: item.updated ? new Date(item.updated) : new Date() }))
  ];
}
