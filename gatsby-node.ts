import { GatsbyNode } from "gatsby";
import { readFile } from "node:fs/promises";
import path from "path";
import puppeteer from "puppeteer";
import url from "url";
import { Module } from "webpack";

export { createPages } from "./src/utils/create-pages";

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

export const onPostBuild: GatsbyNode["onPostBuild"] = async () => {
  // Generate PDF of resume page
  const args = ["--font-render-hinting=none"];
  const browser = await puppeteer.launch({ args });
  const page = await browser.newPage();
  const resumePath = path.join(__dirname, "public/resume/index.html");
  await page.goto(url.pathToFileURL(resumePath).toString());
  const encoding = "base64";
  const fonts = "./static/fonts";
  const normal = await readFile(`${fonts}/mulish.woff2`, { encoding });
  const italic = await readFile(`${fonts}/mulish-ital.woff2`, { encoding });
  const content = `
  @font-face {
    font-family: Mulish;
    font-style: normal;
    font-weight: 200 1000;
    src: url("data:font/woff2;base64,${normal}") format("woff2");
  }
  @font-face {
    font-family: Mulish;
    font-style: italic;
    font-weight: 200 1000;
    src: url("data:font/woff2;base64,${italic}") format("woff2");
  }
  `;
  await page.addStyleTag({ content });
  await page.evaluateHandle("document.fonts.ready");
  await page.pdf({ path: "./public/devraj_mehta_resume.pdf" });
  await browser.close();
};

type OnCreateWebpackConfig = GatsbyNode["onCreateWebpackConfig"];
export const onCreateWebpackConfig: OnCreateWebpackConfig = (args) => {
  // Add import alias for components directory
  args.actions.setWebpackConfig({
    resolve: {
      alias: { "@components": path.resolve(__dirname, "src/components") },
    },
  });

  // Minify css module class names use 5-digit hex hash
  const config = args.getConfig();
  if (!args.stage.includes("build")) return;
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
  args.actions.replaceWebpackConfig(config);

  // Separate katex css from main css build
  if (args.stage !== "build-javascript") return;
  args.actions.setWebpackConfig({
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

type CreateSchemaCustomization = GatsbyNode["createSchemaCustomization"];
export const createSchemaCustomization: CreateSchemaCustomization = (args) => {
  args.actions.createTypes(/* GraphQL */ `
    type Site {
      siteMetadata: SiteMetadata!
    }

    type SiteMetadata {
      title: String!
      description: String!
      siteUrl: String!
      email: String!
      github: String!
      linkedin: String!
    }

    type MarkdownRemark implements Node {
      fields: MarkdownRemarkFields!
      frontmatter: MarkdownRemarkFrontmatter!
      html: String!
    }

    type MarkdownRemarkFrontmatter {
      link: String
      repo: String
      tagline: String!
      tags: [String!]!
      title: String!
    }

    type MarkdownRemarkFields {
      path: String!
    }
  `);
};

export const createResolvers: GatsbyNode["createResolvers"] = (args) => {
  args.createResolvers({
    Query: {
      site: { type: "Site!" },
      markdownRemark: { type: "MarkdownRemark!" },
    },
  });
};
