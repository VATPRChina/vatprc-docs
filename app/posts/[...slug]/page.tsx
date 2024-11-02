import fs from "fs";
import Markdown from "markdown-to-jsx";
import matter from "gray-matter";
import getPostMetadata from "../../../components/getPostMetadata";
import type { InferGetStaticPropsType, GetStaticProps } from "next";

const getPostContent = (slug: string[]) => {
  const folder = "docs/";
  const file = `${slug.join("/")}.md`;
  const content = fs.readFileSync(file, "utf8");
  const matterResult = matter(content);
  return matterResult;
};

export const generateStaticParams = async () => {
  const posts1 = await getPostMetadata("aerodromes");
  const posts2 = await getPostMetadata("enroute");
  const posts3 = await getPostMetadata("terminal_area");
  return [...posts1, ...posts2, ...posts3].map((post) => ({
    slug: post.slug,
  }));
};

const PostPage = async (props: any) => {
  const slug = props.params.slug;
  const post = getPostContent(slug);
  return (
    <div>
      <div className="my-12 text-center">
        <h1 className="text-2xl text-slate-600 ">{post.data.title}</h1>
        <p className="text-slate-400 mt-2">{post.data.date}</p>
      </div>

      <article className="prose">
        <Markdown>{post.content}</Markdown>
      </article>
    </div>
  );
};

export default PostPage;
