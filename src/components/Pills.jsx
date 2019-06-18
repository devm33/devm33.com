import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import theme from "../theme";
import { rhythm } from "../typography";

const Wrapper = styled.span`
  display: flex;
  flex-wrap: wrap;
  a:not(:last-child) {
    margin-right: ${rhythm(1 / 2)};
  }
  margin-bottom: -${rhythm(1 / 2)};
  a {
    margin-bottom: ${rhythm(1 / 2)};
    display: flex;
    white-space: nowrap;
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
    margin-left: ${rhythm(1 / 4)};
    ${theme.font.icon}
  }
`;

const Pills = ({ children }) => <Wrapper>{children}</Wrapper>;

Pills.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Pills;
