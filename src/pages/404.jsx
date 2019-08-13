import React from "react";

import Layout from "../components/Layout";

const NotFoundPage = () => (
  <Layout title="404: Not found" url="/404.html">
    <h1>Resource not found</h1>
    <p>Sorry this resource was not found.</p>
  </Layout>
);

export default NotFoundPage;
