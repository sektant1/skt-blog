import type { MDXComponents } from "mdx/types";
import { mdxComponentMap } from "@/components/mdx/mdxComponentMap";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...mdxComponentMap,
    ...components
  };
}
