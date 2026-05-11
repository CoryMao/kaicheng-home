"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

function resolveTheme(t: Theme): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  if (t === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return t;
}

function applyTheme(t: Theme) {
  const resolved = resolveTheme(t);
  const root = document.documentElement;
  // Prevent CSS transitions from firing during theme switch
  root.classList.add("no-transition");
  root.classList.toggle("dark", resolved === "dark");
  // Force reflow so the no-transition class takes effect, then remove it
  void root.offsetHeight;
  root.classList.remove("no-transition");
}

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
} | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, _setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem("theme") as Theme) || "system";
    _setTheme(stored);
    setMounted(true);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    _setTheme(t);
    localStorage.setItem("theme", t);
    applyTheme(t);
  }, []);

  // Sync with system preference changes when theme is "system"
  useEffect(() => {
    if (!mounted) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (
        (localStorage.getItem("theme") as Theme | null) === "system" ||
        !localStorage.getItem("theme")
      ) {
        applyTheme("system");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
