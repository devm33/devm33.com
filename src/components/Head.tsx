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
  const title = props.title || props.pageContext.title || siteMetadata?.title;
  const desc = props.pageContext.description || siteMetadata?.description;
  const image = (props.pageContext.image || query.fileName)!.childImageSharp!;
  const siteUrl = siteMetadata?.siteUrl ?? '';
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc || undefined} />
      <meta name="og:description" content={desc || undefined} />
      <meta name="og:image" content={`${siteUrl}${getSrc(image)}`} />
      <meta name="og:title" content={title || undefined} />
      <meta name="og:url" content={`${siteUrl}${props.location.pathname}`} />
    </>
  );
};

/** Helper to customize page title on a given page. */
export function createHeadWithTitle(title: string) {
  return (props: Props) => Head({title, ...props});
}