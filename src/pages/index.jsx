import React from "react";
import styled from "styled-components";
import { graphql, Link } from "gatsby";
import { StaticImage } from "gatsby-plugin-image";

import theme from "../theme";
import Layout from "../components/Layout";

const Article = styled.article`
  max-width: ${theme.contentWidth}px;
  width: 80%;
  margin: 0 auto;
`;

const About = () => (
  <Layout url="/">
    <Article>
      <p>Hello! I&apos;m Devraj.</p>
      <StaticImage
        src="../images/me.jpg"
        alt="head shot"
        placeholder="blurred"
        layout="fixed"
        width={250}
        height={250}
      />
      <p>
        You can find me on <a href="https://www.linkedin.com/in/devrajmehta">LinkedIn</a> or{" "}
        <a href="https://github.com/devm33">GitHub</a>. See here for my <Link to="/resume/">resume</Link>.
      </p>
      <p />
      <p>
        This{" "}
        <a href="https://github.com/devm33/devm33.com">site&apos;s source</a> is
        on GitHub.
      </p>
      <p>
        Cheers! <br /> Devraj
      </p>
    </Article>
  </Layout>
);

export default About;