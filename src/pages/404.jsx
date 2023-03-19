import React from "react";
import styled from "styled-components";

import Layout from "../components/Layout";
import theme from "../theme";
import { Head as CommonHead } from "../components/Head";

const Article = styled.article`
  max-width: ${theme.contentWidth}px;
  width: 80%;
  margin: 0 auto;
`;

export default function NotFoundPag() {
  return (
    <Layout>
      <Article>
        <h1>Resource not found</h1>
        <p>Sorry this resource was not found.</p>
      </Article>
    </Layout>
  );
}

export function Head({ pageContext, ...rest }) {
  const props = {
    ...rest,
    pageContext: {
      ...pageContext,
      title: '404: Not found',
    },
  };
  return <CommonHead {...props} />;
}