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

interface Props extends HeadProps<object, PageContext> {
  title?: string;
}

/** Common gatsby head component: https://gatsby.dev/gatsby-head */
export function Head(props: Props) {
  const query = useStaticQuery<Queries.HeadQuery>(
    graphql`
      query Head {
        site {
          siteMetadata {
            title
            description
            siteUrl
          }
        }
        headshot: file(relativePath: { eq: "images/me.jpg" }) {
          childImageSharp {
            gatsbyImageData(width: 1000)
          }
        }
        favicon: file(relativePath: { eq: "images/favicon-512.png" }) {
          childImageSharp {
            gatsbyImageData(width: 32)
          }
        }
      }
    `,
  );
  const siteMetadata = query.site?.siteMetadata;
  const title = props.title || props.pageContext.title || siteMetadata?.title;
  const desc = props.pageContext.description || siteMetadata?.description;
  const image = (props.pageContext.image || query.headshot)?.childImageSharp;
  const favicon = query.favicon?.childImageSharp;
  const siteUrl = siteMetadata?.siteUrl;
  if (!image) throw new Error("Missing image for page head");
  if (!siteUrl) throw new Error("Missing siteUrl for page head");
  if (!favicon) throw new Error("Missing favicon image for page head");
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc || undefined} />
      <meta name="og:description" content={desc || undefined} />
      <meta name="og:image" content={`${siteUrl}${getSrc(image)}`} />
      <meta name="og:title" content={title || undefined} />
      <meta name="og:url" content={`${siteUrl}${props.location.pathname}`} />
      <link rel="icon" href={getSrc(favicon)} type="image/png" />
    </>
  );
}

/** Helper to customize page title on a given page. */
export function createHeadWithTitle(title: string) {
  return (props: Props) => Head({ title, ...props });
}
