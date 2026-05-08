export type ContentKind = "post" | "project" | "page";

export type ContentBase = {
  slug: string;
  title: string;
  description: string;
  updated?: string;
  published: boolean;
  draft?: boolean;
  body: string;
  excerpt: string;
  filePath: string;
};

export type Post = ContentBase & {
  kind: "post";
  date: string;
  tags: string[];
  category?: string;
  series?: string;
  seriesTitle?: string;
  seriesOrder?: number;
  coverImage?: string;
  canonicalUrl?: string;
  featured: boolean;
  readingTime: string;
};

export type Project = ContentBase & {
  kind: "project";
  date: string;
  tags: string[];
  techStack: string[];
  repoUrl?: string;
  demoUrl?: string;
  coverImage?: string;
  media: string[];
  featured: boolean;
  status: "active" | "paused" | "archived" | "shipping" | "experiment";
};

export type ContentPage = ContentBase & {
  kind: "page";
};

export type Series = {
  slug: string;
  title: string;
  description?: string;
  posts: Post[];
  count: number;
  updated?: string;
};
