import React from "react";

import { Head as CommonHead } from "../components/Head";
import { Layout } from "../components/Layout";

export default function NotFoundPage() {
  return (
    <Layout>
      <article>
        <h1>Resource not found</h1>
        <p>Sorry this resource was not found.</p>
      </article>
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