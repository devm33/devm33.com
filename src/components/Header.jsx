import React from "react";
import styled from "styled-components";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Link } from "gatsby";
import { useStaticQuery, graphql } from "gatsby";

import theme from "../theme";
import { rhythm } from "../typography";

const Wrapper = styled.header`
  display: flex;
  align-items: center;
  padding: ${rhythm(1 / 2)};
`;

// TODO collapse Nav on mobile.
const Nav = styled.nav`
  flex: 1;
  display: flex;
  justify-content: flex-start;
`;

const Name = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  ${theme.font.title}
  @media ${theme.break.s} {
    ${theme.font.subtitle}
  }
`;

const IconLinks = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  a:not(:first-child) {
    margin-left: ${rhythm(1 / 2)};
  }
  ${theme.font.icon};
`;

export const Header = () => {
  const { site } = useStaticQuery(
    graphql`
      query HeaderQuery {
        site {
          siteMetadata {
            title
          }
        }
      }
    `
  );
  return (
    <Wrapper>
      <Nav>
        <Link to="/projects/">Projects</Link>
      </Nav>
      <Name>
        <Link to="/">{site.siteMetadata.title}</Link>
      </Name>
      <IconLinks>
        <a href="https://github.com/devm33" aria-label="GitHub profile">
          <FaGithub />
        </a>
        <a
          href="https://www.linkedin.com/in/devrajmehta/"
          aria-label="LinkedIn profile"
        >
          <FaLinkedin />
        </a>
      </IconLinks>
    </Wrapper>
  );
};