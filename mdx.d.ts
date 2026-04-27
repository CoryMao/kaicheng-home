declare module "*.mdx" {
  import type { ComponentType } from "react";
  import type { MDXProps } from "mdx/types";

  import type { ArticleMetadata } from "@/lib/content-types";

  export const metadata: ArticleMetadata;

  const MDXComponent: ComponentType<MDXProps>;
  export default MDXComponent;
}
