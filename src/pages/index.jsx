import React from "react";
import { graphql } from "gatsby";

import Layout from "../components/Layout";
import ProjectGrid from "../components/ProjectGrid";

const IndexPage = ({
  data: {
    allMarkdownRemark: { nodes },
  },
}) => (
  <Layout url="/">
    <ProjectGrid nodes={nodes} />
  </Layout>
);

export const query = graphql`
  query IndexQuery {
    allMarkdownRemark(
      filter: { fields: { type: { eq: "projects" } } }
      sort: { fields: frontmatter___updated, order: DESC }
    ) {
      nodes {
        ...ProjectGridFields
      }
    }
  }
`;

export default IndexPage;
