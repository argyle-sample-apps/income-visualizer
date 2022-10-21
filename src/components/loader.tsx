export const Loader = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin">
        <img
          src={
            "https://res.cloudinary.com/argyle-media/image/upload/v1661963437/argyle-x/homepage/spinner.png"
          }
          alt="spinner"
          width="80"
          height="80"
          className="-scale-x-100 "
        />
      </div>
    </div>
  );
};

export const ChartLoader = () => {
  return (
    <div className="flex h-[284px] items-center justify-center">
      <div className="animate-pulse">
        <h4 className="text-lg">Gathering data from Argyle API</h4>
      </div>
    </div>
  );
};
