import React, { useEffect, useState } from "react";
import { Icon, Icons } from "./Icons";
import * as css from "./ThemeToggle.module.css";

interface Props {
  className?: string;
}

function updateTheme(light: boolean) {
  document.body.classList.toggle("light", light);
  document.body.classList.toggle("dark", !light);
}

export function ThemeToggle(props: Props) {
  const [light, setLight] = useState(true); // TODO use media api to init

  useEffect(() => {
    updateTheme(light);
  }, [light]);

  const classes = [css.button, props.className].filter(Boolean).join(" ");
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
