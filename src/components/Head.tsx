import { graphql, useStaticQuery } from "gatsby";
import { getSrc } from "gatsby-plugin-image";
import PropTypes from "prop-types";
import React from "react";

/** Common gatsby head component: https://gatsby.dev/gatsby-head */
export function Head({ location, pageContext, children }) {
  const { site: { siteMetadata }, fileName } = useStaticQuery(
    graphql`
      query HeadQuery {
        site {
          siteMetadata {
            title
            description
            siteUrl
          }
        }
        fileName: file(relativePath: { eq: "images/me.jpg" }) {
          childImageSharp {
            gatsbyImageData(width: 1000)
          }
        }
      }
    `
  );
  const title = pageContext.title || siteMetadata.title;
  const description = pageContext.description || siteMetadata.description;
  const image = pageContext.image ? pageContext.image : fileName;
  const { siteUrl } = siteMetadata;
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="og:title" content={title} />
      <meta name="og:url" content={`${siteUrl}${location.pathname}`} />
      <meta name="og:description" content={description} />
      <meta name="og:image" content={`${siteUrl}${getSrc(image)}`} />
      {children}
    </>
  );
};

Head.propTypes = {
  pageContext: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.object,
    dropTypography: PropTypes.bool,
  }),
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }),
  children: PropTypes.node,
};