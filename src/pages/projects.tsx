import { graphql } from "gatsby";
import React from "react";

import { Layout } from "../components/Layout";
import { ProjectGrid } from "../components/ProjectGrid";

export { Head } from "../components/Head";

export default function ProjectsPage({ data }) {
  return (
    <Layout>
      <ProjectGrid nodes={data.allMarkdownRemark.nodes} />
    </Layout>
  );
};

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