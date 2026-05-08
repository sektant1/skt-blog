import { Button, FormField, Input, Textarea } from "@/components/ui/phosphor";
import type { ContentKind } from "@/features/content/repositories/contentRepository";
import { saveContentAction } from "../actions/content";
import styles from "../styles/Admin.module.scss";

export function ContentEditorForm({ kind, slug, raw }: { kind: ContentKind; slug?: string; raw: string }) {
  return (
    <form action={saveContentAction}>
      <input type="hidden" name="kind" value={kind} />
      <FormField label="Slug"><Input name="slug" defaultValue={slug} placeholder="kebab-case-slug" /></FormField>
      <FormField label="Raw MDX"><Textarea className={styles.editor} name="raw" defaultValue={raw} /></FormField>
      <Button type="submit">save {kind}</Button>
    </form>
  );
}
