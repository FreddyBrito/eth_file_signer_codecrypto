"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) {
      setIsDark(saved === "true");
    } else {
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", String(isDark));
  }, [isDark, mounted]);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "40px",
        height: "40px",
        borderRadius: "var(--rounded-full)",
        backgroundColor: isDark ? "var(--color-surface-soft)" : "var(--color-canvas)",
        border: "1px solid var(--color-hairline)",
        cursor: "pointer",
        color: "var(--color-ink)",
        transition: "all 0.2s ease",
      }}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun style={{ width: "20px", height: "20px" }} />
      ) : (
        <Moon style={{ width: "20px", height: "20px" }} />
      )}
    </button>
  );
}
