import React from "react";
import styled from "styled-components";

import theme from "../theme";
import Layout from "../components/Layout";

const Article = styled.article`
  max-width: ${theme.contentWidth}px;
  width: 80%;
  margin: 0 auto;
`;

const About = () => (
  <Layout>
    <Article>
      <h1>About</h1>
      <p>TODO: Create about page</p>
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
