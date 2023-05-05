import React, { useEffect, useState } from "react";
import { Icon, Icons } from "./Icons";
import * as icon from "./Icons.module.css";
import * as css from "./ThemeToggle.module.css";

interface Props {
  className?: string;
}

function updateThemeClass(light: boolean) {
  document.documentElement.classList.toggle("light", light);
  document.documentElement.classList.toggle("dark", !light);
}

function persistThemeSetting(light: boolean) {
  localStorage.setItem("theme", light ? "light" : "dark");
}

function getInitialTheme(): boolean {
  const localStorageLight = localStorage.getItem("theme");
  if (localStorageLight !== undefined) return localStorageLight === "light";
  const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  return !darkMediaQuery.matches;
}

export function ThemeToggle({ className }: Props) {
  const [light, setLight] = useState(true);
  useEffect(() => setLight(getInitialTheme()), []); // Runs only once
  useEffect(() => updateThemeClass(light), [light]);

  function toggle() {
    persistThemeSetting(!light);
    setLight(!light);
  }

  const classes = [css.button, icon.link, className].filter(Boolean).join(" ");
  return (
    <button
      aria-label="Toggle theme"
      aria-pressed={!light}
      className={classes}
      onClick={toggle}
    >
      <Icon icon={Icons.Brightness} />
    </button>
  );
}
