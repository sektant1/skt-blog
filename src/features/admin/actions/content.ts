"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth/session";
import { assertValidSlug } from "@/features/content/paths";
import { getContentRepository } from "@/features/content/repositories/getContentRepository";
import { triggerVercelDeployHook } from "@/lib/vercel/triggerDeployHook";
import type { ContentKind } from "@/features/content/repositories/contentRepository";

async function requireAdmin(): Promise<void> {
  if (!(await getAdminUser())) redirect("/admin/login");
}

function kindPath(kind: ContentKind): string {
  if (kind === "post") return "posts";
  if (kind === "project") return "projects";
  return "pages";
}

export async function saveContentAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const kind = String(formData.get("kind")) as ContentKind;
  const slug = String(formData.get("slug") ?? "");
  const raw = String(formData.get("raw") ?? "");
  assertValidSlug(slug);
  await getContentRepository().write({ kind, slug, raw });
  revalidatePath("/");
  await triggerVercelDeployHook();
  redirect(`/admin/${kindPath(kind)}`);
}

export async function deleteContentAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const kind = String(formData.get("kind")) as ContentKind;
  const slug = String(formData.get("slug") ?? "");
  await getContentRepository().delete(kind, slug);
  revalidatePath("/");
  await triggerVercelDeployHook();
  redirect(`/admin/${kindPath(kind)}`);
}
