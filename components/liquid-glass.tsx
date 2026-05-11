"use client";

import type { CSSProperties, ReactNode } from "react";

type LiquidGlassProps = {
  children: ReactNode;
  className?: string;
  cornerRadius?: number;
  /** Blur intensity. Maps to backdrop-filter blur: ~blurAmount × 30 px. Default 10 → ~300px. */
  blurAmount?: number;
  onClick?: () => void;
};

export function LiquidGlass({
  children,
  className = "",
  cornerRadius = 20,
  blurAmount = 10,
  onClick,
}: LiquidGlassProps) {
  const radius = `${cornerRadius}px`;
  // Match the original package's formula: (12 + blurAmount * 32)px
  const cssBlur = 12 + blurAmount * 32;

  const containerStyle: CSSProperties = {
    borderRadius: radius,
    backdropFilter: `blur(${cssBlur}px) saturate(1.8) brightness(1.05)`,
    WebkitBackdropFilter: `blur(${cssBlur}px) saturate(1.8) brightness(1.05)`,
    boxShadow: [
      "inset 0 1px 0 rgba(255,255,255,0.35)",
      "inset 0 -1px 0 rgba(0,0,0,0.04)",
      "0 4px 24px rgba(0,0,0,0.05)",
    ].join(", "),
    border: "1px solid rgba(255,255,255,0.2)",
  };

  // Diagonal specular highlight — simulates light bending across the glass surface
  const highlightStyle: CSSProperties = {
    borderRadius: radius,
    background: [
      "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.04) 30%, transparent 55%, rgba(255,255,255,0.05) 100%)",
    ].join(", "),
    pointerEvents: "none" as const,
  };

  // Edge ring: brighter near the top-left, dimmer bottom-right
  const edgeGlowStyle: CSSProperties = {
    borderRadius: radius,
    background: [
      "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.03) 100%)",
    ].join(", "),
    pointerEvents: "none" as const,
  };

  const baseClass = [
    "relative overflow-hidden",
    // Very transparent base — the blur + saturate does the heavy lifting
    "bg-white/20 dark:bg-white/5",
    "transition-all duration-300",
    "hover:bg-white/30 dark:hover:bg-white/8",
    "outline-none",
    "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      <div aria-hidden="true" className="absolute inset-0" style={highlightStyle} />
      <div aria-hidden="true" className="absolute inset-0" style={edgeGlowStyle} />
      <div className="relative z-10">{children}</div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        style={containerStyle}
        className={baseClass}
        onClick={onClick}
      >
        {inner}
      </button>
    );
  }

  return (
    <div style={containerStyle} className={baseClass}>
      {inner}
    </div>
  );
}
