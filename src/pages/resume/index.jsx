import React, { Fragment } from "react";
import styled from "styled-components";
import { graphql, Link } from "gatsby";

import Meta from "../../components/Meta";
import "../../reset.css";

const Wrapper = styled.div`
  font-family: Times-Roman, Times, "Liberation Serif", serif;
  font-size: 16px;
  max-width: 682px;
  margin: 10px auto 100px auto;
  @media print {
    @page {
      margin: 0;
    }
    margin-top: 30px;
    margin-bottom: 0;
  }
  a,
  a:visited {
    color: #00e;
  }
  h1 {
    font-size: 1.2em;
  }
  h4 {
    margin: 10px 0 5px 0;
  }
  table {
    width: 100%;
  }
`;

const Header = styled.header`
  display: flex;
  align-items: baseline;
  justify-content: space-around;
`;

const TrMeta = styled.tr`
  & > td:not(:first-child) {
    padding-left: 5px;
  }
`;
const TrDesc = styled.tr`
  & > td {
    padding-top: 5px;
    padding-bottom: 10px;
    line-height: 1.35em;
  }
`;
const TdRight = styled.td`
  text-align: right;
`;
const TdJustify = styled.td`
  text-align: justify;
  text-align-last: justify;
`;

const NoPrint = styled.div`
  @media print {
    display: none;
  }
`;

const TopLeft = styled(NoPrint)`
  position: fixed;
  top: 30px;
  left: 30px;
  @media (max-width: 950px) {
    display: none;
  }
`;

const Resume = ({
  data: {
    allJobsYaml: { nodes: jobs },
    resumeYaml: skills,
    site: {
      siteMetadata: { email },
    },
  },
}) => (
  <Wrapper>
    <Meta title="Devraj Mehta Resume" />
    <Header>
      <h1>
        <a href="https://www.linkedin.com/in/devrajmehta">Devraj Mehta</a>
      </h1>
      <h4>
        <a href={`mailto:${email}`}>{email}</a>
      </h4>
    </Header>
    <table>
      <tbody>
        <tr>
          <td colSpan="4">
            <h4>Work Experience</h4>
          </td>
        </tr>
        {jobs.map(job => (
          <Fragment key={job.id}>
            <TrMeta>
              <td>
                <a href={job.uri}>{job.name}</a>
              </td>
              <td>{job.title}</td>
              <td>
                <i>{job.location}</i>
              </td>
              <TdRight>
                {job.start} {job.finish && "– " + job.finish}
              </TdRight>
            </TrMeta>
            <TrDesc>
              <td colSpan="4">{job.description}</td>
            </TrDesc>
          </Fragment>
        ))}
        <tr>
          <td colSpan="4">
            <h4>Education</h4>
          </td>
        </tr>
        <TrMeta>
          <td>
            <a href="https://gatech.edu">Georgia Institute of Technology</a>
          </td>
          <td colSpan="2">
            <i>B.S. Computer Science, Highest Honors</i>
          </td>
          <TdRight>2010 – 2014</TdRight>
        </TrMeta>
        <TrMeta>
          <td colSpan="3">
            <a href="https://tjhsst.edu">
              Thomas Jefferson High School for Science and Technology
            </a>
          </td>
          <TdRight>2006 – 2010</TdRight>
        </TrMeta>
      </tbody>
    </table>
    <table>
      <tbody>
        <tr>
          <td colSpan="4">
            <h4>Skills</h4>
          </td>
        </tr>
        {Object.keys(skills).map(category => (
          <tr key={category}>
            <td>
              <i>{category}</i>
            </td>
            <TdJustify>{skills[category].join(", ")}</TdJustify>
          </tr>
        ))}
      </tbody>
    </table>
    <TopLeft>
      <Link to="/about">&larr; Back to site</Link>
      <br />
      <br />
      <a href="/resume.pdf">PDF Version</a>
    </TopLeft>
  </Wrapper>
);

export default Resume;

export const query = graphql`
  query {
    allJobsYaml {
      nodes {
        id
        uri
        name
        location
        description
        id
        title
        start
        finish
      }
    }
    resumeYaml {
      Languages
      Frameworks
      Platforms
      Tools
    }
    site {
      siteMetadata {
        email
      }
    }
  }
`;
