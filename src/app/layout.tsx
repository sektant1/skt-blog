import type { Metadata } from "next";
import "@sektant1/phosphor-ui/tokens.css";
import "@sektant1/phosphor-ui/global.css";
import "@/styles/phosphor-components.css";
import "@/styles/globals.scss";
import { AppShell } from "@/features/layout/components/AppShell";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
