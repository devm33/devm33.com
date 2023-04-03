
const siteUrl = 'https://devm33.com';
module.exports = {
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
              maxWidth: 700, // Matches theme contentWidth
            },
          },
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
    `gatsby-plugin-minify-classnames`,
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
