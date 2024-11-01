import { createFilePath } from "gatsby-source-filesystem";

/**
 * @param {import("gatsby").CreateNodeArgs} param0
 */
export const onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions;
  // Ensures we are processing only markdown files
  if (node.internal.type === "Mdx") {
    // Use `createFilePath` to turn markdown files in our `src/content` directory into `/blog/slug`
    const relativeFilePath = createFilePath({
      node,
      getNode,
      // basePath: "../docs",
    });

    // Creates new query'able field with name of 'slug'
    createNodeField({
      node,
      name: "slug",
      value: `docs/${relativeFilePath}`,
    });
  }
};
