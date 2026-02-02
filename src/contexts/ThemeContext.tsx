import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeColor = "green" | "pink" | "blue" | "black";

interface ThemeContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme color definitions - each theme has light and dark mode variants
const themeColors: Record<ThemeColor, { light: Record<string, string>; dark: Record<string, string> }> = {
  green: {
    light: {
      "--primary": "157 54% 33%",
      "--primary-foreground": "0 0% 100%",
      "--ring": "157 54% 33%",
      "--accent": "157 40% 92%",
      "--accent-foreground": "157 54% 25%",
      "--success": "157 54% 33%",
      "--success-foreground": "0 0% 100%",
      "--sidebar-primary": "157 54% 33%",
      "--sidebar-primary-foreground": "0 0% 100%",
      "--sidebar-accent": "157 35% 93%",
      "--sidebar-accent-foreground": "157 54% 25%",
      "--sidebar-ring": "157 54% 33%",
      "--gradient-primary": "linear-gradient(135deg, hsl(157 54% 33%) 0%, hsl(157 45% 40%) 100%)",
      "--gradient-success": "linear-gradient(135deg, hsl(157 54% 33%) 0%, hsl(157 45% 40%) 100%)",
      "--shadow-glow-primary": "0 4px 20px -4px hsl(157 54% 33% / 0.3)",
      "--shadow-glow-success": "0 4px 20px -4px hsl(157 54% 33% / 0.3)",
    },
    dark: {
      "--primary": "157 54% 40%",
      "--primary-foreground": "200 20% 8%",
      "--ring": "157 54% 40%",
      "--accent": "157 35% 18%",
      "--accent-foreground": "157 54% 70%",
      "--success": "157 54% 40%",
      "--success-foreground": "192 17% 96%",
      "--sidebar-primary": "157 54% 40%",
      "--sidebar-primary-foreground": "200 20% 8%",
      "--sidebar-accent": "157 35% 16%",
      "--sidebar-accent-foreground": "157 54% 70%",
      "--sidebar-ring": "157 54% 40%",
      "--shadow-glow-primary": "0 0 40px -10px hsl(157 54% 40% / 0.4)",
      "--shadow-glow-success": "0 0 40px -10px hsl(157 54% 40% / 0.4)",
    },
  },
  pink: {
    light: {
      "--primary": "340 82% 52%",
      "--primary-foreground": "0 0% 100%",
      "--ring": "340 82% 52%",
      "--accent": "340 40% 92%",
      "--accent-foreground": "340 82% 35%",
      "--success": "340 82% 52%",
      "--success-foreground": "0 0% 100%",
      "--sidebar-primary": "340 82% 52%",
      "--sidebar-primary-foreground": "0 0% 100%",
      "--sidebar-accent": "340 35% 93%",
      "--sidebar-accent-foreground": "340 82% 35%",
      "--sidebar-ring": "340 82% 52%",
      "--gradient-primary": "linear-gradient(135deg, hsl(340 82% 52%) 0%, hsl(340 75% 58%) 100%)",
      "--gradient-success": "linear-gradient(135deg, hsl(340 82% 52%) 0%, hsl(340 75% 58%) 100%)",
      "--shadow-glow-primary": "0 4px 20px -4px hsl(340 82% 52% / 0.3)",
      "--shadow-glow-success": "0 4px 20px -4px hsl(340 82% 52% / 0.3)",
    },
    dark: {
      "--primary": "340 82% 58%",
      "--primary-foreground": "340 30% 8%",
      "--ring": "340 82% 58%",
      "--accent": "340 35% 18%",
      "--accent-foreground": "340 82% 75%",
      "--success": "340 82% 58%",
      "--success-foreground": "340 30% 8%",
      "--sidebar-primary": "340 82% 58%",
      "--sidebar-primary-foreground": "340 30% 8%",
      "--sidebar-accent": "340 35% 16%",
      "--sidebar-accent-foreground": "340 82% 75%",
      "--sidebar-ring": "340 82% 58%",
      "--shadow-glow-primary": "0 0 40px -10px hsl(340 82% 58% / 0.4)",
      "--shadow-glow-success": "0 0 40px -10px hsl(340 82% 58% / 0.4)",
    },
  },
  blue: {
    light: {
      "--primary": "199 89% 48%",
      "--primary-foreground": "0 0% 100%",
      "--ring": "199 89% 48%",
      "--accent": "199 40% 92%",
      "--accent-foreground": "199 89% 35%",
      "--success": "199 89% 48%",
      "--success-foreground": "0 0% 100%",
      "--sidebar-primary": "199 89% 48%",
      "--sidebar-primary-foreground": "0 0% 100%",
      "--sidebar-accent": "199 35% 93%",
      "--sidebar-accent-foreground": "199 89% 35%",
      "--sidebar-ring": "199 89% 48%",
      "--gradient-primary": "linear-gradient(135deg, hsl(199 89% 48%) 0%, hsl(199 80% 55%) 100%)",
      "--gradient-success": "linear-gradient(135deg, hsl(199 89% 48%) 0%, hsl(199 80% 55%) 100%)",
      "--shadow-glow-primary": "0 4px 20px -4px hsl(199 89% 48% / 0.3)",
      "--shadow-glow-success": "0 4px 20px -4px hsl(199 89% 48% / 0.3)",
    },
    dark: {
      "--primary": "199 89% 55%",
      "--primary-foreground": "199 47% 8%",
      "--ring": "199 89% 55%",
      "--accent": "199 35% 18%",
      "--accent-foreground": "199 89% 75%",
      "--success": "199 89% 55%",
      "--success-foreground": "199 47% 8%",
      "--sidebar-primary": "199 89% 55%",
      "--sidebar-primary-foreground": "199 47% 8%",
      "--sidebar-accent": "199 35% 16%",
      "--sidebar-accent-foreground": "199 89% 75%",
      "--sidebar-ring": "199 89% 55%",
      "--shadow-glow-primary": "0 0 40px -10px hsl(199 89% 55% / 0.4)",
      "--shadow-glow-success": "0 0 40px -10px hsl(199 89% 55% / 0.4)",
    },
  },
  black: {
    light: {
      "--primary": "0 0% 15%",
      "--primary-foreground": "0 0% 100%",
      "--ring": "0 0% 15%",
      "--accent": "0 0% 92%",
      "--accent-foreground": "0 0% 15%",
      "--success": "0 0% 15%",
      "--success-foreground": "0 0% 100%",
      "--sidebar-primary": "0 0% 15%",
      "--sidebar-primary-foreground": "0 0% 100%",
      "--sidebar-accent": "0 0% 93%",
      "--sidebar-accent-foreground": "0 0% 15%",
      "--sidebar-ring": "0 0% 15%",
      "--gradient-primary": "linear-gradient(135deg, hsl(0 0% 15%) 0%, hsl(0 0% 25%) 100%)",
      "--gradient-success": "linear-gradient(135deg, hsl(0 0% 15%) 0%, hsl(0 0% 25%) 100%)",
      "--shadow-glow-primary": "0 4px 20px -4px hsl(0 0% 15% / 0.3)",
      "--shadow-glow-success": "0 4px 20px -4px hsl(0 0% 15% / 0.3)",
    },
    dark: {
      "--primary": "0 0% 70%",
      "--primary-foreground": "0 0% 4%",
      "--ring": "0 0% 70%",
      "--accent": "0 0% 18%",
      "--accent-foreground": "0 0% 85%",
      "--success": "0 0% 70%",
      "--success-foreground": "0 0% 4%",
      "--sidebar-primary": "0 0% 70%",
      "--sidebar-primary-foreground": "0 0% 4%",
      "--sidebar-accent": "0 0% 16%",
      "--sidebar-accent-foreground": "0 0% 85%",
      "--sidebar-ring": "0 0% 70%",
      "--shadow-glow-primary": "0 0 40px -10px hsl(0 0% 70% / 0.4)",
      "--shadow-glow-success": "0 0 40px -10px hsl(0 0% 70% / 0.4)",
    },
  },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeColor, setThemeColorState] = useState<ThemeColor>(() => {
    const saved = localStorage.getItem("theme-color");
    return (saved as ThemeColor) || "green";
  });

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
    localStorage.setItem("theme-color", color);
  };

  useEffect(() => {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    const colorVars = themeColors[themeColor][isDark ? "dark" : "light"];

    Object.entries(colorVars).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }, [themeColor]);

  // Listen for dark mode changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const root = document.documentElement;
          const isDark = root.classList.contains("dark");
          const colorVars = themeColors[themeColor][isDark ? "dark" : "light"];

          Object.entries(colorVars).forEach(([property, value]) => {
            root.style.setProperty(property, value);
          });
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, [themeColor]);

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
