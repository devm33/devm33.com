import React from "react";

import { InstallIcons } from "./Icons";
import { Navbar } from "./Navbar";

interface Props {
  mainClass?: string;
  resume?: boolean;
}

/** Layout component to serve as the base for all pages.  */
export function Layout(props: React.PropsWithChildren<Props>) {
  return (
    <>
      <InstallIcons />
      <Navbar resume={props.resume} />
      <main className={props.mainClass}>{props.children}</main>
    </>
  );
}
