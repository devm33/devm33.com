import React from "react";
import styled from "styled-components";
import { graphql, Link } from "gatsby";
import Img from "gatsby-image";

import theme from "../theme";
import Layout from "../components/Layout";

const Article = styled.article`
  max-width: ${theme.contentWidth}px;
  width: 80%;
  margin: 0 auto;
`;

const About = ({
  data: {
    site: {
      siteMetadata: { email },
    },
    fileName: {
      childImageSharp: { fixed },
    },
  },
}) => (
  <Layout>
    <Article>
      <h1>About</h1>
      <p>Hello! I&apos;m Devraj.</p>
      <Img fixed={fixed} alt="photo of my face" />
      <p>
        You can find me on <a href="https://github.com/devm33">LinkedIn</a> or{" "}
        <a href="https://www.linkedin.com/in/devrajmehta">GitHub</a>. My resume
        is <Link to="/resume/">here</Link>.
      </p>
      <p />
      <p>
        This{" "}
        <a href="https://github.com/devm33/devm33.com">site&apos;s source</a> is
        on GitHub.
      </p>
      <p>
        Feel free to reach me by email at{" "}
        <a href={`mailto:${email}`}>{email}</a>
      </p>
      <p>
        Cheers! <br /> Devraj
      </p>
    </Article>
  </Layout>
);

export default About;

export const query = graphql`
  query {
    site {
      siteMetadata {
        email
      }
    }
    fileName: file(relativePath: { eq: "images/me.jpg" }) {
      childImageSharp {
        fixed(width: 250, height: 250) {
          ...GatsbyImageSharpFixed_withWebp
        }
      }
    }
  }
`;
