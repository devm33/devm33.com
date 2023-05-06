import React, { useEffect, useState } from "react";
import { Icon, IconLinkLabel, Icons } from "./Icons";
import * as icon from "./Icons.module.css";
import * as css from "./ThemeToggle.module.css";

function persistThemeSetting(light: boolean) {
  localStorage.setItem("theme", light ? "light" : "dark");
}

function updateThemeClass(light: boolean) {
  document.documentElement.classList.toggle("light", light);
  document.documentElement.classList.toggle("dark", !light);
}

function silentUpdateThemeClass(light: boolean) {
  document.documentElement.style.transition = "none";
  updateThemeClass(light);
  document.documentElement.offsetHeight; // Force layout
  document.documentElement.style.transition = "";
}

function getLocalStorageTheme(): boolean | undefined {
  const localStorageLight = localStorage.getItem("theme");
  if (localStorageLight === undefined) return undefined;
  return localStorageLight === "light";
}

function getMediaQueryPreference(): boolean {
  const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  return !darkMediaQuery.matches;
}

function getInitialTheme(): boolean {
  const light = getLocalStorageTheme() ?? getMediaQueryPreference();
  silentUpdateThemeClass(light);
  return light;
}

export function ThemeToggle({ className }: { className?: string }) {
  const [light, setLight] = useState(true);
  useEffect(() => setLight(getInitialTheme()), []); // Runs only once
  useEffect(() => updateThemeClass(light), [light]);

  function toggle() {
    persistThemeSetting(!light);
    setLight(!light);
  }

  const classes = [css.button, icon.link, className].filter(Boolean).join(" ");
  return (
    <button aria-pressed={!light} className={classes} onClick={toggle}>
      <Icon icon={Icons.Brightness} />
      <IconLinkLabel label="Switch theme" />
    </button>
  );
}
