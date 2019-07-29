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
      <p>Hello! I&apos;m Devraj,</p>
      <p>
        <Img
          fixed={data.fileName.childImageSharp.fixed}
          alt="photo of my face"
        />
      </p>
      <p>
        You can find me on <a href="https://github.com/devm33">LinkedIn</a> or{" "}
        <a href="https://www.linkedin.com/in/devrajmehta">GitHub</a>. My resume
        is <a href="/resume">here</a>.
      </p>
      <p />
      <p>
        This blog&apos;s source is also on GitHub:{" "}
        <a href="https://github.com/devm33/devm.dev">
          https://github.com/devm33/devm.dev
        </a>
      </p>
      <p>Feel free to reach me by email at anything at devm33.com</p>
      <p>
        Cheers! <br /> Devraj
      </p>
    </Article>
  </Layout>
);

export default About;

export const query = graphql`
  query {
    fileName: file(relativePath: { eq: "images/me.jpg" }) {
      childImageSharp {
        fixed(width: 250, height: 250) {
          ...GatsbyImageSharpFixed_withWebp
        }
      }
    }
  }
`;
