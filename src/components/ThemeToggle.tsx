import React, { useEffect, useState } from "react";
import { Icon, Icons } from "./Icons";
import * as icon from "./Icons.module.css";
import * as css from "./ThemeToggle.module.css";

interface Props {
  className?: string;
}

const isBrowser = typeof window !== "undefined";

function updateTheme(light: boolean) {
  document.documentElement.classList.toggle("light", light);
  document.documentElement.classList.toggle("dark", !light);
  if (isBrowser) window.localStorage.setItem("light", light ? "light" : "dark");
}

function getInitialLight(): boolean {
  if (isBrowser) {
    const localStorageLight = window.localStorage.getItem("light");
    if (localStorageLight !== undefined) return localStorageLight === "light";
  }
  const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  return !darkMediaQuery.matches;
}

export function ThemeToggle({ className }: Props) {
  const [light, setLight] = useState(getInitialLight());

  useEffect(() => {
    updateTheme(light);
  }, [light]);

  const classes = [css.button, icon.link, className].filter(Boolean).join(" ");
  return (
    <button
      aria-label="Toggle dark theme"
      aria-pressed={!light}
      className={classes}
      onClick={() => setLight(!light)}
    >
      <Icon icon={Icons.Brightness} />
    </button>
  );
}
