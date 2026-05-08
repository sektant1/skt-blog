"use client";

import { PdaWindow } from "@/components/ui/phosphor";
import styles from "../styles/Admin.module.scss";

type AdminDashboardCardsProps = {
  postsCount: number;
  projectsCount: number;
};

export function AdminDashboardCards({
  postsCount,
  projectsCount,
}: AdminDashboardCardsProps) {
  return (
    <div className={styles.grid}>
      <PdaWindow title="posts" meta={`${postsCount} total`}>
        Create, edit, delete, and draft local MDX posts.
      </PdaWindow>

      <PdaWindow title="projects" meta={`${projectsCount} total`}>
        Maintain visual portfolio cards and README-like detail pages.
      </PdaWindow>

      <PdaWindow title="storage" meta="filesystem">
        All writes go through ContentRepository.
      </PdaWindow>
    </div>
  );
}
