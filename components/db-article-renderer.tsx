import { MDXRemote } from "next-mdx-remote/rsc";
import type { ComponentPropsWithoutRef } from "react";

function MdxAnchor(props: ComponentPropsWithoutRef<"a">) {
  const isExternal = typeof props.href === "string" && /^https?:\/\//.test(props.href);
  return <a {...props} target={isExternal ? "_blank" : props.target} rel={isExternal ? "noreferrer" : props.rel} />;
}

function MdxImage(props: ComponentPropsWithoutRef<"img">) {
  return <img {...props} className={["my-8 w-full rounded-lg border border-border object-cover", props.className].filter(Boolean).join(" ")} alt={props.alt ?? ""} />;
}

const components = { a: MdxAnchor, img: MdxImage };

export function DbArticleRenderer({ source }: { source: string }) {
  return (
    <div className="prose prose-zinc mt-10 max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:font-semibold prose-a:text-accent prose-img:rounded-lg dark:prose-invert">
      <MDXRemote source={source} components={components} />
    </div>
  );
}
