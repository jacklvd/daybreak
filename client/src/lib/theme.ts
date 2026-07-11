import React from "react";

export type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    const saved = window.localStorage.getItem("db-theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("db-theme", theme);
  }, [theme]);

  return { theme, toggle: () => setTheme(current => (current === "dark" ? "light" : "dark")) };
}
