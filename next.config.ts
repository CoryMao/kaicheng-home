import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
};

// Turbopack requires remark/rehype plugins to be referenced by name (with
// serializable options), because plugin functions cannot cross into Rust.
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm", "remark-math"],
    rehypePlugins: [["rehype-katex", { throwOnError: false }]],
  },
});

export default withMDX(nextConfig);
