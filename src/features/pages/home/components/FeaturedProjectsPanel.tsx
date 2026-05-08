import { CourseCard, H2, Hr } from "@/components/ui/phosphor";
import type { CSSProperties } from "react";
import type { Project } from "@/features/content/types";
import styles from "../HomePage.module.scss";

export function FeaturedProjectsPanel({ projects }: { projects: Project[] }) {
  return (
    <section className={`pho-fade-up ${styles.section}`} style={{ "--i": 2 } as CSSProperties}>
      <H2>▸ projects on rotation</H2>
      <div className={`${styles.grid} pho-stagger`} style={{ marginTop: "1rem" }}>
        {projects.map((project, index) => (
          <CourseCard
            key={project.slug}
            stamp={`PROJECT-${String(index + 1).padStart(2, "0")}`}
            coverMeta={project.status}
            tag={project.techStack[0] ?? "PROJECT"}
            title={project.title}
            description={project.description}
            stats={project.techStack.join(" · ")}
            progress={{ value: project.featured ? 4 : 2, total: 6 }}
            cta={{ label: "OPEN ->", href: `/projects/${project.slug}` }}
          />
        ))}
      </div>
      <Hr />
    </section>
  );
}
