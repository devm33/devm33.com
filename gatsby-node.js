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
  const { createPage } = actions;
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

  tags.forEach(tag =>
    createPage({
      path: `/tag/${tag}`,
      component: TagTemplate,
      context: { tag },
    })
  );
};
