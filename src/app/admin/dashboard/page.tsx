import { PdaWindow } from "@/components/ui/phosphor";
import { AdminFrame } from "@/features/admin/components/AdminFrame";
import { localContentRepository } from "@/features/content/repositories/localContentRepository";
import styles from "@/features/admin/styles/Admin.module.scss";

export default async function Page() {
  const [posts, projects] = await Promise.all([localContentRepository.list("post"), localContentRepository.list("project")]);
  return (
    <AdminFrame>
      <div className={styles.grid}>
        <PdaWindow title="posts" meta={`${posts.length} total`}>Create, edit, delete, and draft local MDX posts.</PdaWindow>
        <PdaWindow title="projects" meta={`${projects.length} total`}>Maintain visual portfolio cards and README-like detail pages.</PdaWindow>
        <PdaWindow title="storage" meta="filesystem">All writes go through ContentRepository.</PdaWindow>
      </div>
    </AdminFrame>
  );
}
