import {
  Button,
  ContentStatusBadge,
  Link,
  PdaWindow,
  Text,
} from "@/components/ui/phosphor";
import type {
  ContentKind,
  ContentSummary,
} from "@/features/content/repositories/contentRepository";
import { deleteContentAction } from "../actions/content";
import styles from "../styles/Admin.module.scss";

function routeKind(kind: ContentKind) {
  return kind === "post" ? "posts" : kind === "project" ? "projects" : "pages";
}

export function ContentList({
  kind,
  items,
}: {
  kind: ContentKind;
  items: ContentSummary[];
}) {
  return (
    <div className={styles.stack}>
      <div className={styles.actions}>
        <Link href={`/admin/${routeKind(kind)}/new`}>new {kind}</Link>
      </div>

      {items.map((item) => (
        <PdaWindow key={item.slug} title={item.title} meta={item.slug}>
          <Text as="p" variant="body">
            {item.description}
          </Text>

          <div className={styles.actions}>
            <ContentStatusBadge
              status={item.draft || !item.published ? "draft" : "published"}
            />

            <Button
              variant="primary"
              size="sm"
              href={`/admin/${routeKind(kind)}/${item.slug}/edit`}
            >
              edit
            </Button>

            <form action={deleteContentAction}>
              <input type="hidden" name="kind" value={kind} />
              <input type="hidden" name="slug" value={item.slug} />

              <Button type="submit" variant="danger" size="sm">
                delete
              </Button>
            </form>
          </div>
        </PdaWindow>
      ))}
    </div>
  );
}
