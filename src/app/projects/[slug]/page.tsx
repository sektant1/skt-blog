import { notFound } from "next/navigation";
import { ProjectDetailPage } from "@/features/pages/project-detail";
import { getAllProjects, getProjectBySlug } from "@/features/content/loaders/projects";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateStaticParams() {
  return (await getAllProjects()).map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  return buildMetadata({ title: project.title, description: project.description, path: `/projects/${project.slug}` });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProjectDetailPage slug={slug} />;
}
