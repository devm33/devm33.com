/**
 * Meta component that sets page metadata such as social sharing info.
 */

import React from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";

import config from "../config";

const Meta = ({ description, lang, title, image }) => (
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
        property: `og:title`,
        content: title,
      },
      {
        property: `og:description`,
        content: description,
      },
      {
        property: `og:image `,
        content: `${config.siteUrl}${image}`,
      },
      {
        property: `og:type`,
        content: `website`,
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
        name: `fb:app_id`,
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
};

export default Meta;
