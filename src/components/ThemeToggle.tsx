import React from "react";
import { Icon, Icons } from "./Icons";

interface Props {
  className?: string;
}

export function ThemeToggle(props: Props) {
  return (
    <div className={props.className}>
      <Icon icon={Icons.Brightness} />
    </div>
  );
}
