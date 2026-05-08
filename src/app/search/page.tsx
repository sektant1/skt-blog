import { SearchPage } from "@/features/pages/search";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({ title: "Search", path: "/search" });

export default function Page() {
  return <SearchPage />;
}
