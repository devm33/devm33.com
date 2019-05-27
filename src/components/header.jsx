import PropTypes from "prop-types"
import React from "react"
import styled from "styled-components"
import {
  FaGithub,
  FaLinkedin,
} from "react-icons/fa"
import { Link } from "gatsby"

const Wrapper = styled.header`
  display: flex;
  align-items: center;
  padding: 1rem 0;
  margin-bottom: 1.45rem;
  padding: 1.45rem 1.0875rem;
  a,
  a.visited {
    color: black;
    text-decoration: none;
    &:hover,
    &:focus {
      color: red;
      text-decoration: none;
    }
  }
`

const Nav = styled.nav`
  flex: 1;
  display: flex;
  justify-content: flex-start;
  a:not(:first-child) {
    margin-left: 1rem;
  }
`

const Name = styled.div`
  flex: 1;
  font-size: 1.25rem;
  font-weight: 700;
`

const IconLinks = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  font-size: 1.25rem;
  a:not(:first-child) {
    margin-left: 1rem;
  }
`

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
)

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
