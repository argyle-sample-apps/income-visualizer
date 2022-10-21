type DebugProps = {
  children: any;
};

export const Debug = ({ children }: DebugProps) => {
  return (
    <div className="w-full bg-blue-50">
      <pre className="whitespace-pre-wrap text-xs">
        {JSON.stringify(children, null, 2)}
      </pre>
    </div>
  );
};
