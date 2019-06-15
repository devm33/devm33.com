/**
 * Layout component to serve as the base for all pages.
 */

import React from "react";
import PropTypes from "prop-types";
import { useStaticQuery, graphql } from "gatsby";
import styled from "styled-components";

import "../reset.css";
import Header from "./Header";
import Meta from "./Meta";
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
    <Wrapper>
      <Meta
        title={title || site.siteMetadata.title}
        description={description || site.siteMetadata.description}
      />
      <Header siteTitle={site.siteMetadata.title} />
      <main>{children}</main>
    </Wrapper>
  );
};

Layout.defaultProps = {
  title: ``,
  description: ``,
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
};

export default Layout;
