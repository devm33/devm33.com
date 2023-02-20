const config = require("./src/config");

module.exports = {
  siteMetadata: {
    title: `Devraj Mehta`,
    description: `Devraj Mehta's website.`,
    siteUrl: config.siteUrl,
    email: `dev@devm.dev`,
  },
  plugins: [
    {
      resolve: `gatsby-omni-font-loader`,
      options: {
        enableListener: true,
        preconnect: [`https://fonts.googleapis.com`, `https://fonts.gstatic.com`],
        web: [
          {
            name: `Mulish`,
            file: `https://fonts.googleapis.com/css2?family=Mulish:ital,wght@0,400;0,500;1,400&display=block`,
          },
        ],
      },
    },
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-canonical-urls`,
      options: {
        siteUrl: config.siteUrl,
      },
    },
    `gatsby-transformer-yaml`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `src`,
        path: `${__dirname}/src`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `content`,
        path: `${__dirname}/content`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: config.contentWidth,
            },
          },
          `gatsby-remark-smartypants`,
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-katex`,
        ],
      },
    },
    `gatsby-plugin-image`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-catch-links`,
    `gatsby-plugin-sitemap`,
    `gatsby-plugin-netlify`,
    `gatsby-plugin-styled-components`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `devm33.com`,
        short_name: `devm33.com`,
        start_url: `/`,
        background_color: `#000`,
        theme_color: `#000`,
        display: `minimal-ui`,
        icon: `src/images/favicon-512.png`,
      },
    },
  ],
};
