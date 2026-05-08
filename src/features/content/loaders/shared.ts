import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import type { ZodType } from "zod";
import { assertValidSlug } from "../paths";

export type RawContent<T> = {
  slug: string;
  filePath: string;
  body: string;
  frontmatter: T;
};

export async function readContent<T>(
  baseDir: string,
  schema: ZodType<T>,
  label: string
): Promise<RawContent<T>[]> {
  const files = await fg(["*/index.md", "*/index.mdx"], { cwd: baseDir, absolute: true });
  return Promise.all(
    files.map(async (filePath) => {
      const slug = path.basename(path.dirname(filePath));
      assertValidSlug(slug);
      const raw = await fs.readFile(filePath, "utf8");
      const parsed = matter(raw);
      const result = schema.safeParse(parsed.data);
      if (!result.success) {
        throw new Error(`${label} "${slug}" has invalid frontmatter: ${result.error.message}`);
      }
      const declaredSlug = (result.data as { slug?: string }).slug;
      if (declaredSlug && declaredSlug !== slug) {
        throw new Error(`${label} "${slug}" frontmatter slug must match directory name.`);
      }
      return { slug, filePath, body: parsed.content.trim(), frontmatter: result.data };
    })
  );
}
