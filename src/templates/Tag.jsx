import { graphql } from "gatsby";
import PropTypes from "prop-types";
import React from "react";
import styled from "styled-components";

import { Layout } from "../components/Layout";
import ProjectGrid from "../components/ProjectGrid";
import theme from "../theme";
import { rhythm } from "../typography";

export { Head } from "../components/Head";

const Header = styled.h1`
  ${theme.font.title}
  padding: ${rhythm(1 / 2)};
  display: flex;
`;

const Tag = styled.span`
  border-radius: 0.5em;
  border: 1px solid ${theme.link};
  color: ${theme.link};
  padding: 0 0.5em;
  margin-left: ${rhythm(1 / 4)};
`;

const TagTemplate = ({
  pageContext: { tag },
  data: {
    allMarkdownRemark: { nodes },
  },
}) => (
  <Layout>
    <Header>
      Projects tagged <Tag>{tag}</Tag>
    </Header>
    <ProjectGrid nodes={nodes} />
  </Layout>
);

TagTemplate.propTypes = {
  pageContext: PropTypes.shape({
    tag: PropTypes.string.isRequired,
  }),
};

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

export default TagTemplate;
