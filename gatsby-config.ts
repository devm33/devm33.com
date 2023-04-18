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
      options: { siteUrl },
    },
    `gatsby-plugin-image`,
    `gatsby-plugin-netlify`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-sitemap`,
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
            options: {
              maxWidth: 700, // Matches src/global.css article width
            },
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
