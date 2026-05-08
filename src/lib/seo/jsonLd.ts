import type { Post, Project } from "@/features/content/types";
import { siteConfig } from "@/lib/config/site";
import { absoluteUrl } from "./metadata";

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.author,
    url: siteConfig.url
  };
}

export function blogPostingJsonLd(post: Post) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: { "@type": "Person", name: siteConfig.author },
    url: absoluteUrl(`/blog/${post.slug}`)
  };
}

export function projectJsonLd(project: Project) {
  return {
    "@context": "https://schema.org",
    "@type": project.repoUrl ? "SoftwareSourceCode" : "CreativeWork",
    name: project.title,
    description: project.description,
    dateCreated: project.date,
    dateModified: project.updated ?? project.date,
    codeRepository: project.repoUrl,
    url: absoluteUrl(`/projects/${project.slug}`)
  };
}
