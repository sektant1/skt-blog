import { notFound } from "next/navigation";
import { Link, PostHeader, PostLayout, Tag } from "@/components/ui/phosphor";
import { MdxRenderer } from "@/components/mdx/MdxRenderer";
import { JsonLd } from "@/components/seo/JsonLd";
import { getProjectBySlug } from "@/features/content/loaders/projects";
import { projectJsonLd } from "@/lib/seo/jsonLd";
import styles from "./ProjectDetailPage.module.scss";

export async function ProjectDetailPage({ slug }: { slug: string }) {
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  return (
    <PostLayout
      className={styles.stack}
      header={
        <PostHeader
          title={project.title}
          eyebrow={project.status}
          subtitle={project.description}
          date={project.date}
          updated={project.updated}
          tags={[...project.tags, ...project.techStack]}
        />
      }
    >
      <JsonLd data={projectJsonLd(project)} />
      <div className={styles.meta}>{project.techStack.map((tech) => <Tag key={tech}>{tech}</Tag>)}</div>
      <div className={styles.links}>
        {project.repoUrl ? <Link href={project.repoUrl}>repository</Link> : null}
        {project.demoUrl ? <Link href={project.demoUrl}>demo</Link> : null}
      </div>
      <MdxRenderer source={project.body} />
    </PostLayout>
  );
}
