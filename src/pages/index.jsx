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

const ImageWrapper = styled.div`
  > div {
    height: 100%;
    left: 0;
    position: absolute !important;
    top: 0;
    width: 100%;
    > div {
      position: static !important;
    }
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
    rgba(255, 255, 255, 0) 40%
  );
  transition: background 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  &:hover {
    background: rgba(255, 255, 255, 0.9);
  }
`;

const Title = styled.div`
  font-size: 1.3rem;
  padding: 1rem 0;
  text-align: center;
`;

const Subtitle = styled.div`
  flex: 0;
  transition: flex 0.5s ease-in-out;
  overflow: hidden;
  color: ${props => props.theme.secondary};
  font-style: italic;
  font-size: 0.9rem;
`;

const Content = styled.div`
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;

  &:hover {
    ${Subtitle} {
      flex: 0 1 auto;
      padding-bottom: 1rem;
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
            <ImageWrapper>
              <Img fluid={node.frontmatter.image.childImageSharp.fluid} />
            </ImageWrapper>
            <Link to={node.fields.path}>
              <Overlay>
                <Title>{node.frontmatter.title}</Title>
                <Subtitle>Last updated: {node.frontmatter.updated}</Subtitle>
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
          updated
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