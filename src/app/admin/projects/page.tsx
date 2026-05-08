import { AdminFrame } from "@/features/admin/components/AdminFrame";
import { ContentList } from "@/features/admin/components/ContentList";
import { localContentRepository } from "@/features/content/repositories/localContentRepository";

export default async function Page() {
  return <AdminFrame><ContentList kind="project" items={await localContentRepository.list("project")} /></AdminFrame>;
}
