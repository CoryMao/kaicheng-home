"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

export type ProfilePhoto = {
  src: string;
  alt: string;
};

export function ProfilePhotoGallery({
  photos,
  name,
}: {
  photos: ProfilePhoto[];
  name: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePhoto = photos[activeIndex] ?? photos[0];

  if (!activePhoto) {
    return null;
  }

  return (
    <div>
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-surface-alt">
        <Image
          src={activePhoto.src}
          alt={activePhoto.alt}
          fill
          loading="eager"
          sizes="(max-width: 640px) 128px, 160px"
          className="object-cover"
        />
      </div>
      <div className="mt-2 flex justify-start gap-2 w-full">
        {photos.map((photo, index) => (
          <button
            key={photo.src}
            type="button"
            className={cn(
              "relative size-7 overflow-hidden rounded-sm border bg-surface transition",
              index === activeIndex
                ? "border-accent ring-2 ring-accent/25"
                : "border-border hover:border-accent",
            )}
            aria-label={`Show ${name} photo ${index + 1}`}
            aria-pressed={index === activeIndex}
            onClick={() => setActiveIndex(index)}
          >
            <Image
              src={photo.src}
              alt=""
              fill
              sizes="28px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
