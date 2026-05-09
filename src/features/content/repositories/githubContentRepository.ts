import matter from "gray-matter";
import { assertValidSlug } from "../paths";
import type {
  ContentAssetWriteInput,
  ContentAssetWriteResult,
  ContentFile,
  ContentKind,
  ContentRepository,
  ContentSummary,
  ContentWriteInput,
} from "./contentRepository";

type GithubContentEntry = {
  name: string;
  path: string;
  sha: string;
  type: "file" | "dir" | "symlink" | "submodule";
};

type GithubTreeEntry = {
  path: string;
  type: "blob" | "tree" | "commit";
};

type GithubTreeResponse = {
  tree: GithubTreeEntry[];
};

type GithubFileResponse = {
  path: string;
  sha: string;
  content: string;
  encoding: string;
};

const githubApiBase = "https://api.github.com";

const allowedAssetMimeTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const allowedAssetExtensions = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".webp",
]);

const allowedPreviewExtensions = new Set([...allowedAssetExtensions, ".svg"]);

function requireGithubConfig(): {
  token: string;
  owner: string;
  repo: string;
  branch: string;
} {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token) {
    throw new Error("GITHUB_TOKEN is required when CONTENT_BACKEND=github.");
  }

  if (!owner) {
    throw new Error("GITHUB_OWNER is required when CONTENT_BACKEND=github.");
  }

  if (!repo) {
    throw new Error("GITHUB_REPO is required when CONTENT_BACKEND=github.");
  }

  return { token, owner, repo, branch };
}

function kindDir(kind: ContentKind): "posts" | "projects" | "pages" {
  if (kind === "post") return "posts";
  if (kind === "project") return "projects";
  if (kind === "page") return "pages";

  throw new Error("Invalid content kind.");
}

function assertValidKind(kind: ContentKind): void {
  kindDir(kind);
}

function mdxFilePath(kind: ContentKind, slug: string): string {
  assertValidKind(kind);
  assertValidSlug(slug);
  return `content/${kindDir(kind)}/${slug}/index.mdx`;
}

function assetFilePath(kind: ContentKind, slug: string, fileName: string): string {
  assertValidKind(kind);
  assertValidSlug(slug);
  assertSafeFileName(fileName);
  return `content/${kindDir(kind)}/${slug}/images/${fileName}`;
}

function assertSafeFileName(fileName: string): void {
  if (
    fileName.length === 0 ||
    fileName !== fileName.trim() ||
    fileName.includes("/") ||
    fileName.includes("\\") ||
    fileName === "." ||
    fileName === ".."
  ) {
    throw new Error("Invalid asset filename.");
  }

  const lowerName = fileName.toLowerCase();
  const extension = lowerName.slice(lowerName.lastIndexOf("."));

  if (!allowedAssetExtensions.has(extension)) {
    throw new Error("Unsupported asset extension.");
  }
}

async function githubFetch(
  pathName: string,
  init: RequestInit = {},
): Promise<Response> {
  const { token } = requireGithubConfig();

  return fetch(`${githubApiBase}${pathName}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.headers ?? {}),
    },
  });
}

async function parseGithubError(response: Response): Promise<string> {
  const body = await response.text().catch(() => "");
  return body || `${response.status} ${response.statusText}`;
}

function contentApiPath(filePath: string): string {
  const { owner, repo } = requireGithubConfig();
  return `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${filePath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

async function readGithubFile(
  filePath: string,
): Promise<GithubFileResponse | null> {
  const { branch } = requireGithubConfig();
  const params = new URLSearchParams({ ref: branch });
  const response = await githubFetch(`${contentApiPath(filePath)}?${params}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `GitHub read failed for ${filePath}: ${await parseGithubError(response)}`,
    );
  }

  const file = (await response.json()) as GithubFileResponse | GithubContentEntry[];

  if (Array.isArray(file)) {
    throw new Error(`GitHub path is not a file: ${filePath}`);
  }

  return file;
}

export async function readGithubFileBytes(
  filePath: string,
): Promise<Uint8Array | null> {
  const file = await readGithubFile(filePath);

  if (!file) {
    return null;
  }

  if (file.encoding !== "base64") {
    throw new Error(`Unsupported GitHub file encoding: ${file.encoding}`);
  }

  return Buffer.from(file.content.replaceAll("\n", ""), "base64");
}

function decodeGithubFileContent(file: GithubFileResponse): string {
  if (file.encoding !== "base64") {
    throw new Error(`Unsupported GitHub file encoding: ${file.encoding}`);
  }

  return Buffer.from(file.content.replaceAll("\n", ""), "base64").toString(
    "utf8",
  );
}

async function listGithubDirectory(pathName: string): Promise<GithubContentEntry[]> {
  const { branch } = requireGithubConfig();
  const params = new URLSearchParams({ ref: branch });
  const response = await githubFetch(`${contentApiPath(pathName)}?${params}`);

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error(
      `GitHub directory read failed for ${pathName}: ${await parseGithubError(response)}`,
    );
  }

  const entries = (await response.json()) as GithubContentEntry | GithubContentEntry[];

  if (!Array.isArray(entries)) {
    throw new Error(`GitHub path is not a directory: ${pathName}`);
  }

  return entries;
}

export async function listGithubContentFiles(): Promise<GithubTreeEntry[]> {
  const { owner, repo, branch } = requireGithubConfig();
  const params = new URLSearchParams({ recursive: "1" });
  const response = await githubFetch(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?${params}`,
  );

  if (!response.ok) {
    throw new Error(
      `GitHub content tree read failed: ${await parseGithubError(response)}`,
    );
  }

  const tree = (await response.json()) as GithubTreeResponse;
  return tree.tree.filter(
    (entry) => entry.type === "blob" && entry.path.startsWith("content/"),
  );
}

async function githubFileSha(filePath: string): Promise<string | undefined> {
  return (await readGithubFile(filePath))?.sha;
}

async function writeGithubFile(input: {
  filePath: string;
  content: string;
  commitMessage: string;
  rawBase64?: boolean;
}): Promise<void> {
  const { branch } = requireGithubConfig();
  const sha = await githubFileSha(input.filePath);
  const response = await githubFetch(contentApiPath(input.filePath), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      branch,
      message: input.commitMessage,
      content: input.rawBase64
        ? input.content
        : Buffer.from(input.content).toString("base64"),
      sha,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `GitHub ${sha ? "update" : "create"} failed for ${input.filePath}: ${await parseGithubError(response)}`,
    );
  }
}

async function deleteGithubFile(
  filePath: string,
  commitMessage: string,
): Promise<void> {
  const { branch } = requireGithubConfig();
  const sha = await githubFileSha(filePath);

  if (!sha) {
    return;
  }

  const response = await githubFetch(contentApiPath(filePath), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      branch,
      message: commitMessage,
      sha,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `GitHub delete failed for ${filePath}: ${await parseGithubError(response)}`,
    );
  }
}

export function githubAssetPath(
  kind: ContentKind,
  slug: string,
  assetPath: string[],
): string {
  assertValidKind(kind);
  assertValidSlug(slug);

  if (assetPath.length !== 2 || assetPath[0] !== "images") {
    throw new Error("Invalid asset path.");
  }

  const fileName = assetPath[1];

  if (
    fileName.length === 0 ||
    fileName !== fileName.trim() ||
    fileName.includes("/") ||
    fileName.includes("\\") ||
    fileName === "." ||
    fileName === ".."
  ) {
    throw new Error("Invalid asset filename.");
  }

  const lowerName = fileName.toLowerCase();
  const extension = lowerName.slice(lowerName.lastIndexOf("."));

  if (!allowedPreviewExtensions.has(extension)) {
    throw new Error("Unsupported asset extension.");
  }

  return `content/${kindDir(kind)}/${slug}/images/${assetPath[1]}`;
}

export class GithubContentRepository implements ContentRepository {
  async list(kind: ContentKind): Promise<ContentSummary[]> {
    assertValidKind(kind);
    const entries = await listGithubDirectory(`content/${kindDir(kind)}`);
    const directories = entries.filter((entry) => entry.type === "dir");
    const summaries = await Promise.all(
      directories.map(async (entry): Promise<ContentSummary | null> => {
        const slug = entry.name;
        const raw = await this.read(kind, slug);

        if (!raw) {
          return null;
        }

        const parsed = matter(raw.raw);

        return {
          kind,
          slug,
          title: String(parsed.data.title ?? slug),
          description: parsed.data.description
            ? String(parsed.data.description)
            : undefined,
          published: Boolean(parsed.data.published),
          draft: Boolean(parsed.data.draft),
          updated: parsed.data.updated ? String(parsed.data.updated) : undefined,
        };
      }),
    );

    return summaries
      .filter((summary): summary is ContentSummary => summary !== null)
      .sort((a, b) => a.slug.localeCompare(b.slug));
  }

  async read(kind: ContentKind, slug: string): Promise<ContentFile | null> {
    const filePath = mdxFilePath(kind, slug);
    const file = await readGithubFile(filePath);

    if (!file) {
      return null;
    }

    return {
      kind,
      slug,
      path: filePath,
      raw: decodeGithubFileContent(file),
    };
  }

  async write(input: ContentWriteInput): Promise<void> {
    const filePath = mdxFilePath(input.kind, input.slug);
    const parsed = matter(input.raw);

    if (parsed.data.slug && parsed.data.slug !== input.slug) {
      throw new Error("Frontmatter slug must match the directory slug.");
    }

    await writeGithubFile({
      filePath,
      content: `${input.raw.trimEnd()}\n`,
      commitMessage: `content(${input.kind}): save ${input.slug}`,
    });
  }

  async delete(kind: ContentKind, slug: string): Promise<void> {
    await deleteGithubFile(
      mdxFilePath(kind, slug),
      `content(${kind}): delete ${slug}`,
    );
  }

  async writeAsset(
    input: ContentAssetWriteInput,
  ): Promise<ContentAssetWriteResult> {
    if (!allowedAssetMimeTypes.has(input.contentType)) {
      throw new Error("Unsupported asset MIME type.");
    }

    const filePath = assetFilePath(input.kind, input.slug, input.fileName);

    await writeGithubFile({
      filePath,
      content: Buffer.from(input.bytes).toString("base64"),
      rawBase64: true,
      commitMessage: `content(${input.kind}): upload asset ${input.slug}/${input.fileName}`,
    });

    return {
      fileName: input.fileName,
      markdownPath: `./images/${input.fileName}`,
      assetUrl: `/api/admin/content-asset/${input.kind}/${input.slug}/images/${input.fileName}`,
    };
  }
}

export const githubContentRepository = new GithubContentRepository();
