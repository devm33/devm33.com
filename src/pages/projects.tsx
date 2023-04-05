import { PageProps, graphql } from "gatsby";
import React from "react";

import { Layout } from "../components/Layout";
import { ProjectGrid } from "../components/ProjectGrid";

export { Head } from "../components/Head";

export default function ProjectsPage(props: PageProps<Queries.ProjectsQuery>) {
  return (
    <Layout>
      <ProjectGrid nodes={props.data.allMarkdownRemark.nodes} />
    </Layout>
  );
};

export const query = graphql`
  query Projects {
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