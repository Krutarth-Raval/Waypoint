"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { createContext, useContext, useEffect, useState } from "react";

// Suppress the React 19 / Next.js 15 warning for next-themes script injection
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const origError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) {
      return;
    }
    origError.apply(console, args);
  };
}

const ColorThemeContext = createContext({
  colorTheme: "theme-emerald",
  setColorTheme: () => null,
});

export function useColorTheme() {
  return useContext(ColorThemeContext);
}

export function ThemeProvider({ children, ...props }) {
  const [colorTheme, setColorThemeState] = useState("theme-emerald");

  useEffect(() => {
    // Read the saved color theme on mount
    const savedTheme = localStorage.getItem("color-theme") || "theme-emerald";
    setColorThemeState(savedTheme);
    document.documentElement.classList.add(savedTheme);
  }, []);

  const setColorTheme = (newTheme) => {
    // Remove old theme class
    document.documentElement.classList.remove(colorTheme);
    
    // Add new theme class
    document.documentElement.classList.add(newTheme);
    localStorage.setItem("color-theme", newTheme);
    setColorThemeState(newTheme);
  };

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </ColorThemeContext.Provider>
  );
}
