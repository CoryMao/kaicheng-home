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
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-border bg-surface-alt">
        <Image
          src={activePhoto.src}
          alt={activePhoto.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 420px"
          className="object-cover"
        />
      </div>
      <div className="mt-3 flex justify-center gap-2">
        {photos.map((photo, index) => (
          <button
            key={photo.src}
            type="button"
            className={cn(
              "relative size-12 overflow-hidden rounded-md border bg-surface transition",
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
              sizes="48px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
