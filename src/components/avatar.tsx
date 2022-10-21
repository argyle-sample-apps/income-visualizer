type AvatarProps = {
  src: string;
};

export function Avatar({ src }: AvatarProps) {
  return (
    <div className="overflow-auto rounded-full border border-orange-dark p-[5px]">
      <img
        className="block h-[28px] w-[28px] rounded-full"
        src={src || "/income-visualizer/assets/bob-portrait.webp"}
        alt="User avatar"
      />
    </div>
  );
}
