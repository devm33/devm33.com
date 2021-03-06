/**
 * Meta component that sets page metadata such as social sharing info.
 */

import React from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";

import config from "../config";

const Meta = ({ description, lang, title, image, url }) => (
  <Helmet
    htmlAttributes={{
      lang,
    }}
    title={title}
    meta={[
      {
        name: `description`,
        content: description,
      },
      {
        property: `og:type`,
        content: `article`,
      },
      {
        property: `og:title`,
        content: title,
      },
      {
        property: `og:url`,
        content: `${config.siteUrl}${url}`,
      },
      {
        property: `og:description`,
        content: description,
      },
      {
        property: `og:image`,
        content: `${config.siteUrl}${image}`,
      },
      {
        name: `twitter:card`,
        content: `summary`,
      },
      {
        name: `twitter:site`,
        content: `@devm33`,
      },
      {
        property: `fb:app_id`,
        content: `477033866176272`,
      },
    ]}
  />
);

Meta.defaultProps = {
  lang: `en`,
  description: ``,
};

Meta.propTypes = {
  description: PropTypes.string,
  lang: PropTypes.string,
  title: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
};

export default Meta;
