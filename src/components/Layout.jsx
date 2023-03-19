import PropTypes from "prop-types";
import React from "react";
import styled from "styled-components";

import "../reset.css";
import { Header } from "./Header";
import theme from "../theme";

const Wrapper = styled.div`
  color: ${theme.fg};
  background-color: ${theme.bg};
  a,
  a:visited {
    color: ${theme.link};
  }
  a:hover {
    color: ${theme.accent};
  }
  a {
    text-decoration: none;
    transition: all 0.3s ease-in-out; /* all prop is overridden below */
    transition-property: color, background-color, border-color;
  }
`;

/** Layout component to serve as the base for all pages.  */
export const Layout = ({ children }) => (
  <Wrapper>
    <Header />
    <main>{children}</main>
  </Wrapper>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
