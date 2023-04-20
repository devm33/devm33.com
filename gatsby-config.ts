import type { GatsbyConfig } from "gatsby";

const siteUrl = "https://devm33.com";
const config: GatsbyConfig = {
  graphqlTypegen: {
    typesOutputPath: `.cache/gatsby-types.d.ts`,
    generateOnBuild: true,
  },
  siteMetadata: {
    title: `Devraj Mehta`,
    description: `Devraj Mehta's website.`,
    siteUrl,
    email: `dev@devm.dev`,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-canonical-urls`,
      options: { siteUrl, stripQueryString: true },
    },
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-plugin-netlify`,
      options: {
        headers: {
          "/*.css": [`Cache-Control: public, max-age=31536000, immutable`],
          "/*.js": [`Cache-Control: public, max-age=31536000, immutable`],
          "/fonts/*": [`Cache-Control: public, max-age=31536000, immutable`],
        },
      },
    },
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-sitemap`,
      options: { createLinkInHead: false },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `src`,
        path: `${__dirname}/src`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: { maxWidth: 700 }, // Matches src/global.css article width
          },
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-katex`,
          `gatsby-remark-prismjs`,
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-transformer-yaml`,
  ],
};

export default config;
