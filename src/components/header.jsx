import PropTypes from "prop-types";
import React from "react";
import styled from "styled-components";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Link } from "gatsby";

const Wrapper = styled.header`
  display: flex;
  align-items: center;
  padding: 1rem;
  font-size: 1.12rem;
  a,
  a.visited {
    color: ${props => props.theme.fg};
    transition: color 0.3s ease-in-out;
    text-decoration: none;
    &:hover,
    &:focus {
      color: ${props => props.theme.accent};
      text-decoration: none;
    }
  }
`;

const Nav = styled.nav`
  flex: 1;
  display: flex;
  justify-content: flex-start;
  a:not(:first-child) {
    margin-left: 1rem;
  }
`;

const Name = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
`;

const IconLinks = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  a:not(:first-child) {
    margin-left: 1rem;
  }
`;

const Header = ({ siteTitle }) => (
  <Wrapper>
    <Nav>
      <Link to="/about">About</Link>
    </Nav>
    <Name>
      <Link to="/">{siteTitle}</Link>
    </Name>
    <IconLinks>
      <a href="https://githhub.com/devm33">
        <FaGithub />
      </a>
      <a href="https://www.linkedin.com/in/devrajmehta/">
        <FaLinkedin />
      </a>
    </IconLinks>
  </Wrapper>
);

Header.propTypes = {
  siteTitle: PropTypes.string
};

Header.defaultProps = {
  siteTitle: ``
};

export default Header;
