import { SearchClient } from "@/features/search/components/SearchClient";
import styles from "./SearchPage.module.scss";

export function SearchPage() {
  return (
    <section className={styles.wrap}>
      <SearchClient />
    </section>
  );
}
