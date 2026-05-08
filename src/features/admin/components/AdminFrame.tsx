import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth/session";
import { AdminFrameShell } from "./AdminFrameShell";

export async function AdminFrame({ children }: { children: ReactNode }) {
  const user = await getAdminUser();

  if (!user) {
    redirect("/admin/login");
  }

  return <AdminFrameShell userName={user.username}>{children}</AdminFrameShell>;
}
