import PropTypes from "prop-types";
import React from "react";
import { graphql } from "gatsby";
import styled from "styled-components";

import Layout from "../components/Layout";
import ProjectGrid from "../components/ProjectGrid";

const Header = styled.h1`
  font-size: 1.3rem;
  padding: 1rem;
`;

const Tag = styled.span`
  border-radius: 0.5em;
  border: 1px solid ${props => props.theme.link};
  color: ${props => props.theme.link};
  padding: 0.2em 0.5em;
`;

const Template = ({
  pageContext: { tag },
  data: {
    allMarkdownRemark: { nodes }
  }
}) => (
  <Layout title={tag}>
    <Header>
      Projects tagged <Tag>{tag}</Tag>
    </Header>
    <ProjectGrid nodes={nodes} />
  </Layout>
);

Template.propTypes = {
  pageContext: PropTypes.shape({
    tag: PropTypes.string.isRequired
  })
};

export const query = graphql`
  query($tag: String!) {
    allMarkdownRemark(
      filter: {
        fields: { type: { eq: "projects" } }
        frontmatter: { tags: { eq: $tag } }
      }
      sort: { fields: frontmatter___updated, order: DESC }
    ) {
      nodes {
        ...ProjectGridFields
      }
    }
  }
`;

export default Template;
