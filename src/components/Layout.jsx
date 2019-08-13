/**
 * Layout component to serve as the base for all pages.
 */

import React from "react";
import PropTypes from "prop-types";
import { useStaticQuery, graphql } from "gatsby";
import styled from "styled-components";
import Helmet from "react-helmet";

import "../reset.css";
import Header from "./Header";
import Meta from "./Meta";
import theme from "../theme";
import typography from "../typography";

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

const Layout = ({ children, title, description, image }) => {
  const { site, fileName } = useStaticQuery(
    graphql`
      query SiteTitleQuery {
        site {
          siteMetadata {
            title
            description
          }
        }
        fileName: file(relativePath: { eq: "images/me.jpg" }) {
          childImageSharp {
            fluid(maxWidth: 1000) {
              src
            }
          }
        }
      }
    `
  );

  return (
    <Wrapper>
      <Helmet>
        <style>{typography.toString()}</style>
      </Helmet>
      <Meta
        title={title || site.siteMetadata.title}
        description={description || site.siteMetadata.description}
        image={image || fileName.childImageSharp.fluid.src}
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
  image: PropTypes.string,
};

export default Layout;
