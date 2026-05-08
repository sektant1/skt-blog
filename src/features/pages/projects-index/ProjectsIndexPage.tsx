import { H1, Link, PdaWindow, Tag, Text } from "@/components/ui/phosphor";
import { getAllProjects } from "@/features/content/loaders/projects";
import styles from "./ProjectsIndexPage.module.scss";

export async function ProjectsIndexPage() {
  const projects = await getAllProjects();
  return (
    <section>
      <H1>projects</H1>
      <div className={styles.grid}>
        {projects.map((project) => (
          <PdaWindow key={project.slug} title={project.title} meta={project.status}>
            <article className={styles.card}>
              <div className={styles.media}>{project.coverImage ?? "visual pending"}</div>
              <Text as="p" variant="body">{project.description}</Text>
              <div className={styles.tags}>{project.techStack.map((tech) => <Tag key={tech}>{tech}</Tag>)}</div>
              <div className={styles.links}>
                <Link href={`/projects/${project.slug}`}>detail</Link>
                {project.repoUrl ? <Link href={project.repoUrl}>repo</Link> : null}
                {project.demoUrl ? <Link href={project.demoUrl}>demo</Link> : null}
              </div>
            </article>
          </PdaWindow>
        ))}
      </div>
    </section>
  );
}
