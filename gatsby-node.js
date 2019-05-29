const path = require("path");

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;
  // Add fields to markdown pages
  if (node.internal.type === "MarkdownRemark") {
    const fileNode = getNode(node.parent);
    // Adds path to page.
    createNodeField({
      node,
      name: "path",
      value: path.join("/", fileNode.relativeDirectory)
    });
    // Adds the type field as the first directory of the page's path, e.g. "projects"
    createNodeField({
      node,
      name: "type",
      value: path
        .dirname(fileNode.relativeDirectory)
        .split(path.sep)
        .pop()
    });
  }
};

exports.createPages = async ({ actions, graphql }) => {
  const { createPage } = actions;
  const project = path.resolve(`src/templates/project.jsx`);
  const result = await graphql(`
    {
      allMarkdownRemark {
        nodes {
          fields {
            path
            type
          }
        }
      }
    }
  `);

  if (result.errors) {
    console.error(result.errors);
    throw result.errors;
  }

  result.data.allMarkdownRemark.nodes.forEach(node => {
    if (node.fields.type == "projects") {
      createPage({ path: node.fields.path, component: project });
    } else {
      throw new Error("Unknown markdown page type");
    }
  });
};
