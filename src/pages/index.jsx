import React from "react";
import { graphql, Link } from "gatsby";
import styled from "styled-components";
import Img from "gatsby-image";

import Layout from "../components/layout";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  width: 100%;
`;

const Card = styled.div``;

const IndexPage = ({ data }) => (
  <Layout>
    <Wrapper>
      {data.allMarkdownRemark.nodes.map(node => (
        <Card key={node.fields.path}>
          <Img fluid={node.frontmatter.image.childImageSharp.fluid} />
          <Link to={node.fields.path}>{node.frontmatter.title}</Link>
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
          image {
            childImageSharp {
              fluid(
                maxWidth: 850
                quality: 90
                traceSVG: { color: "#f3f3f3" }
              ) {
                ...GatsbyImageSharpFluid_withWebp_tracedSVG
              }
            }
          }
        }
      }
    }
  }
`;

export default IndexPage;
