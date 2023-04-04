import { graphql } from "gatsby";
import React from "react";

import { Layout } from "../components/Layout";
import { pill } from "../components/Pill.module.css";
import ProjectGrid from "../components/ProjectGrid";
import { title, titlePill } from "./Tag.module.css";

export { Head } from "../components/Head";

export default function TagTemplate({ data, pageContext }) {
  return (
    <Layout>
      <h1 className={title}>
        Projects tagged
        <span className={`${pill} ${titlePill}`}>{pageContext.tag}</span>
      </h1>
      <ProjectGrid nodes={data.allMarkdownRemark.nodes} />
    </Layout>
  );
}

export const query = graphql`
  query($tag: String!) {
    allMarkdownRemark(
      filter: {
        fields: { type: { eq: "projects" } }
        frontmatter: { tags: { eq: $tag } }
      }
      sort: {frontmatter: {updated: DESC}}
    ) {
      nodes {
        ...ProjectGridFields
      }
    }
  }
`;
