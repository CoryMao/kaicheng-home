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
