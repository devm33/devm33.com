/**
 * Layout component to serve as the base for all pages.
 */

import React from "react";
import PropTypes from "prop-types";
import { useStaticQuery, graphql } from "gatsby";
import styled, { ThemeProvider } from "styled-components";
import { lighten, darken } from "polished";

import "./Layout.css";
import Header from "./Header";
import Meta from "./Meta";

const theme = {
  bg: "white",
  color: "black",
  secondary: lighten(0.3, "black"),
  accent: "#d6006c",
  link: darken(0.2, "cornflowerblue"),
  break: {
    s: "(max-width: 500px)"
  },
  font: {
    small: "0.9rem",
    icon: "1.12rem"
  }
};

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
