import { AdminFrame } from "@/features/admin/components/AdminFrame";
import { ContentEditorForm } from "@/features/admin/components/ContentEditorForm";
import { postTemplate } from "@/features/admin/components/templates";

export default function Page() {
  return <AdminFrame><ContentEditorForm kind="post" raw={postTemplate()} /></AdminFrame>;
}
