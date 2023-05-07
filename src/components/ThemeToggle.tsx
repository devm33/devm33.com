import React, { useEffect, useState } from "react";
import { Icon, IconLinkLabel, Icons } from "./Icons";
import * as icon from "./Icons.module.css";
import * as css from "./ThemeToggle.module.css";

/* Component to render toggle button to switch theme. */
export function ThemeToggle({ className }: { className?: string }) {
  const [light, setLight] = useState(true);
  useEffect(() => setLight(setClassSilent(getTheme())), []); // Runs only once
  useEffect(() => setClass(light), [light]);

  function toggle() {
    setLocalStorage(!light);
    setLight(!light);
  }

  const classes = [css.button, icon.link, className].filter(Boolean).join(" ");
  return (
    <button aria-pressed={!light} className={classes} onClick={toggle}>
      <IconLinkLabel label={light ? "Dark theme" : "Light theme"} left />
      <Icon icon={Icons.Brightness} />
    </button>
  );
}

/* Gets theme from local storage, falls back to OS preference. */
function getTheme(): boolean {
  return getLocalStorage() ?? getOSPreference();
}

/* Get theme preference from local storage, undefined if not stored. */
function getLocalStorage(): boolean | undefined {
  const localStorageLight = localStorage.getItem("theme");
  if (localStorageLight === undefined) return undefined;
  return localStorageLight === "light";
}

/* Determines theme preference based on OS setting. Default to light theme. */
function getOSPreference(): boolean {
  const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  return !darkMediaQuery.matches;
}

/* Writes theme preference to local storage */
function setLocalStorage(light: boolean) {
  localStorage.setItem("theme", light ? "light" : "dark");
}

/* Applies theme class to html element. */
function setClass(light: boolean) {
  document.documentElement.classList.toggle("light", light);
  document.documentElement.classList.toggle("dark", !light);
}

/* Applies theme class silently by disabling transition. */
function setClassSilent(light: boolean): boolean {
  document.documentElement.style.transition = "none";
  setClass(light);
  document.documentElement.offsetHeight; // Force layout
  document.documentElement.style.transition = "";
  return light; // Returns for chaining
}
