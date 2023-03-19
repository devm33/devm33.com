import React from "react";
import { getSrc } from "gatsby-plugin-image"
import { useStaticQuery, graphql } from "gatsby";

import { typography } from "../typography";

/** Common gatsby head component: https://gatsby.dev/gatsby-head */
export function Head({ location, pageContext }) {
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
      <html lang="en" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="og:type" content="article" />
      <meta name="og:title" content={title} />
      <meta name="og:url" content={`${siteUrl}${location.pathname}`} />
      <meta name="og:description" content={description} />
      <meta name="og:image" content={`${siteUrl}${getSrc(image)}`} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@devm33" />
      <meta name="fb:app_id" content="477033866176272" />
      {!pageContext.dropTypography && <style>{typography.toString()}</style>}
    </>
  );
};