import React, { useEffect, useState } from "react";
import { Icon, IconLinkLabel, Icons } from "./Icons";
import * as icon from "./Icons.module.css";
import * as css from "./ThemeToggle.module.css";

/* Component to render toggle button to switch theme. */
export function ThemeToggle({ className }: { className?: string }) {
  const [light, setLight] = useState(true);
  useEffect(() => setLight(getAndUpdateInitialTheme()), []); // Runs only once
  useEffect(() => updateThemeClass(light), [light]);

  function toggle() {
    persistThemeSetting(!light);
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

/* Determines what the theme should be first checking if there is a local
 * storage preference stored, falls back to OS preference.
 *
 * Updates theme class silently as a side-effect.
 */
function getAndUpdateInitialTheme(): boolean {
  const light = getLocalStorageTheme() ?? getMediaQueryPreference();
  silentUpdateThemeClass(light);
  return light;
}

/* Get theme preference from local storage, undefined if not stored. */
function getLocalStorageTheme(): boolean | undefined {
  const localStorageLight = localStorage.getItem("theme");
  if (localStorageLight === undefined) return undefined;
  return localStorageLight === "light";
}

/* Determines theme preference based on OS setting. Default to light theme. */
function getMediaQueryPreference(): boolean {
  const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  return !darkMediaQuery.matches;
}

/* Writes theme preference to local storage */
function persistThemeSetting(light: boolean) {
  localStorage.setItem("theme", light ? "light" : "dark");
}

/* Applies theme class to html element. */
function updateThemeClass(light: boolean) {
  document.documentElement.classList.toggle("light", light);
  document.documentElement.classList.toggle("dark", !light);
}

/* Applies theme class silently by disabling transition. */
function silentUpdateThemeClass(light: boolean) {
  document.documentElement.style.transition = "none";
  updateThemeClass(light);
  document.documentElement.offsetHeight; // Force layout
  document.documentElement.style.transition = "";
}
