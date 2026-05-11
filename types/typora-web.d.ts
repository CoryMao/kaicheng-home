declare module "typora-web" {
  export function createEditor(
    element: HTMLElement,
    options?: {
      initialContent?: string;
      onChange?: (markdown: string) => void;
      onFocus?: () => void;
      onBlur?: () => void;
    },
  ): {
    getMarkdown: () => string;
    setMarkdown: (md: string) => void;
    toggleSource: () => void;
    isSourceMode: () => boolean;
    focus: () => void;
    destroy: () => void;
    view: unknown;
  };
}

declare module "typora-web/widgets.css";
declare module "typora-web/theme-typora.css";

declare module "canvas-confetti" {
  interface ConfettiOptions {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    shapes?: string[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }
  function confetti(options?: ConfettiOptions): Promise<null>;
  export = confetti;
}
