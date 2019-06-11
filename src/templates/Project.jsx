import React from "react";
import { graphql } from "gatsby";
import styled from "styled-components";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

import "katex/dist/katex.min.css";

import Layout from "../components/Layout";

const Article = styled.article`
  margin: 0 auto;
  width: 80%;
  max-width: 700px;
`;

const Subtitle = styled.div`
  margin-top: 0.5rem;
  font-size: ${props => props.theme.font.small};
`;

const Updated = styled.span`
  font-style: italic;
`;

const Links = styled.span`
  a {
    margin-left: 1rem;
    border-radius: 0.5em;
    border: 1px solid ${props => props.theme.link};
    padding: 0.2em 0.5em;
    &:hover {
      border-color: ${props => props.theme.accent};
      background-color: ${props => props.theme.accent};
      color: white !important;
    }
  }
  a > svg {
    margin-left: 0.5rem;
    font-size: ${props => props.theme.font.icon};
    /* Sad hack for alignment with text: */
    position: relative;
    top: 4px;
  }
`;

const Project = styled.div`
  margin-top: 1rem;
`;

const ProjectTemplate = ({
  data: {
    markdownRemark: { frontmatter, html }
  }
}) => (
  <Layout title={frontmatter.title}>
    <Article>
      <header>
        <h1>{frontmatter.title}</h1>
        <Subtitle>
          <Updated>Last updated {frontmatter.updated}</Updated>
          <Links>
            <a href={frontmatter.repo}>
              Source
              <FaGithub />
            </a>
            <a href={frontmatter.link}>
              Link to project
              <FaExternalLinkAlt />
            </a>
          </Links>
        </Subtitle>
      </header>
      <Project dangerouslySetInnerHTML={{ __html: html }} />
    </Article>
  </Layout>
);

export const query = graphql`
  query($path: String!) {
    markdownRemark(fields: { path: { eq: $path } }) {
      html
      frontmatter {
        title
        updated(formatString: "YYYY-MM-DD")
        tags
        link
        repo
      }
    }
  }
`;

export default ProjectTemplate;
