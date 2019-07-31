const path = require("path");
const url = require("url");
const puppeteer = require("puppeteer");

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;
  // Add fields to markdown pages
  if (node.internal.type === "MarkdownRemark") {
    const fileNode = getNode(node.parent);
    // Adds path to page.
    createNodeField({
      node,
      name: "path",
      value: path.join("/", fileNode.relativeDirectory),
    });
    // Adds the type field as the first directory of the page's path, e.g. "projects"
    createNodeField({
      node,
      name: "type",
      value: path
        .dirname(fileNode.relativeDirectory)
        .split(path.sep)
        .pop(),
    });
  }
};

exports.createPages = async ({ actions, graphql }) => {
  const { createPage, createRedirect } = actions;
  const ProjectTemplate = path.resolve(`src/templates/Project.jsx`);
  const TagTemplate = path.resolve(`src/templates/Tag.jsx`);
  const tags = new Set();
  const projects = await graphql(`
    {
      allMarkdownRemark {
        nodes {
          fields {
            path
            type
          }
          frontmatter {
            tags
          }
        }
      }
    }
  `);

  if (projects.errors) {
    console.error(projects.errors);
    throw projects.errors;
  }

  // Add project pages.
  projects.data.allMarkdownRemark.nodes.forEach(node => {
    if (node.fields.type == "projects") {
      createPage({ path: node.fields.path, component: ProjectTemplate });
      if (node.frontmatter.tags) {
        node.frontmatter.tags.forEach(tag => tags.add(tag));
      }
    } else {
      throw new Error("Unknown markdown page type");
    }
  });

  // Add tag pages.
  tags.forEach(tag =>
    createPage({
      path: `/tag/${tag}`,
      component: TagTemplate,
      context: { tag },
    })
  );

  // Add redirects.
  createRedirect({
    fromPath: "/projects",
    toPath: "/",
    isPermanent: true,
  });
  // Redirects for previous blog site urls.
  createRedirect({
    fromPath: "/2015-06-07",
    toPath: "/projects/4clojure",
  });
  createRedirect({
    fromPath: "/2014-12-04",
    toPath: "/projects/motivation",
    isPermanent: true,
  });
  createRedirect({
    fromPath: "/2014-09-22",
    toPath: "/projects/jekyll-nfs",
    isPermanent: true,
  });
};

// Generate PDF of resume page
exports.onPostBuild = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const resumePath = path.join(__dirname, "public/resume/index.html");
  await page.goto(url.pathToFileURL(resumePath));
  await page.pdf({ path: "./public/resume.pdf" });
};
