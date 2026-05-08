"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { AdminShell } from "@/components/ui/phosphor";
import type { ContentSummary } from "@/features/content/repositories/contentRepository";
import type { NerdTreeNode } from "@sektant1/phosphor-ui";

type AdminFrameShellProps = {
  children: ReactNode;
  userName: string;
  posts: ContentSummary[];
  projects: ContentSummary[];
  onLogout: () => void | Promise<void>;
};

function contentLabel(item: ContentSummary): string {
  const state = item.draft || !item.published ? "○" : "●";
  return `${state} ${item.title || item.slug}`;
}

function buildContentLeaves(
  items: ContentSummary[],
  hrefFor: (slug: string) => string,
  pathname: string,
): NerdTreeNode[] {
  if (items.length === 0) {
    return [
      {
        kind: "leaf",
        label: "[empty]",
      },
    ];
  }

  return items.map((item) => {
    const href = hrefFor(item.slug);

    return {
      kind: "leaf",
      label: contentLabel(item),
      href,
      active: pathname === href,
    };
  });
}

export function AdminFrameShell({
  children,
  userName,
  posts,
  projects,
  onLogout,
}: AdminFrameShellProps) {
  const pathname = usePathname();

  const tree = useMemo<NerdTreeNode[]>(
    () => [
      {
        kind: "dir",
        label: "admin",
        defaultOpen: true,
        children: [
          {
            kind: "leaf",
            label: "> dashboard",
            href: "/admin/dashboard",
            active: pathname === "/admin/dashboard",
          },
          {
            kind: "leaf",
            label: "+ new note",
            href: "/admin/posts/new",
            active: pathname === "/admin/posts/new",
          },
          {
            kind: "leaf",
            label: "+ new project",
            href: "/admin/projects/new",
            active: pathname === "/admin/projects/new",
          },
        ],
      },
      {
        kind: "dir",
        label: `notes`,
        defaultOpen: true,
        children: buildContentLeaves(
          posts,
          (slug) => `/admin/posts/${slug}/edit`,
          pathname,
        ),
      },
      {
        kind: "dir",
        label: `projects`,
        defaultOpen: true,
        children: buildContentLeaves(
          projects,
          (slug) => `/admin/projects/${slug}/edit`,
          pathname,
        ),
      },
    ],
    [pathname, posts, projects],
  );

  return (
    <AdminShell
      title="hideout admin"
      tree={tree}
      treeTitle="hideout admin"
      treeBufferLabel="[content/]"
      treeHint="● published  ○ draft"
      treeCommand=":edit content"
      user={{ name: userName, role: "local" }}
      onLogout={onLogout}
    >
      {children}
    </AdminShell>
  );
}
