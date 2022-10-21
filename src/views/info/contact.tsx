import { Heading } from "components/typography";
import { DataPoint } from "components/data-point";
import { useProfile } from "hooks/use-profile";

export function ContactInfo() {
  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useProfile();

  if (isProfileLoading) {
    return (
      <div className="grid animate-pulse gap-10">
        {[1, 2].map((el) => (
          <div key={el}>
            <div className="mb-2 h-3 w-20 rounded-full bg-gray-200"></div>
            <div className="h-4 w-32 rounded-full bg-gray-200"></div>
          </div>
        ))}
      </div>
    );
  }

  if (isProfileError) {
    return <div>An error has occurred. Try again</div>;
  }

  return (
    <>
      <Heading className="mb-6">Contact information</Heading>
      <DataPoint label="Phone number" value={profile.phone_number} />
      <DataPoint label="Email address" value={profile.email} />
    </>
  );
}
