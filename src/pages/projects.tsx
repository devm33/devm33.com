import { PageProps, graphql } from "gatsby";
import React from "react";

import { Layout } from "@components/Layout";
import { ProjectList } from "@components/Project";

export { Head } from "@components/Head";

export default function ProjectsPage(props: PageProps<Queries.ProjectsQuery>) {
  return (
    <Layout>
      <ProjectList {...props.data.allMarkdownRemark} />
    </Layout>
  );
}

export const query = graphql`
  query Projects {
    allMarkdownRemark(sort: { frontmatter: { updated: DESC } }) {
      nodes {
        ...ProjectFields
      }
    }
  }
`;
