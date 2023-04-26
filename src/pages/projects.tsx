import { PageProps, graphql } from "gatsby";
import React from "react";

import { Layout } from "@components/Layout";
import { Project } from "@components/Project";

export { Head } from "@components/Head";

export default function ProjectsPage(props: PageProps<Queries.ProjectsQuery>) {
  return (
    <Layout>
      {props.data.allMarkdownRemark.nodes.map((node) => (
        <Project key={node.fields.path} project={node} />
      ))}
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
