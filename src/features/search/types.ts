export type SearchDocument = {
  id: string;
  type: "post" | "project";
  title: string;
  description: string;
  slug: string;
  href: string;
  tags: string[];
  series?: string;
  bodyExcerpt: string;
  date: string;
};
