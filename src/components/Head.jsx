import { useStaticQuery, graphql } from "gatsby";

import config from "../config";

/** Common gatsby head component: https://gatsby.dev/gatsby-head */
export const Head = ({ location, data, pageContext }) => {
  const { site, fileName } = useStaticQuery(
    graphql`
      query HeadQuery {
        site {
          siteMetadata {
            title
            description
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
  const title = pageContext.title || site.siteMetadata.title;
  const description = pageContext.description || site.siteMetadata.description;
  const image = data.image || getSrc(fileName);
  return (
    <>
      <html lang="en" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="og:type" content="article" />
      <meta name="og:title" content={title} />
      <meta name="og:url" content={`${config.siteUrl}${location.pathname}`} />
      <meta name="og:description" content={description} />
      <meta name="og:image" content={`${config.siteUrl}${image}`} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@devm33" />
      <meta name="fb:app_id" content="477033866176272" />
    </>
  );
};
