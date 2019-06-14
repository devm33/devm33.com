import React from "react";
import { Link, graphql } from "gatsby";
import styled from "styled-components";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

import "katex/dist/katex.min.css";
import "prismjs/themes/prism-solarizedlight.css";

import { theme } from "../style";
import Layout from "../components/Layout";

const Article = styled.article`
  margin: 0 auto;
  width: 80%;
  max-width: 700px;
`;

const Subtitle = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  margin: -0.25rem -0.25rem;
  ${theme.font.small}
`;

const Project = styled.div`
  margin-top: 0.5rem;
`;

const Updated = styled.span`
  font-style: italic;
  margin: 0.25rem;
`;

const Links = styled.span`
  display: flex;
  margin: 0.25rem;
  a:not(:last-child) {
    margin-right: 0.5rem;
  }
  a {
    display: flex;
    align-items: center;
    border-radius: 0.5em;
    border: 1px solid ${theme.link};
    padding: 0.2em 0.5em;
    &:active,
    &:hover {
      border-color: ${theme.accent};
      background-color: ${theme.accent};
      color: white !important;
    }
  }
  a > svg {
    margin-left: 0.5rem;
    ${theme.font.icon}
  }
`;

const ProjectTemplate = ({
  data: {
    markdownRemark: { frontmatter, html },
  },
}) => (
  <Layout title={frontmatter.title}>
    <Article>
      <header>
        <h1>{frontmatter.title}</h1>
        <Subtitle>
          <Updated>Last updated {frontmatter.updated}</Updated>
          <Links>
            <a href={frontmatter.repo} aria-label="GitHub repo">
              Source
              <FaGithub />
            </a>
            <a href={frontmatter.link} aria-label="Project demo">
              Demo
              <FaExternalLinkAlt />
            </a>
          </Links>
          <Links>
            {frontmatter.tags.map(tag => (
              <Link key={tag} to={`/tag/${tag}`}>
                {tag}
              </Link>
            ))}
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
