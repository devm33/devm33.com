import { Actions, CreatePagesArgs } from "gatsby";
import path from "path";

const ProjectTemplate = path.resolve("src/templates/Project.tsx");
const TagTemplate = path.resolve("src/templates/Tag.tsx");
const NavbarTemplate = path.resolve("src/templates/Navbar.tsx");
const query = /* GraphQL */ `
  query CreatePages {
    projects: allMarkdownRemark {
      nodes {
        id
        fields {
          path
        }
        frontmatter {
          tags
          title
          tagline
          image {
            childImageSharp {
              gatsbyImageData(width: 1000)
            }
          }
        }
      }
    }
    katexProjects: allMarkdownRemark(filter: { html: { regex: "/katex/" } }) {
      nodes {
        id
      }
    }
    tags: allMarkdownRemark {
      distinct(field: { frontmatter: { tags: SELECT } })
    }
  }
`;

export async function createPages(args: CreatePagesArgs) {
  const result = await args.graphql<Queries.CreatePagesQuery>(query);
  if (result.errors || !result.data) {
    args.reporter.panicOnBuild("Error while running GraphQL query.");
    return;
  }
  addProjectPages(args.actions, result.data);
  addTagPages(args.actions, result.data);
  addRedirects(args.actions);
  addSlices(args.actions);
}

function addProjectPages(actions: Actions, data: Queries.CreatePagesQuery) {
  const katex = new Set(data.katexProjects.nodes.map((node) => node.id));
  for (const node of data.projects.nodes) {
    actions.createPage({
      path: node.fields.path,
      component: ProjectTemplate,
      context: {
        title: node.frontmatter.title,
        description: node.frontmatter.tagline,
        image: node.frontmatter.image,
        katex: katex.has(node.id),
      },
    });
  }
}

function addTagPages(actions: Actions, data: Queries.CreatePagesQuery) {
  for (const tag of data.tags.distinct) {
    actions.createPage({
      path: `/tag/${tag}/`,
      component: TagTemplate,
      context: { tag, title: `Projects tagged ${tag}` },
    });
  }
}

function addRedirects(actions: Actions) {
  const redirect = (fromPath: string, toPath: string) =>
    actions.createRedirect({ fromPath, toPath, isPermanent: true });
  // Redirects for previous blog site urls.
  redirect("/2015-06-07", "/projects/4clojure/");
  redirect("/2014-12-04", "/projects/motivation/");
  redirect("/2014-09-22", "/projects/jekyll-nfs/");
  redirect("/sitemap.xml", "/sitemap-index.xml");
  redirect("/about", "/");
  // Redirect for resume pdf short-link
  redirect("/resume.pdf", "/devraj_mehta_resume.pdf");
  // External shortlinks
  redirect("/3d", "https://makerworld.com/@devm33");
}

function addSlices(actions: Actions) {
  actions.createSlice({ id: "navbar", component: NavbarTemplate });
}
