import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { assertValidSlug, contentKindDir, resolveInsideContent } from "../paths";
import type {
  ContentAssetWriteInput,
  ContentAssetWriteResult,
  ContentFile,
  ContentKind,
  ContentRepository,
  ContentSummary,
  ContentWriteInput,
} from "./contentRepository";

function dirName(kind: ContentKind): "posts" | "projects" | "pages" {
  if (kind === "post") return "posts";
  if (kind === "project") return "projects";
  return "pages";
}

function contentPath(kind: ContentKind, slug: string): string {
  assertValidSlug(slug);
  return resolveInsideContent(dirName(kind), slug, "index.mdx");
}

export class LocalContentRepository implements ContentRepository {
  async list(kind: ContentKind): Promise<ContentSummary[]> {
    const base = contentKindDir(kind);
    const entries = await fs.readdir(base, { withFileTypes: true }).catch(() => []);
    const summaries = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => {
          const slug = entry.name;
          const file = path.join(base, slug, "index.mdx");
          const raw = await fs.readFile(file, "utf8").catch(() => "");
          const parsed = matter(raw);
          return {
            kind,
            slug,
            title: String(parsed.data.title ?? slug),
            description: parsed.data.description ? String(parsed.data.description) : undefined,
            published: Boolean(parsed.data.published),
            draft: Boolean(parsed.data.draft),
            updated: parsed.data.updated ? String(parsed.data.updated) : undefined
          };
        })
    );
    return summaries.sort((a, b) => a.slug.localeCompare(b.slug));
  }

  async read(kind: ContentKind, slug: string): Promise<ContentFile | null> {
    const file = contentPath(kind, slug);
    const raw = await fs.readFile(file, "utf8").catch(() => null);
    return raw === null ? null : { kind, slug, path: file, raw };
  }

  async write(input: ContentWriteInput): Promise<void> {
    const file = contentPath(input.kind, input.slug);
    const parsed = matter(input.raw);
    if (parsed.data.slug && parsed.data.slug !== input.slug) {
      throw new Error("Frontmatter slug must match the directory slug.");
    }
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, input.raw.trimEnd() + "\n", "utf8");
  }

  async delete(kind: ContentKind, slug: string): Promise<void> {
    const file = contentPath(kind, slug);
    await fs.rm(path.dirname(file), { recursive: true, force: true });
  }

  async writeAsset(
    input: ContentAssetWriteInput,
  ): Promise<ContentAssetWriteResult> {
    const directory = resolveInsideContent(
      dirName(input.kind),
      input.slug,
      "images",
    );
    const file = resolveInsideContent(
      dirName(input.kind),
      input.slug,
      "images",
      input.fileName,
    );

    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(file, input.bytes);

    return {
      fileName: input.fileName,
      markdownPath: `./images/${input.fileName}`,
      assetUrl: `/api/admin/content-asset/${input.kind}/${input.slug}/images/${input.fileName}`,
    };
  }
}

export const localContentRepository = new LocalContentRepository();
