/**
 * Layout component to serve as the base for all pages.
 */

import React from "react";
import PropTypes from "prop-types";
import { useStaticQuery, graphql } from "gatsby";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import { lighten } from "polished";

import Header from "./header";
import Meta from "./meta";

const theme = {
  bg: "white",
  fg: "black",
  accent: `${lighten(0.25, "red")}`
};

const GlobalStyle = createGlobalStyle`
  html {
    box-sizing: border-box;
    font-family: "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 16px;
  }
  *, *::before, *::after {
    box-sizing: inherit;
    margin: 0;
    padding: 0;
  }
`;

const Layout = ({ children, title, description }) => {
  const { site } = useStaticQuery(
    graphql`
      query SiteTitleQuery {
        site {
          siteMetadata {
            title
            description
          }
        }
      }
    `
  );

  return (
    <ThemeProvider theme={theme}>
      <>
        <GlobalStyle />
        <Meta
          title={title || site.siteMetadata.title}
          description={description || site.siteMetadata.description}
        />
        <Header siteTitle={site.siteMetadata.title} />
        <main>{children}</main>
      </>
    </ThemeProvider>
  );
};

Layout.defaultProps = {
  title: ``,
  description: ``
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  description: PropTypes.string
};

export default Layout;
