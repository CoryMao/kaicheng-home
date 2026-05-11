"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "bg-opacity";

export function BgOpacityControl() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return 7;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? Number(saved) : 7;
  });
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    rootRef.current = document.documentElement;
    rootRef.current.style.setProperty("--bg-opacity", String(value / 100));
    localStorage.setItem(STORAGE_KEY, String(value));
  }, [value]);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {open ? (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface/90 p-3 shadow-lg backdrop-blur">
          <label className="text-xs font-medium text-muted whitespace-nowrap">
            BG {value}%
          </label>
          <input
            type="range"
            min="0"
            max="30"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="h-1 w-24 cursor-pointer accent-accent"
          />
          <button
            onClick={() => setOpen(false)}
            className="text-xs text-muted hover:text-foreground"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full border border-border bg-surface/80 p-2 shadow-md transition hover:bg-surface"
          aria-label="Background opacity"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        </button>
      )}
    </div>
  );
}
