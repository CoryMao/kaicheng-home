"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const themeOrder = ["system", "light", "dark"] as const;

const themeLabels: Record<(typeof themeOrder)[number], string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  const currentTheme = themeOrder.includes(theme as (typeof themeOrder)[number])
    ? (theme as (typeof themeOrder)[number])
    : "system";
  const nextTheme =
    themeOrder[(themeOrder.indexOf(currentTheme) + 1) % themeOrder.length];
  const Icon = !mounted
    ? Monitor
    : currentTheme === "light"
      ? Sun
      : currentTheme === "dark"
        ? Moon
        : Monitor;

  return (
    <button
      type="button"
      className="inline-flex size-10 items-center justify-center rounded-md border border-border bg-surface text-foreground transition hover:border-accent hover:text-accent"
      aria-label={`Theme: ${themeLabels[currentTheme]}. Switch to ${themeLabels[nextTheme]}.`}
      title={`Theme: ${themeLabels[currentTheme]}. Switch to ${themeLabels[nextTheme]}.`}
      onClick={() => setTheme(nextTheme)}
    >
      <Icon aria-hidden="true" className="size-4" />
    </button>
  );
}
