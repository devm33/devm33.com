/**
 * Layout component to serve as the base for all pages.
 */

import React from "react";
import PropTypes from "prop-types";
import { useStaticQuery, graphql } from "gatsby";
import styled, { ThemeProvider } from "styled-components";
import { lighten } from "polished";

import "./layout.css";
import Header from "./header";
import Meta from "./meta";

const theme = {
  bg: "white",
  fg: "black",
  accent: `${lighten(0.15, "red")}`
};

const Wrapper = styled.div`
  color: ${theme.fg};
  background-color: ${theme.bg};
  a,
  a:visited {
    color: "deepskyblue";
  }
  a:hover {
    color: ${lighten(0.15, "deepskyblue")};
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
      <Wrapper>
        <Meta
          title={title || site.siteMetadata.title}
          description={description || site.siteMetadata.description}
        />
        <Header siteTitle={site.siteMetadata.title} />
        <main>{children}</main>
      </Wrapper>
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
