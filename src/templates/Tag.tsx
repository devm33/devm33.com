import { PageProps, graphql } from "gatsby";
import React from "react";

import { Layout } from "../components/Layout";
import { pill } from "../components/Pill.module.css";
import { ProjectGrid } from "../components/ProjectGrid";
import { title, titlePill } from "./Tag.module.css";

export { Head } from "../components/Head";

interface PageContext {
  tag: string;
}

type Props = PageProps<Queries.TagPageQuery, PageContext>

export default function TagTemplate(props: Props) {
  return (
    <Layout>
      <h1 className={title}>
        Projects tagged
        <span className={`${pill} ${titlePill}`}>{props.pageContext.tag}</span>
      </h1>
      <ProjectGrid nodes={props.data.allMarkdownRemark.nodes} />
    </Layout>
  );
}

export const query = graphql`
  query TagPage($tag: String!) {
    allMarkdownRemark(
      filter: { frontmatter: { tags: { eq: $tag } } }
      sort: { frontmatter: { updated: DESC } }
    ) {
      nodes {
        ...ProjectGridFields
      }
    }
  }
`;
