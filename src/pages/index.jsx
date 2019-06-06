import React from "react";
import { graphql, Link } from "gatsby";
import styled from "styled-components";
import Img from "gatsby-image";

import Layout from "../components/layout";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  width: 100%;
`;

const Card = styled.div`
  position: relative;
  &:before {
    content: "";
    display: block;
    padding-top: 100%;
  }
`;

const Content = styled.div`
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
`;

const Title = styled.div`
  color: ${props => props.theme.link};
  &:hover {
    color: ${props => props.theme.accent};
  }
  font-size: 1.3rem;
  padding: 1rem 0;
  text-align: center;
  z-index: 1;
`;

const Subtitle = styled.div`
  color: ${props => props.theme.color};
  flex: 0;
  transition: flex 0.5s ease-in-out;
  overflow: hidden;
  color: ${props => props.theme.fg};
  font-size: 0.9rem;
  z-index: 1;
  div {
    padding: 0.5rem 1rem;
  }
`;

const Overlay = styled.div`
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  background: linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 255, 255, 0) 35%
  );
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  &:before {
    background-color: rgba(255, 255, 255, 0.9);
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: opacity 0.5s ease-in-out;
    opacity: 0;
  }
  &:hover {
    &:before {
      opacity: 1;
    }
    ${Subtitle} {
      flex: 0.5;
    }
  }
`;

const IndexPage = ({
  data: {
    allMarkdownRemark: { nodes }
  }
}) => (
  <Layout>
    <Wrapper>
      {nodes.map(node => (
        <Card key={node.fields.path}>
          <Content>
            <Img fluid={node.frontmatter.image.childImageSharp.fluid} />
            <Link to={node.fields.path}>
              <Overlay>
                <Title>{node.frontmatter.title}</Title>
                <Subtitle>
                  <div>{node.frontmatter.tagline}</div>
                  <div>
                    <i>Last updated: {node.frontmatter.updated}</i>
                  </div>
                </Subtitle>
              </Overlay>
            </Link>
          </Content>
        </Card>
      ))}
    </Wrapper>
  </Layout>
);

export const query = graphql`
  query IndexQuery {
    allMarkdownRemark(
      filter: { fields: { type: { eq: "projects" } } }
      sort: { fields: frontmatter___updated, order: DESC }
    ) {
      nodes {
        fields {
          path
        }
        frontmatter {
          title
          updated(formatString: "YYYY-MM-DD")
          tagline
          image {
            childImageSharp {
              fluid(maxWidth: 500, maxHeight: 500) {
                ...GatsbyImageSharpFluid_withWebp
              }
            }
          }
        }
      }
    }
  }
`;

export default IndexPage;
