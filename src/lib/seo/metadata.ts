import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";

type MetaInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
};

export function absoluteUrl(path = "/"): string {
  return new URL(path, siteConfig.url).toString();
}

export function buildMetadata(input: MetaInput = {}): Metadata {
  const title = input.title ? `${input.title} | ${siteConfig.name}` : siteConfig.title;
  const description = input.description ?? siteConfig.description;
  const url = absoluteUrl(input.path ?? "/");
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type: input.type ?? "website",
      images: input.image ? [{ url: input.image }] : undefined,
      publishedTime: input.publishedTime,
      modifiedTime: input.modifiedTime
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}
