import { AdminFrame } from "@/features/admin/components/AdminFrame";
import { ContentEditorForm } from "@/features/admin/components/ContentEditorForm";
import { projectTemplate } from "@/features/admin/components/templates";

export default function Page() {
  return <AdminFrame><ContentEditorForm kind="project" raw={projectTemplate()} /></AdminFrame>;
}
