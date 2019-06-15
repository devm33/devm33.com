import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import { theme, rhythm } from "../style";

const Wrapper = styled.span`
  display: flex;
  a:not(:last-child) {
    margin-right: ${rhythm(1 / 2)};
  }
  a {
    display: flex;
    align-items: center;
    border-radius: 0.5em;
    border: 1px solid ${theme.link};
    padding: 0 0.5em;
    &:active,
    &:hover {
      border-color: ${theme.accent};
      background-color: ${theme.accent};
      color: white !important; /* override global anchor style */
    }
  }
  a > svg {
    margin-left: ${rhythm(1 / 2)};
    ${theme.font.icon}
  }
`;

const Pills = ({ children }) => <Wrapper>{children}</Wrapper>;

Pills.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Pills;
