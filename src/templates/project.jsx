import React from "react";
import { graphql } from "gatsby";

import Layout from "../components/Layout";

const Template = ({
  data: {
    markdownRemark: { frontmatter, html }
  }
}) => (
  <Layout title={frontmatter.title}>
    <h1>{frontmatter.title}</h1>
    <div>Last updated: {frontmatter.updated}</div>
    <div
      className="blog-post-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  </Layout>
);

export const query = graphql`
  query($path: String!) {
    markdownRemark(fields: { path: { eq: $path } }) {
      html
      frontmatter {
        title
        updated
      }
    }
  }
`;

export default Template;
