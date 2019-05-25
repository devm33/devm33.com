/**
 * Meta component that sets page metadata such as social sharing info.
 */

import React from "react"
import PropTypes from "prop-types"
import Helmet from "react-helmet"

const Meta = ({ description, lang, title }) => (
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
        property: `og:type`,
        content: `website`,
      },
      {
        name: `twitter:card`,
        content: `summary`,
      },
      {
        name: `twitter:title`,
        content: title,
      },
      {
        name: `twitter:description`,
        content: description,
      },
    ]}
  />
)

Meta.defaultProps = {
  lang: `en`,
  description: ``,
}

Meta.propTypes = {
  description: PropTypes.string,
  lang: PropTypes.string,
  title: PropTypes.string.isRequired,
}

export default Meta
