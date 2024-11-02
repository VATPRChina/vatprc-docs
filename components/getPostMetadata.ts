import fs, { globSync } from "fs";
import matter from "gray-matter";
import { PostMetadata } from "../components/PostMetadata";
import path from "path";
import { glob } from "glob";

const getPostMetadata = async (prefix: string): Promise<PostMetadata[]> => {
  const files = await glob(`docs/${prefix}/**/*.md`);
  const markdownPosts = files.filter((file) => file.endsWith(".md"));

  // Get gray-matter data from each file.
  const posts = markdownPosts.map((fileName) => {
    const fileContents = fs.readFileSync(fileName, "utf8");
    const matterResult = matter(fileContents);
    return {
      title: matterResult.data.title ?? path.parse(fileName).name,
      date: matterResult.data.date,
      subtitle: matterResult.data.subtitle,
      slug: fileName.replace(".md", "").split("/"),
    };
  });

  return posts;
};

export default getPostMetadata;
