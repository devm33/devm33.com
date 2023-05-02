import { CreateNodeArgs } from "gatsby";

export function onCreateNode({ node, actions, getNode }: CreateNodeArgs) {
  if (node.internal.type !== "MarkdownRemark") return; // Only markdown pages
  if (!node.parent) throw new Error("Markdown page missing parent");
  const fileNode = getNode(node.parent);
  if (!fileNode) throw new Error("Markdown page missing parent file node");
  const value = `/${fileNode.relativeDirectory}/`;
  actions.createNodeField({ node, name: "path", value });
}
