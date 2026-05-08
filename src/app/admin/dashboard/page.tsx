import { AdminFrame } from "@/features/admin/components/AdminFrame";
import { AdminDashboardCards } from "@/features/admin/components/AdminDashboardCards";
import { localContentRepository } from "@/features/content/repositories/localContentRepository";

export default async function Page() {
  const [posts, projects] = await Promise.all([
    localContentRepository.list("post"),
    localContentRepository.list("project"),
  ]);

  return (
    <AdminFrame>
      <AdminDashboardCards
        postsCount={posts.length}
        projectsCount={projects.length}
      />
    </AdminFrame>
  );
}
