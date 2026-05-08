"use client";

import type { ReactNode } from "react";
import { AdminShell } from "@/components/ui/phosphor";
import { logoutAction } from "../actions/auth";

const nav = [
  { label: "dashboard", href: "/admin/dashboard", glyph: ">" },
  { label: "posts", href: "/admin/posts", glyph: "#" },
  { label: "projects", href: "/admin/projects", glyph: "*" },
];

type AdminFrameShellProps = {
  children: ReactNode;
  userName: string;
};

export function AdminFrameShell({ children, userName }: AdminFrameShellProps) {
  return (
    <AdminShell
      title="hideout admin"
      nav={nav}
      user={{ name: userName, role: "local" }}
      onLogout={logoutAction}
    >
      {children}
    </AdminShell>
  );
}
