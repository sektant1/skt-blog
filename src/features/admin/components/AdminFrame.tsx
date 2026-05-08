import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth/session";
import { localContentRepository } from "@/features/content/repositories/localContentRepository";
import { logoutAction } from "../actions/auth";
import { AdminFrameShell } from "./AdminFrameShell";

export async function AdminFrame({ children }: { children: ReactNode }) {
  const user = await getAdminUser();

  if (!user) {
    redirect("/admin/login");
  }

  const [posts, projects] = await Promise.all([
    localContentRepository.list("post"),
    localContentRepository.list("project"),
  ]);

  return (
    <AdminFrameShell
      userName={user.username}
      posts={posts}
      projects={projects}
      onLogout={logoutAction}
    >
      {children}
    </AdminFrameShell>
  );
}
