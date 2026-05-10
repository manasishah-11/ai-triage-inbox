import { create } from "zustand";

export type Theme = "light" | "dark";

function applyThemeClass(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

type ThemeState = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "dark",
  toggleTheme: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    set({ theme: next });
    applyThemeClass(next);
  },
  setTheme: (theme) => {
    set({ theme });
    applyThemeClass(theme);
  },
}));
