import prisma from "@/lib/prisma";

const Page = async ({
  params,
}: {
  params: Promise<{ interviewId: string }>;
}) => {
  const { interviewId } = await params;

  const interview = await prisma.interview.findUnique({
    where: { interviewId },
  });

  if (!interview) {
    return <div>Error: Interview not found for interviewId {interviewId}</div>;
  }

  return (
    <div>
      <h1>Interview Details</h1>
      <p>Interview ID: {interviewId}</p>
    </div>
  );
};

export default Page;
