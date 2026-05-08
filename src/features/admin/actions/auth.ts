"use server";

import { redirect } from "next/navigation";
import {
  assertLocalAdminAllowed,
  createAdminSession,
  destroyAdminSession,
  verifyAdminPassword,
} from "@/lib/auth/session";
import { registerAdminUser } from "@/lib/auth/adminUsers";

export async function loginAction(
  _state: string | null,
  formData: FormData,
): Promise<string | null> {
  await assertLocalAdminAllowed();

  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!(await verifyAdminPassword(username, password))) {
    return "Invalid credentials or missing admin environment variables.";
  }

  await createAdminSession(username);
  redirect("/admin/dashboard");
}

export async function registerAction(
  _state: string | null,
  formData: FormData,
): Promise<string | null> {
  await assertLocalAdminAllowed();

  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  const result = await registerAdminUser({
    username,
    password,
    passwordConfirm,
  });

  if (!result.ok) {
    return result.error;
  }

  await createAdminSession(result.username);
  redirect("/admin/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroyAdminSession();
  redirect("/admin/login");
}
