import React from "react";

import { InstallIcons } from "./Icons";
import { Slice } from "gatsby";

interface Props {
  mainClass?: string;
  resume?: boolean;
}

/** Layout component to serve as the base for all pages.  */
export function Layout(props: React.PropsWithChildren<Props>) {
  return (
    <>
      <InstallIcons />
      <Slice alias="navbar" resume={props.resume} />
      <main className={props.mainClass}>{props.children}</main>
    </>
  );
}
