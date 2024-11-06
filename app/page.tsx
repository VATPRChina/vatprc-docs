import DocList from "./docs/page";

const HomePage = async () => {
  return (
    <div className="flex flex-col gap-y-4">
      <h1 className="text-3xl font-bold">Documents</h1>
      <div>
        <DocList />
      </div>
    </div>
  );
};

export default HomePage;
