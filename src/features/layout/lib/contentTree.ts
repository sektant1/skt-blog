import fs from "node:fs/promises";
import path from "node:path";
import { contentDir } from "@/features/content/paths";

export type TreeNode =
  | { kind: "leaf"; label: string; href?: string; active?: boolean }
  | { kind: "dir"; label: string; children?: TreeNode[]; defaultOpen?: boolean };

const contentRoutePrefixes: Record<string, string> = {
  posts: "/blog",
  projects: "/projects",
  pages: "",
  courses: "/courses"
};

const pageRouteAliases: Record<string, string> = {
  home: "/"
};

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listDir(dir: string) {
  return fs.readdir(dir, { withFileTypes: true }).catch(() => []);
}

function hrefForContent(type: string, slug: string): string | undefined {
  if (type === "courses") return undefined;
  if (type === "pages") return pageRouteAliases[slug] ?? `/${slug}`;
  const prefix = contentRoutePrefixes[type];
  return prefix ? `${prefix}/${slug}` : undefined;
}

async function buildAssetChildren(entryDir: string): Promise<TreeNode[]> {
  const entries = await listDir(entryDir);
  const children: TreeNode[] = [];
  for (const entry of entries) {
    if (entry.name === "index.mdx" || entry.name === "index.md") continue;
    if (entry.isDirectory()) {
      const nested = await buildAssetChildren(path.join(entryDir, entry.name));
      if (nested.length > 0) {
        children.push({ kind: "dir", label: `${entry.name}/`, children: nested, defaultOpen: false });
      }
      continue;
    }

    if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
      children.push({ kind: "leaf", label: entry.name });
    }
  }
  return children.sort((a, b) => a.label.localeCompare(b.label));
}

async function buildContentTypeNode(type: string): Promise<TreeNode> {
  const typeDir = path.join(contentDir, type);
  const entries = await listDir(typeDir);
  const children: TreeNode[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
        children.push({ kind: "leaf", label: entry.name });
      }
      continue;
    }

    const entryDir = path.join(typeDir, entry.name);
    const mdx = path.join(entryDir, "index.mdx");
    const md = path.join(entryDir, "index.md");
    const hasIndex = (await exists(mdx)) || (await exists(md));
    const assetChildren = await buildAssetChildren(entryDir);

    if (hasIndex && assetChildren.length === 0) {
      children.push({
        kind: "leaf",
        label: `${entry.name}.mdx`,
        href: hrefForContent(type, entry.name)
      });
      continue;
    }

    children.push({
      kind: "dir",
      label: hasIndex ? `${entry.name}.mdx` : `${entry.name}/`,
      defaultOpen: false,
      children: assetChildren
    });
  }

  return {
    kind: "dir",
    label: `${type}/`,
    defaultOpen: ["pages", "posts", "projects"].includes(type),
    children: children.sort((a, b) => a.label.localeCompare(b.label))
  };
}

export async function buildNerdTree(): Promise<TreeNode[]> {
  const contentTypes = await listDir(contentDir);
  const typeDirs = contentTypes
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => name !== "pages")
    .sort((a, b) => {
      const order = ["posts", "projects", "courses"];
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      return a.localeCompare(b);
    });

  return [
    {
      kind: "dir",
      label: "content/",
      defaultOpen: true,
      children: await Promise.all(typeDirs.map(buildContentTypeNode))
    },
    {
      kind: "dir",
      label: ".meta/",
      defaultOpen: false,
      children: [
        { kind: "leaf", label: "search-index.json", href: "/search" },
        { kind: "leaf", label: "sitemap.xml", href: "/sitemap.xml" },
        { kind: "leaf", label: "robots.txt", href: "/robots.txt" }
      ]
    }
  ];
}
