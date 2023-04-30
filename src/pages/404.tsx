import React from "react";

import { createHeadWithTitle } from "@components/Head";
import { Layout } from "@components/Layout";

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

export const Head = createHeadWithTitle("404: Not found");
