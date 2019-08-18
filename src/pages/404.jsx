import React from "react";
import styled from "styled-components";

import theme from "../theme";
import Layout from "../components/Layout";

const Article = styled.article`
  max-width: ${theme.contentWidth}px;
  width: 80%;
  margin: 0 auto;
`;

const NotFoundPage = () => (
  <Layout title="404: Not found" url="/404.html">
    <Article>
      <h1>Resource not found</h1>
      <p>Sorry this resource was not found.</p>
    </Article>
  </Layout>
);

export default NotFoundPage;
