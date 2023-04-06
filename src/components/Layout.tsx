import React from "react";

import { InstallIcons } from "./Icons";
import { Navbar } from "./Navbar";

/** Layout component to serve as the base for all pages.  */
export function Layout({ children }: React.PropsWithChildren) {
  return (
    <>
      <InstallIcons github={true} link={true} linkedin={true} />
      <Navbar />
      <main>{children}</main>
    </>
  );
}
