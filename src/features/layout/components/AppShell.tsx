import { CrtShell, Footer, Header, NerdTree } from "@/components/ui/phosphor";
import { buildNerdTree } from "../lib/contentTree";
import styles from "../styles/AppShell.module.scss";

const nav = [
  { label: "home", href: "/" },
  { label: "blog", href: "/blog" },
  { label: "projects", href: "/projects" },
  { label: "series", href: "/series" },
  { label: "search", href: "/search" },
  { label: "about", href: "/about" }
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const tree = await buildNerdTree();
  return (
    <CrtShell>
      <div className={styles.shell}>
        <Header
          title="sektant's hideout"
          homeHref="/"
          tagline="// personal technical archive // single-channel notes"
          align="center"
          nav={nav}
          locales={[
            { code: "en", label: "EN", href: "/", active: true },
            { code: "local", label: "LOCAL", href: "/admin/login" }
          ]}
        />
        <div className={styles.layout}>
          <aside className={styles.aside}>
            <NerdTree
              title="~/hideout"
              bufferLabel="[content/]"
              hint="γ-2 // local archive"
              command=":NERDTree"
              footerMeta="mdx files · static index"
              tree={tree}
            />
          </aside>
          <main className={`${styles.main} pho-page-enter`}>{children}</main>
        </div>
      </div>
      <Footer
        brand="sektant's hideout"
        year={2026}
        links={[
          { label: "rss later", href: "#" },
          { label: "search", href: "/search" },
          { label: "admin", href: "/admin/login" }
        ]}
        status={{ label: "link", value: "STABLE" }}
        prompt="~/hideout $"
        command="logout"
      />
    </CrtShell>
  );
}
