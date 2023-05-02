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

const query = graphql`
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
`;

/** Common gatsby head component: https://gatsby.dev/gatsby-head */
export function Head({ title, pageContext, location }: Props) {
  const { me, site } = useStaticQuery<Queries.HeadQuery>(query);
  const sm = site.siteMetadata;
  const desc = pageContext.description || sm.description;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const image = (pageContext.image || me)!.childImageSharp!;
  return (
    <>
      <title>{title || pageContext.title || sm.title}</title>
      <meta name="description" content={desc} />
      <meta name="og:description" content={desc} />
      <meta name="og:image" content={`${sm.siteUrl}${getSrc(image)}`} />
      <meta name="og:title" content={title || pageContext.title || sm.title} />
      <meta name="og:url" content={`${sm.siteUrl}${location.pathname}`} />
    </>
  );
}

/** Helper to customize page title on a given page. */
export function createHeadWithTitle(title: string) {
  return (props: Props) => Head({ title, ...props });
}
