"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 opacity-0" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex items-center justify-center w-9 h-9 rounded-full glass hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 absolute transition-all scale-100 rotate-0 dark:scale-0 dark:-rotate-90 text-foreground" />
      <Moon className="h-4 w-4 absolute transition-all scale-0 rotate-90 dark:scale-100 dark:rotate-0 text-foreground" />
    </button>
  );
}
