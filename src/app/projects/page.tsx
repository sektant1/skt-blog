import { ProjectsIndexPage } from "@/features/pages/projects-index";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({ title: "Projects", path: "/projects" });

export default async function Page() {
  return <ProjectsIndexPage />;
}
