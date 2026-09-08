import Image from "next/image";

import { cn } from "@/lib/utils";

type SocialLink = {
  label: string;
  href: string;
};

type SocialLinksProps = {
  links: SocialLink[];
  className?: string;
  showLabels?: boolean;
};

const socialIcons: Record<string, { src: string; invertInDark?: boolean }> = {
  GitHub: {
    src: "/media/social/github.svg",
    invertInDark: true,
  },
  Instagram: {
    src: "/media/social/instagram.svg",
  },
  LinkedIn: {
    src: "/media/social/linkedin.svg",
  },
};

export function SocialLinks({
  links,
  className,
  showLabels = false,
}: SocialLinksProps) {
  const socialLinks = links.filter(
    (link) => link.href !== "#" && socialIcons[link.label],
  );

  if (socialLinks.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {socialLinks.map((link) => {
        const icon = socialIcons[link.label];

        return (
          <a
            key={link.label}
            href={link.href}
            target={link.href.startsWith("http") ? "_blank" : undefined}
            rel={link.href.startsWith("http") ? "noreferrer" : undefined}
            aria-label={link.label}
            title={link.label}
            className={cn(
              "inline-flex items-center justify-center rounded-sm text-muted opacity-75 transition hover:opacity-100",
              showLabels ? "h-10 gap-2 px-3 text-[15px]" : "size-10",
            )}
          >
            <Image
              src={icon.src}
              alt=""
              width={20}
              height={20}
              aria-hidden="true"
              unoptimized
              className={cn("size-5", icon.invertInDark && "dark:invert")}
            />
            {showLabels ? <span>{link.label}</span> : null}
          </a>
        );
      })}
    </div>
  );
}
