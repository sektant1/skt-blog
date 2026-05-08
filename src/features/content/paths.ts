import path from "node:path";

export const rootDir = process.cwd();
export const contentDir = path.join(rootDir, "content");
export const postsDir = path.join(contentDir, "posts");
export const projectsDir = path.join(contentDir, "projects");
export const pagesDir = path.join(contentDir, "pages");

export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function assertValidSlug(slug: string): void {
  if (!slugPattern.test(slug)) {
    throw new Error(`Invalid slug "${slug}". Use lowercase kebab-case.`);
  }
}

export function contentKindDir(kind: "post" | "project" | "page"): string {
  if (kind === "post") return postsDir;
  if (kind === "project") return projectsDir;
  return pagesDir;
}

export function resolveInsideContent(...segments: string[]): string {
  const target = path.resolve(contentDir, ...segments);
  const relative = path.relative(contentDir, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Refusing to access a path outside content/.");
  }
  return target;
}
