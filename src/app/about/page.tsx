import { AboutPage } from "@/features/pages/about";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({ title: "About", path: "/about" });

export default async function Page() {
  return <AboutPage />;
}
