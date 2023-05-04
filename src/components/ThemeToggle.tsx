import React, { useEffect, useState } from "react";
import { Icon, Icons } from "./Icons";
import * as icon from "./Icons.module.css";
import * as css from "./ThemeToggle.module.css";

interface Props {
  className?: string;
}

function updateTheme(light: boolean) {
  document.body.classList.toggle("light", light);
  document.body.classList.toggle("dark", !light);
}

export function ThemeToggle({ className }: Props) {
  const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const [light, setLight] = useState(!darkMediaQuery.matches);

  useEffect(() => {
    updateTheme(light);
  }, [light]);

  const classes = [css.button, icon.link, className].filter(Boolean).join(" ");
  return (
    <button
      aria-label="Toggle dark theme"
      className={classes}
      onClick={() => setLight(!light)}
    >
      <Icon icon={Icons.Brightness} />
    </button>
  );
}
