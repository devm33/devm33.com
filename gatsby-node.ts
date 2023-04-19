import { GatsbyNode } from "gatsby";
import path from "path";
import puppeteer from "puppeteer";
import url from "url";
import { Module } from "webpack";

export const onCreateNode: GatsbyNode["onCreateNode"] = (args) => {
  const { node, actions, getNode } = args;
  const { createNodeField } = actions;
  // Add fields to markdown pages
  if (node.internal.type !== "MarkdownRemark" || !node.parent) return;
  const fileNode = getNode(node.parent);
  if (!fileNode) return;
  const relativeDirectory = fileNode.relativeDirectory as string;
  createNodeField({ node, name: "path", value: `/${relativeDirectory}/` });
};

const ProjectTemplate = path.resolve(`src/templates/Project.tsx`);
const TagTemplate = path.resolve(`src/templates/Tag.tsx`);

export const createPages: GatsbyNode["createPages"] = async (args) => {
  const { actions, graphql, reporter } = args;
  const { createPage, createRedirect } = actions;
  const result = await graphql<Queries.CreatePagesQuery>(/* GraphQL */ `
    query CreatePages {
      projects: allMarkdownRemark {
        nodes {
          id
          fields {
            path
          }
          frontmatter {
            tags
            title
            tagline
            image {
              childImageSharp {
                gatsbyImageData(width: 1000)
              }
            }
          }
        }
      }
      katexProjects: allMarkdownRemark(filter: { html: { regex: "/katex/" } }) {
        nodes {
          id
        }
      }
      prismProjects: allMarkdownRemark(
        filter: { html: { regex: "/gatsby-highlight/" } }
      ) {
        nodes {
          id
        }
      }
      tags: allMarkdownRemark {
        distinct(field: { frontmatter: { tags: SELECT } })
      }
    }
  `);
  if (result.errors || !result.data) {
    reporter.panicOnBuild("Error while running GraphQL query.");
    return;
  }
  const katex = new Set(result.data.katexProjects.nodes.map((node) => node.id));
  const prism = new Set(result.data.prismProjects.nodes.map((node) => node.id));

  // Add project pages.
  for (const node of result.data.projects.nodes) {
    if (!node.fields?.path || !node.frontmatter) {
      reporter.panicOnBuild("Project node missing required fields.");
      return;
    }
    createPage({
      path: node.fields.path,
      component: ProjectTemplate,
      context: {
        title: node.frontmatter.title,
        description: node.frontmatter.tagline,
        image: node.frontmatter.image,
        katex: katex.has(node.id),
        prism: prism.has(node.id),
      },
    });
  }

  // Add tag pages.
  for (const tag of result.data.tags.distinct) {
    createPage({
      path: `/tag/${tag}/`,
      component: TagTemplate,
      context: { tag, title: `Projects tagged ${tag}` },
    });
  }

  // Redirects for previous blog site urls.
  createRedirect({
    fromPath: "/2015-06-07",
    toPath: "/projects/4clojure/",
  });
  createRedirect({
    fromPath: "/2014-12-04",
    toPath: "/projects/motivation/",
    isPermanent: true,
  });
  createRedirect({
    fromPath: "/2014-09-22",
    toPath: "/projects/jekyll-nfs/",
    isPermanent: true,
  });
  // Redirect for resume pdf
  createRedirect({
    fromPath: "/resume.pdf",
    toPath: "/devraj_mehta_resume.pdf",
    isPermanent: true,
  });
};

export const onPostBuild: GatsbyNode["onPostBuild"] = async () => {
  // Generate PDF of resume page
  const browser = await puppeteer.launch({
    args: ["--font-render-hinting=none"],
  });
  const page = await browser.newPage();
  const resumePath = path.join(__dirname, "public/resume/index.html");
  await page.goto(url.pathToFileURL(resumePath).toString());
  await page.pdf({ path: "./public/devraj_mehta_resume.pdf" });
};

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({
  actions,
  getConfig,
  stage,
}) => {
  const config = getConfig();
  if (!stage.includes("build")) return;
  // Minify css module class names use 5-digit hex hash
  // Note this approach assumes css config is in a oneOf block.
  for (const { oneOf } of config.module.rules) {
    if (!oneOf?.length) continue;
    for (const { use } of oneOf) {
      if (!use) continue;
      for (const { loader, options } of use) {
        if (!loader?.includes(`${path.sep}css-loader${path.sep}`)) continue;
        if (!options?.modules) continue;
        options.modules.localIdentName = "[hash:hex:5]";
      }
    }
  }
  actions.replaceWebpackConfig(config);
  if (stage !== "build-javascript") return;
  // Separate katex css from main css build
  actions.setWebpackConfig({
    optimization: {
      runtimeChunk: {
        name: "webpack-runtime",
      },
      splitChunks: {
        name: false,
        cacheGroups: {
          styles: {
            name: "styles",
            test: (module: Module) =>
              module.type === "css/mini-extract" &&
              !/katex/.test(module.identifier()),
            enforce: true,
          },
        },
      },
    },
  });
};

// Site type for site metadata.
export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] =
  ({ actions }) => {
    actions.createTypes(`
      type Site {
        siteMetadata: SiteMetadata!
      }

      type SiteMetadata {
        title: String!
        description: String!
        siteUrl: String!
        email: String!
      }
  `);
  };
