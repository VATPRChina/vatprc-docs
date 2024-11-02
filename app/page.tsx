import getPostMetadata from "../components/getPostMetadata";
import PostPreview from "../components/PostPreview";

const HomePage = async () => {
  const postPreviews1 = (await getPostMetadata("aerodromes")).map((post) => (
    <PostPreview key={post.slug.join("/")} {...post} />
  ));
  const postPreviews2 = (await getPostMetadata("enroute")).map((post) => (
    <PostPreview key={post.slug.join("/")} {...post} />
  ));
  const postPreviews3 = (await getPostMetadata("terminal_area")).map((post) => (
    <PostPreview key={post.slug.join("/")} {...post} />
  ));

  return (
    <>
      <p>Aerodromes</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {postPreviews1}
      </div>
      <p>Enroute</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {postPreviews2}
      </div>
      <p>Terminal</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {postPreviews3}
      </div>
    </>
  );
};

export default HomePage;
