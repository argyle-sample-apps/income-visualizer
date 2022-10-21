import { useProfile } from "hooks/use-profile";
import Link from "next/link";
import { Avatar } from "components/avatar";
import { Title } from "components/typography";

export const Header = () => {
  const { data: profile, isError: isProfileError } = useProfile();

  if (isProfileError) {
    return <div>An error occurred.</div>;
  }

  return (
    <div className="px-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="w-28">
          <Title>Income</Title>
        </div>
        <Link href="/settings">
          <a>
            <Avatar src={profile?.picture_url || ""} />
          </a>
        </Link>
      </div>
    </div>
  );
};
