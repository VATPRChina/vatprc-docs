import * as React from "react";
import { graphql } from "gatsby";

const BlogPost = ({ data, children }) => {
  return <>{children}</>;
};

export const query = graphql`
  query ($id: String) {
    mdx(id: { eq: $id }) {
      id
    }
  }
`;

export default BlogPost;
