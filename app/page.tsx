const HomePage = async () => {
  return (
    <>
      <p>Aerodromes</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
      <p>Enroute</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
      <p>Terminal</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
    </>
  );
};

export default HomePage;
