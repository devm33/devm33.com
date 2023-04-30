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
        me: file(relativePath: { eq: "images/me.jpg" }) {
          childImageSharp {
            gatsbyImageData(width: 1000)
          }
        }
      }
    `,
  );
  const siteMetadata = query.site.siteMetadata;
  const title = props.title || props.pageContext.title || siteMetadata.title;
  const desc = props.pageContext.description || siteMetadata.description;
  const siteUrl = siteMetadata.siteUrl;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const image = (props.pageContext.image || query.me)!.childImageSharp!;
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="og:description" content={desc} />
      <meta name="og:image" content={`${siteUrl}${getSrc(image)}`} />
      <meta name="og:title" content={title} />
      <meta name="og:url" content={`${siteUrl}${props.location.pathname}`} />
    </>
  );
}

/** Helper to customize page title on a given page. */
export function createHeadWithTitle(title: string) {
  return (props: Props) => Head({ title, ...props });
}
