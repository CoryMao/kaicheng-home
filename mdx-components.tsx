import type { ComponentPropsWithoutRef } from "react";
import type { MDXComponents } from "mdx/types";

function MdxAnchor(props: ComponentPropsWithoutRef<"a">) {
  const isExternal =
    typeof props.href === "string" && /^https?:\/\//.test(props.href);

  return (
    <a
      {...props}
      target={isExternal ? "_blank" : props.target}
      rel={isExternal ? "noreferrer" : props.rel}
    />
  );
}

function MdxImage(props: ComponentPropsWithoutRef<"img">) {
  return (
    // MDX prose images can have arbitrary dimensions, so keep them as regular
    // content images instead of forcing next/image width and height.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      className={[
        "my-8 w-full rounded-lg border border-border object-cover",
        props.className,
      ]
        .filter(Boolean)
        .join(" ")}
      alt={props.alt ?? ""}
    />
  );
}

const components = {
  a: MdxAnchor,
  img: MdxImage,
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return components;
}
