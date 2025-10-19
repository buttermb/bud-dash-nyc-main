import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light"); // Start with stable default
  const [mounted, setMounted] = useState(false);

  // Load theme after mount to prevent hydration mismatch
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    let loadedTheme: Theme = "light";
    
    if (stored === "light" || stored === "dark") {
      loadedTheme = stored;
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      loadedTheme = "dark";
    }
    
    setTheme(loadedTheme);
    setMounted(true);
    console.log('[Theme] Loaded:', loadedTheme);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
    console.log('[Theme] Applied:', theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
