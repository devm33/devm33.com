import PropTypes from "prop-types";
import React from "react";

import "../global.css";
import { InstallIcons } from "./Icons";
import { Navbar } from "./Navbar";

/** Layout component to serve as the base for all pages.  */
export const Layout = ({ children }) => (
  <>
    <InstallIcons github={true} link={true} linkedin={true} />
    <Navbar />
    <main>{children}</main>
  </>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
