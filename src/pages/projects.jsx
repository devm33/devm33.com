import React from "react";
import { graphql } from "gatsby";

import Layout from "../components/Layout";
import ProjectGrid from "../components/ProjectGrid";

const ProjectsPage = ({
  data: {
    allMarkdownRemark: { nodes },
  },
}) => (
  <Layout url="/projects/">
    <ProjectGrid nodes={nodes} />
  </Layout>
);

export const query = graphql`
  query ProjectsQuery {
    allMarkdownRemark(
      filter: { fields: { type: { eq: "projects" } } }
      sort: {frontmatter: {updated: DESC}}
    ) {
      nodes {
        ...ProjectGridFields
      }
    }
  }
`;

export default ProjectsPage;
