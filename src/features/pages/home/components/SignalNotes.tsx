import { AsciiBanner, H2, Link, Tag, Text } from "@/components/ui/phosphor";
import type { CSSProperties } from "react";
import type { Series } from "@/features/content/types";
import styles from "../HomePage.module.scss";

export function SignalNotes({ series }: { series: Series[] }) {
  return (
    <section className={`pho-fade-up pho-stagger ${styles.section}`} style={{ "--i": 3 } as CSSProperties}>
      <H2>currently hacking on</H2>
      <Text variant="body" className={styles.intro}>
        Keeping the archive static, file-based, and easy to replace.
      </Text>
      <div className={styles.cluster}>
        {series.map((item) => <Tag key={item.slug} href={`/series/${item.slug}`}>{item.title}</Tag>)}
        <Tag href="/search">search index</Tag>
      </div>
      <Text as="p"><Link href="/about">about the operator</Link></Text>
      <AsciiBanner art="// HIDEOUT // CHANNEL 0x53 // LOCAL ARCHIVE //" fallback="HIDEOUT" />
    </section>
  );
}
