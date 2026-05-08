import { notFound } from "next/navigation";
import { AdminFrame } from "@/features/admin/components/AdminFrame";
import { ContentEditorForm } from "@/features/admin/components/ContentEditorForm";
import { localContentRepository } from "@/features/content/repositories/localContentRepository";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const file = await localContentRepository.read("project", slug);
  if (!file) notFound();
  return <AdminFrame><ContentEditorForm kind="project" slug={slug} raw={file.raw} /></AdminFrame>;
}
