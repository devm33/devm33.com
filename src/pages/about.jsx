import React from "react";
import styled from "styled-components";
import { graphql } from "gatsby";
import Img from "gatsby-image";

import theme from "../theme";
import Layout from "../components/Layout";

const Article = styled.article`
  max-width: ${theme.contentWidth}px;
  width: 80%;
  margin: 0 auto;
`;

const About = ({ data }) => (
  <Layout>
    <Article>
      <h1>About</h1>
      <p>Hello! I&apos;m Devraj</p>
      <Img fixed={data.fileName.childImageSharp.fixed} alt="" />
      <p>
        This blog&apos;s source:{" "}
        <a href="https://github.com/devm33/devm.dev">
          https://github.com/devm33/devm.dev
        </a>
      </p>
    </Article>
  </Layout>
);

export default About;

export const query = graphql`
  query {
    fileName: file(relativePath: { eq: "me.jpg" }) {
      childImageSharp {
        fixed(width: 300, height: 300) {
          ...GatsbyImageSharpFixed
        }
      }
    }
  }
`;
