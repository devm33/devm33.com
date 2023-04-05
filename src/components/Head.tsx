import { HeadProps, graphql, useStaticQuery } from "gatsby";
import { IGatsbyImageData, getSrc } from "gatsby-plugin-image";
import React from "react";

interface PageContext {
  title: string | null;
  description: string | null;
  image: {
    readonly childImageSharp: {
      readonly gatsbyImageData: IGatsbyImageData;
    } | null;
  } | null;
}

/** Common gatsby head component: https://gatsby.dev/gatsby-head */
export function Head({ location, pageContext }: HeadProps<object, PageContext>) {
  const query: Queries.HeadQuery = useStaticQuery(
    graphql`
      query Head {
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
  const siteMetadata = query.site?.siteMetadata;
  const title = pageContext.title || siteMetadata?.title;
  const description = pageContext.description || siteMetadata?.description;
  const image = (pageContext.image || query.fileName)!.childImageSharp!;
  const siteUrl = siteMetadata?.siteUrl ?? '';
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description || undefined} />
      <meta name="og:description" content={description || undefined} />
      <meta name="og:image" content={`${siteUrl}${getSrc(image)}`} />
      <meta name="og:title" content={title || undefined} />
      <meta name="og:url" content={`${siteUrl}${location.pathname}`} />
    </>
  );
};