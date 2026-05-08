import { redirect } from "next/navigation";
import { AdminShell } from "@/components/ui/phosphor";
import { getAdminUser } from "@/lib/auth/session";
import { logoutAction } from "../actions/auth";

const nav = [
  { label: "dashboard", href: "/admin/dashboard", glyph: ">" },
  { label: "posts", href: "/admin/posts", glyph: "#" },
  { label: "projects", href: "/admin/projects", glyph: "*" }
];

export async function AdminFrame({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return (
    <AdminShell title="hideout admin" nav={nav} user={{ name: user.username, role: "local" }} onLogout={logoutAction}>
      {children}
    </AdminShell>
  );
}
