import { H1 } from "@/components/ui/phosphor";
import { MdxRenderer } from "@/components/mdx/MdxRenderer";
import { getPageBySlug } from "@/features/content/loaders/pages";
import styles from "./AboutPage.module.scss";

export async function AboutPage() {
  const page = await getPageBySlug("about");
  return (
    <section className={styles.stack}>
      <H1>{page?.title ?? "about"}</H1>
      <MdxRenderer source={page?.body ?? "About page content missing."} />
    </section>
  );
}
